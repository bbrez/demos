<script lang="ts">
	import type { PageData } from './$types';

	import { Link } from 'lucide-svelte';

	import Highlight, { LineNumbers } from 'svelte-highlight';
	import javascript from 'svelte-highlight/languages/javascript';
	import 'svelte-highlight/styles/mocha.css';

	let canvas: HTMLCanvasElement;

	const height = 400;
	const width = 400;

	let numberOfPoints = $state(20);
	let saturation = $state(60);
	let value = $state(80);

	let points = $derived(generatePoints(numberOfPoints));

	function sortByDistanceFromCenter(points: number[][]) {
		const center = [width / 2, height / 2];
		return points.sort((a, b) => {
			const distanceA = Math.hypot(a[0] - center[0], a[1] - center[1]);
			const distanceB = Math.hypot(b[0] - center[0], b[1] - center[1]);
			return distanceA - distanceB;
		});
	}

	function generateColor(index: number, total: number) {
		const hue = (index / total) * 365;
		return hsvToRgb(hue, saturation / 100, value / 100);
	}

	function generatePoints(count: number) {
		return sortByDistanceFromCenter(
			Array.from({ length: count }, () => [Math.random() * width, Math.random() * height])
		);
	}

	function hsvToRgb(hue: number, saturation: number, value: number) {
		const chroma = value * saturation;
		const huePrime = hue / 60;
		const x = chroma * (1 - Math.abs((huePrime % 2) - 1));
		let r = 0;
		let g = 0;
		let b = 0;
		if (huePrime >= 0 && huePrime <= 1) {
			r = chroma;
			g = x;
		} else if (huePrime >= 1 && huePrime <= 2) {
			r = x;
			g = chroma;
		} else if (huePrime >= 2 && huePrime <= 3) {
			g = chroma;
			b = x;
		} else if (huePrime >= 3 && huePrime <= 4) {
			g = x;
			b = chroma;
		} else if (huePrime >= 4 && huePrime <= 5) {
			r = x;
			b = chroma;
		} else if (huePrime >= 5 && huePrime <= 6) {
			r = chroma;
			b = x;
		}
		const m = value - chroma;
		r += m;
		g += m;
		b += m;
		return [r * 255, g * 255, b * 255];
	}

	$effect(() => {
		if (canvas === null) return;
		const ctx = canvas.getContext('2d');
		if (ctx === null) return;
		// Clear the canvas
		ctx.clearRect(0, 0, width, height);

		// Create the voronoi diagram
		const imageData = ctx.createImageData(width, height);
		const data = imageData.data;

		// Generate the regions
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				const distances = points.map(([px, py]) => Math.hypot(px - x, py - y));
				const minDistance = Math.min(...distances);
				const minIndex = distances.indexOf(minDistance);
				const [r, g, b] = generateColor(minIndex, points.length);
				const index = (y * width + x) * 4;
				data[index] = r;
				data[index + 1] = g;
				data[index + 2] = b;
				data[index + 3] = 255; // alpha
			}
		}

		ctx.putImageData(imageData, 0, 0);

		// Display the points
		points.forEach(([x, y]) => {
			ctx.beginPath();
			ctx.arc(x, y, 2, 0, 2 * Math.PI);
			ctx.fill();
		});
	});

	let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto my-16 grid place-items-center font-serif">
	<div>
		<h1 class="text-4xl font-bold">Voronoi Diagrams</h1>
		<div class="flex flex-row gap-6">
			<div class="max-w-[90ch] text-justify">
				<section class="mb-6">
					<h2 id="intro" class="group relative text-2xl font-semibold">
						<Link class="invisible absolute -left-5 top-1/4 inline group-hover:visible" size={12} />
						<a href="#intro" class="group-hover:underline"> Introduction </a>
					</h2>
					<p>Todo</p>
				</section>
				<section class="mb-6">
					<h2 id="history" class="group relative text-2xl font-semibold">
						<Link class="invisible absolute -left-5 top-1/4 inline group-hover:visible" size={12} />
						<a href="#history" class="group-hover:underline"> History </a>
					</h2>
					<p>Todo</p>
				</section>
				<section class="mb-6">
					<h2 id="generation" class="group relative text-2xl font-semibold">
						<Link class="invisible absolute -left-5 top-1/4 inline group-hover:visible" size={12} />
						<a href="#generation" class="group-hover:underline"> Generation </a>
					</h2>
					<p class="mb-4 indent-4">
						Generating a Voronoi Diagram is a very simple task as long as you are content in using
						the most naive approach, that is, checking each pixel for it's closest seed and coloring
						it according to that point's color. This algorithm can easily be expressed with the
						following JavaScript code:
					</p>
					<details class="mb-4">
						<summary class="cursor-pointer">
							Click to open ({data.code.split('\n').length} lines)
						</summary>
						<Highlight language={javascript} code={data.code} let:highlighted>
							<LineNumbers {highlighted} />
						</Highlight>
					</details>
					<p class="mb-3 indent-4">
						This is almost the same JavaScript code running for the demonstration on this page, the
						main changes being related to Svelte, how the arguments are aquired and the color
						generating function, as the one one running on the page uses HSV with a conversion
						function to RGB (source available on
						<a
							href="https://github.com/bbrez/demos/blob/master/src/routes/voronoi/%2Bpage.svelte"
							target="_blank"
							class="underline"
						>
							Github
						</a>). Note that the generation of the seed points is not included, but it is a simple
						array of (x, y) points generated randomly.
					</p>
					<p class="mb-3 indent-4">
						As far as Voronoi diagram generation goes, this is a very simplistic implementation, and
						as such carries with it the downside of also being very slow. This lack of performance
						can be observed by increasing the number of points, noting that the maximum amount of
						points I enabled (100), takes about 800ms on my computer to generate, while lower
						amounts, such as the default 20, take only 200ms from click to render.
					</p>
					<p class="mb-3 indent-4">
						More interesting visualizations can be achieved by taking this approach and changing
						something about it, for example, one could iterate over the pixels by proximity from a
						point, displaying a frame each time the distance from the pixels to the point increases
						by a defined amount. That would create an animation of the influence area of each point
						growing around its seed.
					</p>
					<p class="mb-3 indent-4"></p>
				</section>
				<section class="mb-6">
					<h2 id="history" class="group relative text-2xl font-semibold">
						<Link class="invisible absolute -left-5 top-1/4 inline group-hover:visible" size={12} />
						<a href="#applications" class="group-hover:underline"> Applications </a>
					</h2>
					<p>Todo</p>
				</section>
				<section class="mb-6">
					<h2 id="art" class="group relative text-2xl font-semibold">
						<Link class="invisible absolute -left-5 top-1/4 inline group-hover:visible" size={12} />
						<a href="#art" class="group-hover:underline"> As a form of art </a>
					</h2>
					<p>Todo</p>
				</section>
				<section class="mb-6">
					<h2 id="history" class="group relative text-2xl font-semibold">
						<Link class="invisible absolute -left-5 top-1/4 inline group-hover:visible" size={12} />
						<a href="#sources" class="group-hover:underline"> Sources </a>
					</h2>
					<p>Todo</p>
				</section>
			</div>
			<div class="relative">
				<div class="sticky top-2 flex flex-col">
					<canvas class="border border-black" {height} {width} bind:this={canvas}></canvas>
					<div class="flex flex-row justify-between gap-3">
						<div>
							<label class="block" for="points">Number of points</label>
							<input
								id="points"
								type="number"
								min="1"
								max="30"
								bind:value={numberOfPoints}
								class="rounded border px-2 py-1"
							/>
						</div>
						<div>
							<label class="block" for="saturation">Saturation</label>
							<input
								id="saturation"
								type="number"
								min="0"
								max="100"
								bind:value={saturation}
								class="rounded border px-2 py-1"
							/>
						</div>
						<div>
							<label class="block" for="lightness">Value</label>
							<input
								id="lightness"
								type="number"
								min="0"
								max="100"
								bind:value
								class="rounded border px-2 py-1"
							/>
						</div>
						<div class="grid">
							<button
								class="self-end rounded border px-2 py-1"
								onclick={() => {
									numberOfPoints = numberOfPoints + 1;
									numberOfPoints = numberOfPoints - 1;
								}}
							>
								Generate
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

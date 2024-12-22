<script lang="ts">
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
</script>

<div class="container mx-auto grid min-h-svh place-items-center font-serif">
	<div>
		<h1 class="text-2xl font-semibold">Voronoi Diagram</h1>
		<div class="flex flex-row gap-2">
			<div class="flex flex-col">
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
			<div class="max-w-prose text-justify">
				<p class="mb-3 indent-4">
					A Voronoi diagram is a partitioning of a plane into regions based on the distance to a
					specific set of points. It is named after Georgy Voronoy, and is also known as a Voronoi
					tessellation, a Voronoi decomposition, a Voronoi partition, or a Dirichlet tessellation.
				</p>
				<p class="mb-3 indent-4">
					In this example, we generate a set of random points and calculate the distance from each
					pixel to the closest point. We then color each pixel based on the color of the closest
					point.
				</p>
			</div>
		</div>
	</div>
</div>

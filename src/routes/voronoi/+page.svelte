<script lang="ts">
	let canvas: HTMLCanvasElement;

	const height = 500;
	const width = 500;

	let numberOfPoints = $state(10);
	let saturation = $state(60);
	let value = $state(80);

	let points = $derived(generatePoints(numberOfPoints));

	function generatePoints(count: number) {
		return Array.from({ length: count }, () => [Math.random() * width, Math.random() * height]);
	}

	function generateColor(index: number, total: number) {
		const hue = (index / total) * 360;
		return `rgb(${hsvToRgb(hue, saturation / 100, value / 100).join(',')})`;
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

		// Display the points
		points.forEach(([x, y]) => {
			ctx.beginPath();
			ctx.arc(x, y, 2, 0, 2 * Math.PI);
			ctx.fill();
		});

		// Create the voronoi diagram
		const imageData = ctx.createImageData(width, height);
		const data = imageData.data;

		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				const distances = points.map(([px, py]) => Math.hypot(px - x, py - y));
				const minDistance = Math.min(...distances);
				const minIndex = distances.indexOf(minDistance);
				const [r, g, b] = hsvToRgb((minIndex / points.length) * 360, saturation / 100, value / 100);
				const index = (y * width + x) * 4;
				data[index] = r;
				data[index + 1] = g;
				data[index + 2] = b;
				data[index + 3] = 255; // alpha
			}
		}

		ctx.putImageData(imageData, 0, 0);
	});
</script>

<div class="container mx-auto grid min-h-svh place-items-center">
	<div>
		<h1>Voronoi Diagram</h1>
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
			</div>
		</div>
	</div>
</div>

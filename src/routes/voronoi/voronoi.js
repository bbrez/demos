function Voronoi(points, canvas, width, height) {
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
      const distances = points.map(([px, py]) =>
        Math.hypot(px - x, py - y));
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
}

function generateColor(index, total) {
  const hue = (index / total) * 365;
  return `hsl(${hue}, 0.6, 0.8)`;
}

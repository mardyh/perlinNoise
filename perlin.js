// perlin.js
window.addEventListener('DOMContentLoaded', () => {
	const canvas = document.getElementById('noiseCanvas');
	const ctx    = canvas.getContext('2d');
	const w      = canvas.width;
	const h      = canvas.height;

	const simplex = new SimplexNoise();
	const scale   = 0.01;
	const zSpeed  = 0.002;
	let   zTime   = 0;

	function drawNoise() 
	{
		const img = ctx.createImageData(w, h);
		const d   = img.data;

    for (let y = 0; y < h; y++) 
	{
		for (let x = 0; x < w; x++) 
		{
			let v = simplex.noise3D(x * scale, y * scale, zTime);
			let c = ((v * 0.5 + 0.5) * 255) | 0;
			let i = (y * w + x) * 4;
			d[i] = d[i+1] = d[i+2] = c;
			d[i+3] = 255;
		}
    }
    ctx.putImageData(img, 0, 0);

    zTime += zSpeed;
    requestAnimationFrame(drawNoise);
  }

  drawNoise();
});
// perlin.js
window.addEventListener('DOMContentLoaded', () => {
  // 1) grab the canvas you just created in HTML
  const canvas = document.getElementById('noiseCanvas');
  const ctx    = canvas.getContext('2d');
  const w      = canvas.width;
  const h      = canvas.height;

  // 2) prepare the image buffer
  const imageData = ctx.createImageData(w, h);
  const data      = imageData.data;

  // 3) seed & create your noise generator
  //    (SimplexNoise is now defined by the CDN script)
  const simplex = new SimplexNoise(/* optional seed string */);

  // 4) fill each pixel
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const value     = simplex.noise2D(x / 100, y / 100);
      const normalized = (value + 1) * 0.5 * 255;
      const idx        = (y * w + x) * 4;
      data[idx]   = normalized; // R
      data[idx+1] = normalized; // G
      data[idx+2] = normalized; // B
      data[idx+3] = 255;        // A
    }
  }

  // 5) paint it on screen
  ctx.putImageData(imageData, 0, 0);
});

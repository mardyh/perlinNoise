// perlin.js
(function(w)
{
	//canvas for particles
	const canvas = document.getElementById('canvas');
	const canvasCtx = canvas.getContext('2d');
	
	//canvas for noise
	const noiseCanvas = document.getElementById('noiseCanvas');
	const noiseCtx    = noiseCanvas.getContext('2d');

	//for noise calculations
	const resolution = 10; //resolution for grid must be multiple of screen resolution
	const simplex = new SimplexNoise();
	const scale   = 0.01; //scale for noise < 1 will zoom
	const zSpeed  = 0.002; //how 'fast' the noise 'animates'
	let   zTime   = 0; //initialize z value
	let canvas_width, canvas_height, noiseCanvas_width, noiseCanvas_height;
	let animationId = null;
	
// ---------------------------------------------------------- //	
	
	//functions
	function resizeCanvasToGrid() 
	{
		// 1) figure out pixel dimensions that are multiples of `resolution`
		noiseCanvas_width  = Math.floor(window.innerWidth  / resolution) * resolution;
		noiseCanvas_height = Math.floor(window.innerHeight / resolution) * resolution;
		
		//set num cols and rows for grid
		num_cols = noiseCanvas_width  / resolution;
		num_rows = noiseCanvas_height / resolution;

		// 3) size the *noise* canvas at [num_cols×num_rows]
		noiseCanvas.width  = num_cols;
		noiseCanvas.height = num_rows;
		console.log(noiseCanvas.width,noiseCanvas.height);
		
		init();
	}
	
	
	function drawNoise() 
	{
		//internal vars
		const w   = noiseCanvas.width;
		const h   = noiseCanvas.height;
		const img = noiseCtx.createImageData(w, h);
		const d   = img.data;
		//
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
		noiseCtx.putImageData(img, 0, 0);

		zTime += zSpeed;
		animationId = requestAnimationFrame(drawNoise);
	}
	
	function init()
	{
		if (animationId) cancelAnimationFrame(animationId); // stop previous loop
		console.log("INIT");
		drawNoise();
	}
	
	
// ------------------------------------------------------------ //
	//making the functions do something
	
	//expose init to global scope
	w.Perlin = 
	{
		initialize: init
	}
	
	window.addEventListener("load",   resizeCanvasToGrid);
	window.addEventListener("resize", resizeCanvasToGrid);

}(window));
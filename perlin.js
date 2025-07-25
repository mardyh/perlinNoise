// perlin.js
// I call it perlin, but it is actually simplex noise
(function(w)
{
// -----------------------// VARIABLES //------------------------- //

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
	const zSpeed  = 0.0002; //how 'fast' the noise 'animates'
	let   zTime   = 0; //initialize z value
	let canvas_width, canvas_height, noiseCanvas_width, noiseCanvas_height;
	let animationId = null; //track noise animation

	
	//for particles
	let particles = [];
	const particleCount = 6000;
	const particleSpeed = .1; //speed for particle movement
	const friction = 0.9; //1=no friction 0 = stuck
	const velocityJitter = .1; //random velocity adjustment strength
	let particleAnimationId = null; //track particle animation
	
// ----------------------// FUNCTIONS //------------------------- //	
	
	//functions
	function resizeCanvasToGrid() //handles resizing grid based on canvas dimensions
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
		
		//resize main canvas
		canvas.width  = window.innerWidth;
		canvas.height = window.innerHeight;
		console.log(noiseCanvas.width,noiseCanvas.height);
		
		init();
	}
	
	function hslToRgb(h, s, l) //gives noise color
	{
		let r, g, b;
		if (s === 0) 
		{
			r = g = b = l; // achromatic
		} 
		else 
		{
			const hue2rgb = (p, q, t) => 
			{
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1/6) return p + (q - p) * 6 * t;
				if (t < 1/2) return q;
				if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			};

			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}
		return [r * 255, g * 255, b * 255];
	}
	
	function initParticles() //initialize particles
	{
		particles = [];
		for (let i = 0; i < particleCount; i++)
		{
			const x = Math.random() * canvas.width;
			const y = Math.random() * canvas.height;
			particles.push({ x, px: x, y, py: y, xv: 0, yv: 0 });
		}
	}
	
	function drawParticles() //draw particles on screen
	{
		canvasCtx.clearRect(0,0, canvas.width, canvas.height);
		canvasCtx.fillStyle = "black";
		canvasCtx.lineWidth = 1;
		
		for (let i = 0; i < particles.length; i++)
		{
			const p = particles[i];
			
			const dx = p.px - p.x;
			const dy = p.py - p.y;
			const distSq = dx * dx + dy * dy;
			
			const limit = Math.random() * 0.5;
			
			if (distSq < 100) { // Only draw short trails (or you get giant bars when the particles go from one side to the other)
				canvasCtx.beginPath();
				canvasCtx.moveTo(p.px, p.py);
				canvasCtx.lineTo(p.x, p.y);
				canvasCtx.stroke();	
			}
		}
	}
	
	function updateParticles()
	{
		const scaleX = noiseCanvas.width  / canvas.width;
		const scaleY = noiseCanvas.height / canvas.height;
		for (let i = 0; i < particles.length; i++)
		{
			const p = particles[i];
			
			//save prev position
			p.px = p.x
			p.py = p.y
			
			//sample simplex noise at position
			const nx = p.x * scaleX;
			const ny = p.y * scaleY;
			const v = simplex.noise3D(nx * scale, ny * scale, zTime);
			const angle = (v * 0.5 + 0.5) * 2 * Math.PI;

			// desired direction
			const dx = Math.cos(angle) * particleSpeed;
			const dy = Math.sin(angle) * particleSpeed;

			// add random jitter to motion
			const jitterX = (Math.random() - 0.5) * velocityJitter;
			const jitterY = (Math.random() - 0.5) * velocityJitter;

			// velocity update with viscosity and noise
			p.xv = (p.xv + dx + jitterX) * friction;
			p.yv = (p.yv + dy + jitterY) * friction;

			// apply velocity to position
			p.x += p.xv;
			p.y += p.yv;
			
			// re-spawn particles that move off screen
			if (p.x < 0 || p.x >= canvas.width || p.y < 0 || p.y >= canvas.height) 
			{
				p.x = p.px = Math.random() * canvas.width;
				p.y = p.py = Math.random() * canvas.height;
				p.xv = p.yv = 0;
			}
		}
	}
	
	function animateParticles()
	{
		updateParticles();
		drawParticles();
		particleAnimationId = requestAnimationFrame(animateParticles);
	}
	
	function drawNoise() //draws the noise
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
				let angle = (v * 0.5 + 0.5) * 2 * Math.PI; // → [0, 2π]
				//let c = ((v * 0.5 + 0.5) * 255) | 0; //gives grey color
				let hue = angle / (2 * Math.PI) * 360; //gives hsl color
				let i = (y * w + x) * 4;
				
				
				//d[i] = d[i+1] = d[i+2] = c;
				let rgb = hslToRgb(hue / 360, 1, 0.5);
				d[i]   = rgb[0]; // red
				d[i+1] = rgb[1]; // green
				d[i+2] = rgb[2]; // blue
				d[i+3] = 255;
				
			}
		}
		noiseCtx.putImageData(img, 0, 0);

		zTime += zSpeed;
		animationId = requestAnimationFrame(drawNoise);
	}
	
	function init() //main function
	{
		if (animationId) cancelAnimationFrame(animationId); // stop previous noise anim loop
		if (particleAnimationId) cancelAnimationFrame(particleAnimationId); //stop prev particl anim loop
		console.log("INIT");
		
		initParticles();
		drawParticles();
		animateParticles();
		drawNoise();
	}
	
	
// --------------------// INITALIZE MAIN //------------------------- //
	
	//expose init to global scope
	w.Perlin = 
	{
		initialize: init
	}
	
	//listen for window resize or reload
	window.addEventListener("load",   resizeCanvasToGrid);
	window.addEventListener("resize", resizeCanvasToGrid);

}(window));
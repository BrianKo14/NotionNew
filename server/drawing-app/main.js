
const POLL_INTERVAL = 1000;


// Set up canvas
const canvas = document.getElementById('canvas'); 
const fabricCanvas = new fabric.Canvas(canvas);

fabricCanvas.isDrawingMode = true;
fabricCanvas.freeDrawingBrush.width = 5;

fabricCanvas.setWidth(window.innerWidth - 60);
fabricCanvas.setHeight(window.innerHeight - 390);


/** Show modal overlay with some given text */
function showModal(text) {
	document.getElementById('placeholder').style.display = 'none';
	document.getElementById('modal').style.display = 'block';
	document.getElementById('modal-text').innerHTML = text;
}

// Hide placeholder
fabricCanvas.on('mouse:down', () => {
	document.getElementById('placeholder').style.display = 'none';
});



// Get drawing ID
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

// Poll server for cancelling
const poll = setInterval(async () => {

	const response = await fetch(`api/check-id?id=${id}`);
	const json = await response.json();
	if (!json) {
		clearInterval(poll);
		showModal('Drawing cancelled.');
	}

}, POLL_INTERVAL);

/** Post drawing to server */
function saveDrawing() {
	clearInterval(poll);

	showModal('Saving...');

	// Render
	const trimmed = trimCanvasY(canvas);
	const data = trimmed.toDataURL();

	// POST to server
	fetch('/api/save-drawing', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			image: data,
			id: id
		})
	})
	.then(res => {
		if (res.status === 200) showModal('Drawing saved!');
		clearInterval(poll);
	})
	.catch(err => {
		console.error(err);
	});
}

/** Clear canvas */
function clearCanvas() {
	fabricCanvas.clear();
}

/** Change color */
var lastElement = Array.from(document.getElementsByClassName('color'))[0];
function setColor(el, color) {
	fabricCanvas.freeDrawingBrush.color = color;
	lastElement.classList.remove('selected');
	el.classList.add('selected');
	lastElement = el;
}

/** Trim around canvas blank spaces along the y-axis */
function trimCanvasY(canvas) {
	const ctx = canvas.getContext('2d');
	const copy = document.createElement('canvas').getContext('2d');

	const width = canvas.width;
	const height = canvas.height;
	const pixels = ctx.getImageData(0, 0, width, height).data;
	let top = -1;
	let bottom = -1;

	// Scan for the top boundary
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (pixels[(y * width + x) * 4 + 3] !== 0) {
				top = y;
				break;
			}
		}
		if (top !== -1) break;
	}

	// Scan for the bottom boundary
	for (let y = height - 1; y >= 0; y--) {
		for (let x = 0; x < width; x++) {
			if (pixels[(y * width + x) * 4 + 3] !== 0) {
				bottom = y;
				break;
			}
		}
		if (bottom !== -1) break;
	}

	// If no non-transparent pixels were found, return the original canvas
	if (top === -1 || bottom === -1) {
		return canvas;
	}

	const trimHeight = bottom - top + 1;
	const trimmed = ctx.getImageData(0, top, width, trimHeight);

	copy.canvas.width = width;
	copy.canvas.height = trimHeight;
	copy.putImageData(trimmed, 0, 0);

	return copy.canvas;
}



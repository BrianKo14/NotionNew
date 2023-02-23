
const POLL_INTERVAL = 1000;


// Set up canvas
const canvas = document.getElementById('canvas'); 
const fabricCanvas = new fabric.Canvas(canvas);

fabricCanvas.isDrawingMode = true;
fabricCanvas.freeDrawingBrush.width = 5;

fabricCanvas.setWidth(window.innerWidth - 60);
fabricCanvas.setHeight(window.innerHeight - 150 - 60 - 30);



/** Show modal overlay with some given text */
function showModal(text) {
	document.getElementById('modal').style.display = 'block';
	document.getElementById('modal-text').innerHTML = text;
}



// Get drawing ID
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

// Poll server for cancelling
const poll = setInterval(async () => {

	const response = await fetch(`api/check-id?id=${id}`);
	const json = await response.json();
	if (!json) {
		clearInterval(poll);
		showModal('Drawing cancelled!');
	}

}, POLL_INTERVAL);

/** Post drawing to server */
function save() {
	clearInterval(poll);

	// Render
	const data = fabricCanvas.toDataURL();

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
	})
	.catch(err => {
		console.error(err);
	});
}

/** Change color */
var lastElement = Array.from(document.getElementsByClassName('color'))[0];
function setColor(el, color) {
	fabricCanvas.freeDrawingBrush.color = color;
	lastElement.classList.remove('selected');
	el.classList.add('selected');
	lastElement = el;
}


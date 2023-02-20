const canvas = document.getElementById('canvas'); 
const fabricCanvas = new fabric.Canvas(canvas);

fabricCanvas.isDrawingMode = true;
fabricCanvas.freeDrawingBrush.width = 5;

fabricCanvas.setWidth(window.innerWidth - 60);
fabricCanvas.setHeight(window.innerHeight - 150 - 60 - 30);


function save() {
	// Render
	const data = fabricCanvas.toDataURL();

	// Get drawing ID
	const params = new URLSearchParams(window.location.search);
	const id = params.get('id');

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
	}).catch(err => {
		console.error(err);
	});
}


const path = require('path');
const express = require('express');

const drawings = require('./drawings');

const app = express();
app.use(express.json());

async function startServer() {

	// Initialize database
	await drawings.initializeDatabase();

	const port = process.env.PORT || 3001; // DEBUG: debugging in 3001
	app.listen(port, () => {
		console.log(`\nListening on port ${port}...`);
	});

}

startServer();


/** ENDPOINTS */

// Serve Notion dummy page
app.use(express.static('public'));
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve mobile drawing app
app.use(express.static('drawing-app'));
app.get('/drawing', (req, res) => {
	res.sendFile(path.join(__dirname, 'drawing-app', 'index.html'));
});

// Generate a unique drawing ID for each user and store it in a waitlist marked as "pending"
app.get('/unique-drawing-id', async (req, res) => {

	// DEBUG: Set the 'Access-Control-Allow-Origin' header to allow requests from a different domain
	res.header('Access-Control-Allow-Origin', 'http://localhost:3000');

	const newId = Math.floor(Math.random() * 1000000); // TODO: use a unique ID generator
	await drawings.addUser(newId);

	res.send('' + newId);
});

// Cancel request for drawing. Will delete entry from waitlist
app.get('cancel-request', async(req, res) => {
	await drawings.deleteUser(req.query.id);
});

// Save incoming drawing to database
app.post('/save-drawing', async (req, res) => {
	const data = req.body.image;
	const id = req.body.id;

	await drawings.addUser(id); // DEBUG:
	await drawings.updateUser(id, data);
});

// Check if drawing is available
app.get('/check-status', async (req, res) => {
	const id = req.query.id;
	const status = await drawings.checkStatus(id);
	res.send(status);
});

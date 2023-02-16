
const path = require('path');
const express = require('express');

const app = express();


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

// Generate a unique drawing ID for each user and store it in a database marked as "pending"
app.get('/unique-drawing-id', (req, res) => {

	// DEBUG: Set the 'Access-Control-Allow-Origin' header to allow requests from a different domain
	res.header('Access-Control-Allow-Origin', 'http://localhost:3000');

	res.send('' + Math.floor(Math.random() * 100000000));
});


const port = process.env.PORT || 3001;
app.listen(port, () => {
	console.log(`Listening on port ${port}...`);
});
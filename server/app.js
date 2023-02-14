
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


const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Listening on port 3000...`);
});
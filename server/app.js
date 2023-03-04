
const path = require('path');
const express = require('express');

const drawings = require('./drawings');

/** Maximum requests made by an IP per minute */
const MAX_PER_MIN = 100;

const app = express();
app.use(express.json({ limit: '50mb' })); // allow large JSON bodies

// DEBUG: Set the 'Access-Control-Allow-Origin' header to allow requests from a different domain
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
	next();
});

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: MAX_PER_MIN // limit each IP to MAX_PER_MIN requests per windowMs
});
app.use(limiter);

/** Initiates server async.
 * Meaninig wait for database to initialize and then start listening. */
async function startServer() {

	// Initialize database
	await drawings.initializeDatabase();

	const port = process.env.PORT || 3001; // DEBUG: debugging in 3001
	app.listen(port, () => {
		console.log(`\nListening on port ${port}...`);
	});

}


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
app.get('/api/unique-drawing-id', async (req, res) => {

	if (await drawings.isFull()) {
		res.status(500).send('FULL');
		return;
	}

	if (await drawings.maxIpReached(req.ip)) {
		res.status(500).send('MAX_IP');
		return;
	}

	const newId = Math.floor(Math.random() * 10000000); // TODO: use a unique ID generator
	await drawings.addUser(newId, req.ip);

	res.status(200).send('' + newId);
});

// Cancel request for drawing. Will delete entry from waitlist
app.get('/api/cancel-request', async (req, res) => {
	await drawings.deleteUser(req.query.id);

	res.sendStatus(200);
});

// Save incoming drawing to database
app.post('/api/save-drawing', async (req, res) => {
	const data = req.body.image;
	const id = req.body.id;

	await drawings.updateUser(id, data);

	res.sendStatus(200);
});

// Check if drawing is available
app.get('/api/check-status', async (req, res) => {
	const id = req.query.id;
	const status = await drawings.checkStatus(id);
	res.send(!!status);
});

// Check if ID is in database
app.get('/api/check-id', async (req, res) => {
	const id = req.query.id;
	const exists = await drawings.checkId(id);
	res.send(!!exists);
});

// Fetch drawing URL data from database
app.get('/api/get-drawing', async (req, res) => {
	const id = req.query.id;
	const data = await drawings.getDrawing(id);
	res.send(data);
});


startServer();
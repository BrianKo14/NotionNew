
export var serverURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');

// DEBUG: local IP address
if (serverURL.includes('localhost')) serverURL = 'http://192.168.0.146:3001'; 


const POLL_INTERVAL = 3000;

var uniqueId = null;

/** Requests server for assignment of a unique ID for this user.
 * The server will return then ID after storing it in a database marked as "pending".
 * Returns an array: [status, id] or [status, error] */
export async function getUniqueID() {
	try {
		if (uniqueId !== null) return [200, uniqueId];

		const response = await fetch(`${serverURL}/api/unique-drawing-id`);

		// Error
		if (response.status !== 200)
			return [response.status, await response.text()];

		// Success
		const json = await response.json();
		uniqueId = json;
		return [response.status, json];

	} catch (error) {
		console.error(error);
	}
}

/** Cancel request for drawing for last ID generated, iff it's still pending.
 * Will delete entry from waitlist */
export async function cancelDrawingRequest() {
	if (uniqueId !== null) {
		try {
			await fetch(`${serverURL}/api/cancel-request?id=${uniqueId}`);
			uniqueId = null;
		} catch (error) {
			console.error(error);
		}
	}
}

/** Checks if the drawing is ready every POLL_INTERVAL milliseconds.
 * Runs 'accept' function when drawing is ready.
 * Runs 'cancel' function if ID doesn't exist.
 * Polling is not the most efficient solution, but pertinent enough to the occasion. */
export async function startPolling(accept, cancel) {
	const poll = setInterval(async () => {

		// Check ID
		const idResponse = await fetch(`${serverURL}/api/check-id?id=${uniqueId}`);
		const idExists = await idResponse.json();

		if (idExists === false) {
			clearInterval(poll);
			uniqueId = null
			cancel();
		}

		// Check status
		const statusResponse = await fetch(`${serverURL}/api/check-status?id=${uniqueId}`);
		const status = await statusResponse.json();

		if (status === true) {
			clearInterval(poll);
			accept();
		}

	}, POLL_INTERVAL);
}

/** Fetches drawing URL data from database. */
export async function getDrawing() {
	const response = await fetch(`${serverURL}/api/get-drawing?id=${uniqueId}`);
	const text = await response.text();

	return text;
}
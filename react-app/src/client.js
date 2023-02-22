
export const serverURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');

const POLL_INTERVAL = 1000;

var unique_id = null;

/** Requests server for assignment of a unique ID for this user.
 * The server will return then ID after storing it in a database marked as "pending". */
export async function getUniqueID() {
	try {
		const response = await fetch(`${serverURL}/api/unique-drawing-id`);
		const json = await response.json();

		if (unique_id !== null) return unique_id;
		unique_id = json;
		return json;
	} catch (error) {
		console.error(error);
	}
}

/** Cancel request for drawing for last ID generated, iff it's still pending.
 * Will delete entry from waitlist */
export async function cancelDrawingRequest() {
	if (unique_id !== null) {
		try {
			await fetch(`${serverURL}/api/cancel-request?id=${unique_id}`);
			unique_id = null;
		} catch (error) {
			console.error(error);
		}
	}
}

/** Checks if the drawing is ready every POLL_INTERVAL milliseconds.
 * Runs 'callback' function when drawing is ready. 
 * Polling is not the most efficient solution, but pertinent enough to the occasion. */
export async function startPolling(callback) {
	const poll = setInterval(async () => {
		if (unique_id === null) {
			clearInterval(poll);
			return;
		}

		const response = await fetch(`${serverURL}/api/check-status?id=${unique_id}`);
		const json = await response.json();
		if (json === true) {
			clearInterval(poll);
			callback();
		}
		else if (json === null) {
			clearInterval(poll);
			unique_id = null;
		}
	}, POLL_INTERVAL);
}

/** Fetches drawing URL data from database. */
export async function getDrawing() {
	const response = await fetch(`${serverURL}/api/get-drawing?id=${unique_id}`);
	const text = await response.text();

	return text;
}
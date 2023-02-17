
const serverURL = 'http://localhost:3001';

/** Requests server for assignment of a unique ID for this user.
 * The server will return then ID after storing it in a database marked as "pending". */
exports.getUniqueID = async function() {
	try {
		const response = await fetch(`${serverURL}/unique-drawing-id`);
		const json = await response.json();
		return json;
	} catch (error) {
		console.error(error);
	}
}

/** Cancel request for drawing. Will delete entry from waitlist */
exports.cancelDrawingRequest = async function(id) {
	try {
		await fetch(`${serverURL}/cancel-request?id=${id}`);
	} catch (error) {
		console.error(error);
	}
}
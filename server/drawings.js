
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = './drawings_waitlist.db';

/** Maximum number of elements in the database at any given time. */
const MAX_TOTAL_REQUESTS = 1000;

/** Maximum simultaneous requests made by the same user. */
const MAX_REQUESTS_PER_IP = 3;

/** Maximum minutes for a request to remain unfulfilled in the waitlist. */
const MAX_MINUTES = 90;


const db = new sqlite3.Database(DB_PATH);
db.serialize(); // ensures that database operations are executed in a predictable order
console.log('Database initialized.');

// Delete database on server shutdown
process.on('SIGINT', () => {
	db.close();
	require('fs').unlinkSync(DB_PATH);
	process.exit();
});

/** Creates 'users' table in database.
 * 
 * The table has five columns:
 * - id: unique user ID
 * - status: TRUE if drawing has been received, FALSE if drawing is still expected
 * - date: number of milliseconds elapsed since Jan 1 1970
 * - ip: IP address of user
 * - drawing: blob of drawing data, like 'data:image/png;base64,...'
*/
exports.initializeDatabase = async function() {
	const result = await db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, status BOOLEAN, date INTEGER, ip STRING, drawing BLOB)');
	if (!result.error) {
		console.log('Table created.');
		startCleanup();
	}
}



/* --- EDIT --- */

/** Adds new user to the waitlist. Will replace existing instances of same user. */
exports.addUser = async function(id, ip) {
	const date = Date.now();
	const result = await db.run('INSERT OR REPLACE INTO users VALUES (?, ?, ?, ?, ?)' , [id, false, date, ip, null]);
	if (result.error) console.log(result.error);
}

/** Removes user from waitlist when drawing is no longer expected. */
const deleteUser = async function(id) {
	const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
	if (result.error) console.log(result.error);
}
exports.deleteUser = deleteUser;

/** Updates blob when drawing has been received. */
exports.updateUser = async function(id, drawing) {
	const result = await db.run('UPDATE users SET status = ?, drawing = ? WHERE id = ?', [true, drawing, id]);
	if (result.error) console.log(result.error);
}



/* --- CHECK --- */

/** Returns TRUE if drawing is already available.
 * Returns FALSE if drawing is still expected.
 * Returns NULL if ID doesn't exist. */
exports.checkStatus = function(id) {
	return new Promise((resolve, reject) => {
		db.get('SELECT status FROM users WHERE id = ?', [id], (err, row) => {
			if (err) console.log(err);
			else if (!row) resolve(null);
			else resolve(row.status);
		});
	});
}

/** Returns TRUE iff ID exists in database */
exports.checkId = function(id) {
	return new Promise((resolve, reject) => {
		db.get('SELECT id FROM users WHERE id = ?', [id], (err, row) => {
			if (err) console.log(err);
			else if (!row) resolve(false);
			else resolve(true);
		});
	});
}

/** Returns TRUE iff number of requests is under the maximum */
exports.isFull = function() {
	return new Promise((resolve, reject) => {
		db.get('SELECT COUNT(*) AS count FROM users', (err, row) => {
			if (err) console.log(err);
			else resolve(row.count > MAX_TOTAL_REQUESTS);
		});
	});
}

/** Returns TRUE iff this IP has made more than MAX_REQUESTS_PER_IP requests */
exports.maxIpReached = function(ip) {
	return new Promise((resolve, reject) => {
		db.get('SELECT COUNT(*) AS count FROM users WHERE ip = ?', [ip], (err, row) => {
			if (err) console.log(err);
			else resolve(row.count >= MAX_REQUESTS_PER_IP);
		});
	});
}

/** Starts an interval check-up that will remove old elements. */
function startCleanup() {
	setInterval(async () => {
		db.all('SELECT * FROM users', (err, rows) => {
			if (err) console.log(err);
			else {
				rows.forEach(row => {
					if (Date.now() - row.date > MAX_MINUTES * 60 * 1000) deleteUser(row.id);
				});
			}
		});
	});
}




/* --- GET --- */

/** Returns drawing blob if ID matches status TRUE.
 * Returns NULL if ID doesn't exist. */
exports.getDrawing = function(id) {
	return new Promise((resolve, reject) => {
		db.get('SELECT drawing FROM users WHERE id = ?', [id], (err, row) => {
			if (err) console.log(err);
			else if (!row) resolve(null);
			else {
				resolve(row.drawing);
				deleteUser(id);
			}
		});
	});
}

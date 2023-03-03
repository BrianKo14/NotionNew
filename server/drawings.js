
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = './drawings_waitlist.db';

const db = new sqlite3.Database(DB_PATH);
db.serialize(); // ensures that database operations are executed in a predictable order
console.log('Database initialized.');

// Delete database on server shutdown
process.on('SIGINT', () => {
	db.close();
	require('fs').unlinkSync(DB_PATH);
	process.exit();
});

const MAX_REQUESTS = 1000;


/** Creates 'users' table in database.
 * 
 * The table has three columns:
 * - id: unique user ID
 * - status: TRUE if drawing has been received, FALSE if drawing is still expected
 * - date: number of milliseconds elapsed since Jan 1 1970
 * - drawing: blob of drawing data, like 'data:image/png;base64,...'
*/
exports.initializeDatabase = async function() {
	const result = await db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, status BOOLEAN, date INTEGER, drawing BLOB)');
	if (!result.error) console.log('Table created.')
}



/* --- EDIT --- */

/** Adds new user to the waitlist. Will replace existing instances of same user. */
exports.addUser = async function(id) {
	const date = Date.now();
	const result = await db.run('INSERT OR REPLACE INTO users VALUES (?, ?, ?, ?)' , [id, false, date, null]);
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
			else resolve(row.count > MAX_REQUESTS);
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


const sqlite3 = require('sqlite3').verbose();

const DB_PATH = './drawings_waitlist.db';

const db = new sqlite3.Database(DB_PATH);
db.serialize(); // ensures that database operations are executed in a predictable order
console.log('Database initialized.');

// Delete database on server shutdown
process.on('SIGINT', () => { // 'SIGINT' or 'exit'
	db.close();
	require('fs').unlinkSync(DB_PATH);
	process.exit();
});


/* PUBLIC METHODS */

/** Creates 'users' table in database.
 * 
 * The table has three columns:
 * - id: unique user ID
 * - status: TRUE if drawing has been received, FALSE if drawing is still expected
 * - drawing: blob of drawing data
 */
exports.initializeDatabase = async function() {
	const result = await db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, status BOOLEAN, drawing BLOB)');
	if (!result.error) console.error('Table created.')
}

/** Adds new user to the waitlist. Will replace existing instances of same user. */
exports.addUser = async function(id) {
	const result = await db.run('INSERT OR REPLACE INTO users VALUES (?, ?, ?)' , [id, false, null]);
	if (result.error) console.error(result.error);
}

/** Removes user from waitlist when drawing is no longer expected. */
exports.deleteUser = async function(id) {
	const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
	if (result.error) console.error(result.error);
}

/** Updates blob when drawing has been received. */
exports.updateUser = async function(id, drawing) {
	const result = await db.run('UPDATE users SET status = ?, drawing = ? WHERE id = ?', [true, drawing, id]);
	if (result.error) console.error(result.error);
}

/** Returns TRUE if drawing is already available. */
exports.checkStatus = async function(id) {
	const result = await db.get('SELECT status FROM users WHERE id = ?', [id]);
	if (result.error) console.error(result.error);
	return result.status;
}

/** Returns drawing blob if id matches status TRUE. */
exports.getDrawing = function(id) {
	return new Promise((resolve, reject) => {
		db.get('SELECT drawing FROM users WHERE id = ?', [id], (err, row) => {
			if (err) reject(err);
			else resolve(row.drawing);
		});
	});
}
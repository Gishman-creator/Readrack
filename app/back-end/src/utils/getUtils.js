const pool = require('../config/db');

exports.getAuthorsByIds = async (authorIds) => {
    // console.log('authorIds:', authorIds);
    if (!authorIds) return [];

    const idsArray = authorIds.split(',').map(id => id.trim()); // Split the string and trim any spaces
    const placeholders = idsArray.map(() => '?').join(','); // Prepare placeholders for SQL IN clause

    const query = `SELECT id AS author_id, authorName AS author_name, nickname FROM authors WHERE id = ?`;
    let authors = [];
    for (const id of idsArray) {
        const [rows] = await pool.query(query, id);
        if (rows.length > 0) {
            authors.push(rows[0]);
        }
    }
    // console.log('authors:', authors);

    return authors;
};
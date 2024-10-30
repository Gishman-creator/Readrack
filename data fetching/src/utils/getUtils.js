const poolpg = require('../config/dbpg');

exports.getAuthorsByIds = async (authorIds) => {
    if (!authorIds) return [];

    const idsArray = authorIds.split(',').map(id => id.trim()); // Split the string and trim any spaces
    const placeholders = idsArray.map((_, index) => `$${index + 1}`).join(','); // Prepare placeholders for SQL IN clause

    const query = `SELECT id AS author_id, "authorName" AS author_name, nickname FROM authors WHERE id IN (${placeholders})`;
    
    try {
        const { rows } = await poolpg.query(query, idsArray); // Use idsArray directly
        return rows; // Return all matched authors
    } catch (error) {
        console.error('Error fetching authors:', error);
        return []; // Return an empty array in case of error
    }
};

const poolpg = require('../../config/dbpg'); // Adjust path as necessary

/**
 * Deletes data from the specified table based on the type and ids provided.
 * 
 * @param {string} type - The type of data to delete ('authors', 'series' or 'books').
 * @param {Array<number>} ids - An array of ids to delete from the specified table.
 * @returns {Object} - Result of the deletion query.
 */
exports.deleteData = async (req, res) => {
    const { type, ids } = req.body;

    if (!type || !ids || !Array.isArray(ids)) {
        return res.status(400).json({ error: "Invalid request. 'type' and 'ids' must be provided." });
    }

    const validTypes = ['authors', 'series', 'books'];
    if (!validTypes.includes(type)) {
        return res.status(400).json({ error: "Invalid type. Valid types are 'authors', 'series' or 'books'." });
    }

    try {
        // Ensure IDs are integers to prevent SQL injection
        const idsArray = ids.map(id => parseInt(id, 10));
        const idsString = idsArray.join(', ');

        // Construct the DELETE query dynamically based on the type and ids
        const query = `DELETE FROM ${type} WHERE id = ANY($1::int[])`;

        // Execute the deletion query using parameterized input
        const result = await poolpg.query(query, [idsArray]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "No records found with the provided ids." });
        }

        // Emit a Socket.IO event if available
        if (req.io) {
            req.io.emit('dataDeleted', { ids, type });
        }

        return res.status(200).json({ message: `${result.rowCount} record(s) successfully deleted.` });

    } catch (error) {
        console.error('❌ Error deleting data:', error.message);
        return res.status(500).json({ error: 'An error occurred while deleting data.' });
    }
};

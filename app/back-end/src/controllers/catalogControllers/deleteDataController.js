const pool = require('../../config/db'); // Adjust path as necessary

/**
 * Deletes data from the specified table based on the type and ids provided.
 * 
 * @param {string} type - The type of data to delete ('authors', 'series', or 'books').
 * @param {Array<number>} ids - An array of ids to delete from the specified table.
 * @returns {Object} - Result of the deletion query.
 */
exports.deleteData = async (req, res) => {
    const { type, ids } = req.body;
    console.log('The delete type is:', type);

    if (!type || !ids || !Array.isArray(ids)) {
        return res.status(400).json({ error: "Invalid request. 'type' and 'ids' must be provided." });
    }

    const validTypes = ['authors', 'series', 'collections', 'books'];
    if (!validTypes.includes(type)) {
        return res.status(400).json({ error: "Invalid type. Valid types are 'authors', 'series', or 'books'." });
    }

    try {
        const idsString = ids.join(', ');

        // Construct the delete query dynamically based on the type and ids
        const query = `DELETE FROM ${type} WHERE id IN (${idsString})`;

        const [result] = await pool.query(query);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "No records found with the provided ids." });
        }

        if (req.io) {
            req.io.emit('dataDeleted', { ids, type });
            console.log('Emitting deleted data ids:', ids, 'In', type);
        } else {
            console.log('Socket.Io is not initialized.');
        }

        return res.status(200).json({ message: `${result.affectedRows} record(s) successfully deleted.` });

    } catch (error) {
        console.error('❌ Error deleting data:', error.message);
        return res.status(500).json({ error: 'An error occurred while deleting data.' });
    }
};

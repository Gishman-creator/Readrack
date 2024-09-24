const pool = require('../../config/db');

exports.incrementSearchCount = async (req, res) => {
    const { type, id } = req.body;
    // console.log(`Incrementing search count for ${type} with id ${id}`);

    try {
        let tableName;
        if (type === 'series' || type === 'serie') {
            tableName = 'series';
        } else if (type === 'collections' || type === 'collection') {
            tableName = 'collections';
        } else if (type === 'authors' || type === 'author') {
            tableName = 'authors';
        } else {
            return res.status(400).json({ error: 'Invalid type' });
        }

        const query = `UPDATE ${tableName} SET searchCount = searchCount + 1 WHERE id = ?`;
        const [result] = await pool.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        return res.status(200).json({ message: 'Search count updated successfully' });
    } catch (error) {
        console.error('Error incrementing search count:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

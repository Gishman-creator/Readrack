const poolpg = require('../../config/dbpg');

exports.incrementSearchCount = async (req, res) => {
    const { type, id } = req.body;

    try {
        let tableName;
        if (type === 'series' || type === 'serie') {
            tableName = 'series';
        } else if (type === 'authors' || type === 'author') {
            tableName = 'authors';
        } else {
            return res.status(400).json({ error: 'Invalid type' });
        }

        const query = `UPDATE ${tableName} SET search_count = search_count + 1 WHERE id = $1`;
        const { rowCount } = await poolpg.query(query, [id]);

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        return res.status(200).json({ message: 'Search count updated successfully' });
    } catch (error) {
        console.error('Error incrementing search count:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

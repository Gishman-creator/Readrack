// controllers/getCountController.js
const pool = require('../../config/db');

exports.getCount = async (req, res) => {
    const { type } = req.query;

    try {
        if (type === 'books') {
            const [results] = await pool.query('SELECT COUNT(*) AS totalCount FROM books');
            res.status(200).json({ totalCount: results[0].totalCount });
        } else if (type === 'series') {
            const [totalSeriesResults] = await pool.query('SELECT COUNT(*) AS totalCount FROM series');

            const [completeSeriesResults] = await pool.query(`
                SELECT COUNT(*) AS completeCount
                FROM series s
                WHERE (SELECT COUNT(*) 
                       FROM books b 
                       WHERE b.serie_id = s.id
                ) >= s.numBooks;
            `);

            const [incompleteSeriesResults] = await pool.query(`
                SELECT COUNT(*) AS incompleteCount
                FROM series s
                WHERE (SELECT COUNT(*) 
                       FROM books b 
                       WHERE b.serie_id = s.id
                ) < s.numBooks;
            `);

            res.status(200).json({
                totalCount: totalSeriesResults[0].totalCount,
                completeCount: completeSeriesResults[0].completeCount,
                incompleteCount: incompleteSeriesResults[0].incompleteCount
            });
        } else if (type === 'authors') {
            const [totalAuthorsResults] = await pool.query('SELECT COUNT(*) AS totalCount FROM authors');

            const [completeAuthorsResults] = await pool.query(`
                SELECT COUNT(*) AS completeCount
                FROM authors a
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM series s
                    LEFT JOIN books b ON s.id = b.serie_id
                    WHERE s.author_id = a.id
                    AND (SELECT COUNT(*) FROM books b WHERE b.serie_id = s.id) < s.numBooks
                );
            `);

            const [incompleteAuthorsResults] = await pool.query(`
                SELECT COUNT(*) AS incompleteCount
                FROM authors a
                WHERE EXISTS (
                    SELECT 1
                    FROM series s
                    LEFT JOIN books b ON s.id = b.serie_id
                    WHERE s.author_id = a.id
                    AND (SELECT COUNT(*) FROM books b WHERE b.serie_id = s.id) < s.numBooks
                );
            `);

            res.status(200).json({
                totalCount: totalAuthorsResults[0].totalCount,
                completeCount: completeAuthorsResults[0].completeCount,
                incompleteCount: incompleteAuthorsResults[0].incompleteCount
            });
        } else {
            res.status(400).send('Invalid type specified');
        }
    } catch (error) {
        console.error('Error fetching count data:', error);
        res.status(500).send('Error fetching count data');
    }
};

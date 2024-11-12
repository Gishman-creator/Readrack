// controllers/getCountController.js
const poolpg = require('../../config/dbpg');

exports.getCount = async (req, res) => {
    const { type } = req.query;

    try {
        if (type === 'books') {
            // Query for books count
            const result = await poolpg.query('SELECT COUNT(*) AS "totalCount" FROM books');
            res.status(200).json({ totalCount: result.rows[0].totalCount });
        } else if (type === 'series') {
            // Total series count
            const totalSeriesResult = await poolpg.query('SELECT COUNT(*) AS "totalCount" FROM series');
            
            // Complete series count
            const completeSeriesResult = await poolpg.query(`
                SELECT COUNT(*) AS "completeCount"
                FROM series s
                WHERE (SELECT COUNT(*) 
                       FROM books b 
                       WHERE b.serie_id = s.id
                ) >= s.num_books;
            `);
            
            // Incomplete series count
            const incompleteSeriesResult = await poolpg.query(`
                SELECT COUNT(*) AS "incompleteCount"
                FROM series s
                WHERE (SELECT COUNT(*) 
                       FROM books b 
                       WHERE b.serie_id = s.id
                ) < s.num_books;
            `);

            res.status(200).json({
                totalCount: totalSeriesResult.rows[0].totalCount,
                completeCount: completeSeriesResult.rows[0].completeCount,
                incompleteCount: incompleteSeriesResult.rows[0].incompleteCount
            });
        } else if (type === 'authors') {
            // Total authors count
            const totalAuthorsResult = await poolpg.query('SELECT COUNT(*) AS "totalCount" FROM authors');

            // Complete authors count
            const completeAuthorsResult = await poolpg.query(`
                SELECT COUNT(*) AS "completeCount"
                FROM authors a
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM series s
                    LEFT JOIN books b ON s.id = b.serie_id
                    WHERE s.author_id = a.id
                    AND (SELECT COUNT(*) FROM books b WHERE b.serie_id = s.id) < s."num_books"
                );
            `);

            // Incomplete authors count
            const incompleteAuthorsResult = await poolpg.query(`
                SELECT COUNT(*) AS "incompleteCount"
                FROM authors a
                WHERE EXISTS (
                    SELECT 1
                    FROM series s
                    LEFT JOIN books b ON s.id = b.serie_id
                    WHERE s.author_id = a.id
                    AND (SELECT COUNT(*) FROM books b WHERE b.serie_id = s.id) < s."num_books"
                );
            `);

            res.status(200).json({
                totalCount: totalAuthorsResult.rows[0].totalCount,
                completeCount: completeAuthorsResult.rows[0].completeCount,
                incompleteCount: incompleteAuthorsResult.rows[0].incompleteCount
            });
        } else {
            res.status(400).send('Invalid type specified');
        }
    } catch (error) {
        console.error('Error fetching count data:', error);
        res.status(500).send('Error fetching count data');
    }
};

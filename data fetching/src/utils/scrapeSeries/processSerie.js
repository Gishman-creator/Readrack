const poolpg = require('../../config/dbpg3'); // Your PostgreSQL pool setup
const { insertNewSerie } = require('./insertNewSerie');

exports.processSerie = async (serie_name, author_id) => {
    try {
        // Check if the series already exists in the database by serie_name
        const existingSerie = await poolpg.query(
            'SELECT * FROM series WHERE serie_name = $1',
            [serie_name]
        );

        if (existingSerie.rows.length > 0) {
            const serie = existingSerie.rows[0];

            // Update author_id if it's not already associated with the series
            const existingAuthorIds = serie.author_id ? serie.author_id.split(',') : [];
            if (!existingAuthorIds.includes(String(author_id))) {
                const updatedAuthorIds = [...existingAuthorIds, String(author_id)].join(',');
                await poolpg.query(
                    'UPDATE series SET author_id = $1 WHERE serie_name = $2',
                    [updatedAuthorIds, serie_name]
                );
            }
        } else {
            // If the series does not exist, insert it with the author_id
            await insertNewSerie(serie_name, author_id);
        }
    } catch (error) {
        console.error('Error processing series:', error);
    }
}

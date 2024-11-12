const poolpg = require('../../config/dbpg3');

exports.insertNewSerie = async (serie_name, authorId, goodreads_link) => {
    let serieIdLength = 6; // Start with 6 digits
    let maxIdsForCurrentLength;
    let currentLengthIdsCount;
    let idExists, serieId;

    do {
        maxIdsForCurrentLength = getMaxIdsForLength(serieIdLength);
        currentLengthIdsCount = await getIdsCountByLength(serieIdLength);

        if (currentLengthIdsCount < maxIdsForCurrentLength) {
            do {
                serieId = generateRandomId(serieIdLength);
                idExists = await checkIfIdExists(serieId);
            } while (idExists);
        } else {
            serieIdLength++;
        }
    } while (idExists || currentLengthIdsCount >= maxIdsForCurrentLength);

    const insertSerieQuery = `INSERT INTO series (id, serie_name, author_id, goodreads_link) VALUES ($1, $2, $3, $4)`;
    await poolpg.query(insertSerieQuery, [serieId, serie_name, authorId, goodreads_link]);
};


// Helper function to calculate the maximum number of IDs for a given length
function getMaxIdsForLength(length) {
    return 9 * Math.pow(10, length - 1); // For length N, there are 9 * 10^(N-1) possible IDs (e.g., 6 digits = 900000)
}

// Helper function to generate a random ID of the given length
function generateRandomId(length) {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)).toString();
}

// Helper function to check if a given ID exists in the 'series' table
async function checkIfIdExists(serieId) {
    const result = await poolpg.query(`SELECT id FROM series WHERE id = $1`, [serieId]);
    return result.rows.length > 0;
}

// Helper function to count the number of IDs of a given length in the 'series' table
async function getIdsCountByLength(length) {
    const result = await poolpg.query(`SELECT COUNT(*) AS count FROM series WHERE LENGTH(id::text) = $1`, [length]);
    return parseInt(result.rows[0].count, 10);
}

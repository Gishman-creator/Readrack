// const poolpg = require('../../config/dbpg2');
const poolpg2 = require('../../config/dbpg');

exports.migrateDod = async (req, res) => {
    try {
        // Step 1: Get all DOD (Date of Death) from the authors table in poolpg
        const { rows } = await poolpg.query('SELECT id, "author_name", dod FROM authors WHERE dod IS NOT NULL');

        // Step 2: Format the dates to 'MMMM d, yyyy' format (e.g., September 4, 2022)
        const formattedDates = rows.map(author => {
            const dodDate = new Date(author.dod);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const dodFormatted = dodDate.toLocaleDateString('en-US', options);
            return { id: author.id, author_name: author.author_name, dodFormatted };
        });

        // Step 3: Update the authors table in poolpg2 with formatted DODs
        const updatePromises = formattedDates.map(author =>
            poolpg2.query('UPDATE authors SET dod = $1 WHERE id = $2', [author.dodFormatted, author.id])
        );

        await Promise.all(updatePromises); // Wait for all updates to finish

        res.status(200).json({ message: 'DOD migration successful.' });
    } catch (error) {
        console.error('Error migrating DOD:', error);
        res.status(500).json({ error: 'Failed to migrate DOD' });
    }
};

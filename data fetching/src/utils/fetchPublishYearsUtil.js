const poolpg = require('../config/dbpg');

const fetchPublishYearsUtil = async (serie_id, type) => {
    try {
        // Query to fetch distinct publish dates for a given series
        const publishYearQuery = `
        SELECT DISTINCT publish_date
        FROM books
        WHERE ${type}_id = $1
      `;

        const publishYearParams = [serie_id];
        const publishYearResults = await poolpg.query(publishYearQuery, publishYearParams);
        const publishDates = publishYearResults.rows.map(row => row.publish_date);

        // Extract years from the publish_date field
        const publishYears = publishDates.map(publish_date => {
            let year = null;

            // Check for different formats of the publish date
            if (publish_date) {
                const fullDateMatch = publish_date.match(/(\w+ \d{1,2}, \d{4})/);
                const monthYearMatch = publish_date.match(/([A-Za-z]+) (\d{4})/);
                const yearOnlyMatch = publish_date.match(/(\d{4})/);

                if (fullDateMatch) {
                    year = parseInt(fullDateMatch[0].split(', ')[1]); // Extracting year from "Month DD, YYYY"
                } else if (monthYearMatch) {
                    year = parseInt(monthYearMatch[2]); // Extracting year from "Month YYYY"
                } else if (yearOnlyMatch) {
                    year = parseInt(yearOnlyMatch[1]); // Extracting year from "YYYY"
                }
            }

            return year;
        }).filter(year => year !== null); // Filter out null values

        // Return the array of publish years, or an empty array if none
        return publishYears;
    } catch (error) {
        console.error('Error fetching publish years for series:', serie_id, error);
        throw new Error('Failed to fetch publish years');
    }
};

module.exports = { fetchPublishYearsUtil };

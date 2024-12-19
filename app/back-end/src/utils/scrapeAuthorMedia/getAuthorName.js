const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Fetches the author's name from the Goodreads profile page.
 * @param {string} goodreadsLink - The Goodreads URL of the author.
 * @param {string} userAgent - The User-Agent string to use for the request.
 * @returns {Promise<string|null>} - The author's name or null if not found.
 */
const getAuthorName = async (goodreadsLink, userAgent) => {
    try {
        // Fetch the Goodreads page
        const response = await axios.get(goodreadsLink, {
            headers: {
                'User-Agent': userAgent,
            },
        });

        // Load the page into cheerio
        const $ = cheerio.load(response.data);

        // Extract the author's name using the specified span selector
        const authorName = $('span.ContributorLink__name[data-testid="name"]').text().trim();

        return authorName || null;
    } catch (error) {
        console.error('Error fetching author name from Goodreads:', error.message);
        return null;
    }
};

module.exports = getAuthorName;

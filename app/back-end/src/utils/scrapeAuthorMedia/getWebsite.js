const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Fetches the author's website from the Goodreads profile page.
 * @param {string} goodreadsLink - The Goodreads URL of the author.
 * @param {string} userAgent - The User-Agent string to use for the request.
 * @returns {Promise<string|null>} - The website URL or null if not found.
 */
const getWebsite = async (goodreadsLink, userAgent) => {
    try {
        // Fetch the Goodreads page
        const response = await axios.get(goodreadsLink, {
            headers: {
                'User-Agent': userAgent,
            },
        });

        // Load the page into cheerio
        const $ = cheerio.load(response.data);

        // Find the "Website" section by locating the "Website" dataTitle
        const websiteSection = $('div.dataTitle')
            .filter((_, element) => $(element).text().trim() === 'Website')
            .next('div.dataItem');

        if (websiteSection.length === 0) {
            return null;
        } else {
            // Extract the href from the a tag inside the found dataItem
            const websiteLink = websiteSection.find('a').attr('href') || null;

            return websiteLink;
        }

    } catch (error) {
        console.error('Error fetching website from Goodreads:', error.message);
        return null;
    }
};

module.exports = getWebsite;

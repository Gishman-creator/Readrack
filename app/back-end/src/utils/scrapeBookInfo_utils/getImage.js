const axios = require('axios');
const cheerio = require('cheerio');
const { use } = require('../../routes/apiRoutes');

/**
 * Check if the Amazon link is valid and scrape the image link.
 * @param {string} amazonLink - The Amazon link from the book data.
 * @returns {string|null} - The image link if found, otherwise null.
 */
const getImage = async (userAgent, amazonLink) => {
    // Validate if the link matches the required pattern
    const amazonLinkPattern = /^https:\/\/www\.amazon\.com\/gp\/product\/[A-Za-z0-9]+$/;
    if (!amazonLinkPattern.test(amazonLink)) {
        return null;
    }

    try {
        // Fetch the Amazon product page
        const response = await axios.get(amazonLink, {
            headers: {
                'User-Agent': userAgent, // Example user-agent
            },
        });

        const $ = cheerio.load(response.data);

        // Check for image with id 'landingImage'
        let imageUrl = $('#landingImage').attr('src');

        // If not found, check for image with class 'a-dynamic-image'
        if (!imageUrl) {
            imageUrl = $('img.a-dynamic-image').attr('src');
        }

        // Return the image URL or null if no image found
        return imageUrl || null;
    } catch (error) {
        console.error(`Error fetching Amazon link: ${amazonLink}, Error: ${error.message}`);
        return null;
    }
};

module.exports = { getImage };

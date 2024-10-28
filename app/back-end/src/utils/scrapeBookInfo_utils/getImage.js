const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Check if the Amazon link is valid and scrape the image link.
 * Retries the request on 503 errors until successful or max retries are reached.
 * @param {string} userAgent - The user-agent string for the request.
 * @param {string} amazonLink - The Amazon link from the book data.
 * @returns {string|null} - The image link if found, otherwise null.
 */
const getImage = async (userAgent, amazonLink) => {
    // Skip URLs that contain '/gp/search'
    if (amazonLink.includes('/gp/search')) {
        console.log(`Skipping search URL`);
        return null;
    }

    const maxRetries = 5;
    let attempts = 0;
    let imageUrl = null;

    while (attempts < maxRetries) {
        try {
            const response = await axios.get(amazonLink, {
                headers: { 'User-Agent': userAgent },
            });

            const $ = cheerio.load(response.data);

            // Check for image with id 'landingImage'
            imageUrl = $('#landingImage').attr('src') || $('img.a-dynamic-image').attr('src');
            if (imageUrl) {
                return imageUrl;
            } else {
                console.error(`No image found for ${amazonLink}.`);
                return null;
            }

        } catch (error) {
            if (error.response && error.response.status === 503) {
                attempts += 1;
                console.error(`503 error on ${amazonLink}, retrying ${attempts}/${maxRetries}...`);
                await new Promise(resolve => setTimeout(resolve, 3000 * attempts)); // Delay increases with each retry
            } else {
                console.error(`Error fetching Amazon link: ${amazonLink}, Error: ${error.message}`);
                return null;
            }
        }
    }

    console.error(`Failed to fetch image for ${amazonLink} after ${maxRetries} retries.`);
    return null;
};

module.exports = { getImage };

const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { getImage } = require('../scrapeBookInfo_utils/getImage');

/**
 * Check if the Amazon link is valid and scrape the image link.
 * Retries the request on 503 errors until successful or max retries are reached.
 * @param {string} userAgent - The user-agent string for the request.
 * @param {string} amazonLink - The Amazon link from the book data.
 * @returns {string|null} - The image link if found, otherwise null.
 */

const getAmazonLinks = async (serieId) => {
    try {
        const { rows } = await poolpg.query(
            'SELECT amazon_link FROM books WHERE serie_id = $1 AND amazon_link IS NOT NULL ORDER BY serie_index',
            [serieId]
        );

        if (rows.length > 0) {
            return rows.map(row => row.amazon_link);
        } else {
            console.error(`No amazon_link found for series ID ${serieId}`);
            return null;
        }
    } catch (error) {
        console.error(`Database error fetching amazon_link: ${error.message}`);
        return null;
    }
};

const getSerieImage = async (userAgent, amazonLink, serieId) => {

    const maxRetries = 5;
    let attempts = 0;
    let imageUrl = null;

    const amazonLinks = (!amazonLink || amazonLink.includes('/gp/search'))
        ? await getAmazonLinks(serieId)
        : [amazonLink];


    if (!amazonLink || (amazonLink && amazonLink.includes('/gp/search'))) {
        for (const amazonLink of amazonLinks) {
            const image = await getImage(userAgent, amazonLink);
            if (image) {
                return image;
            } else {
                console.error(`No image found for ${amazonLink}.`);
            }
        }
        return null;
    }

    while (attempts < maxRetries) {
        try {
            const response = await axios.get(amazonLink, {
                headers: { 'User-Agent': userAgent },
            });

            const $ = cheerio.load(response.data);

            // Check for image with id 'landingImage'
            imageUrl = $('#seriesImageBlock').attr('src');
            if (imageUrl) {
                return imageUrl;
            } else {
                for (const amazonLink of amazonLinks) {
                    const image = await getImage(userAgent, amazonLink);
                    if (image) {
                        return image;
                    } else {
                        console.error(`No image found for ${amazonLink}.`);
                    }
                }
                return null;
            }
            // getImage(userAgent, amazon_link)

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

module.exports = { getSerieImage };

const axios = require('axios');
const cheerio = require('cheerio');
const { bookVerification } = require('./bookVerification');

/**
 * Get Amazon link for a book series by author.
 * @param {string} userAgent - The User-Agent string for the HTTP request.
 * @param {string} bookName - The name of the book series.
 * @param {string} authorName - The author's name.
 * @returns {string|null} - A valid Amazon link or null if not found.
 */
const getAmazonLink = async (userAgent, bookName, authorName) => {
    const searchQuery = `${bookName} by ${authorName} site:amazon.com`;
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

    try {
        // Fetch Google search results
        const response = await axios.get(googleSearchUrl, {
            headers: {
                'User-Agent': userAgent,
            },
        });

        // Load the response HTML into cheerio
        const $ = cheerio.load(response.data);

        // Select all <a> tags with jsname="UWckNb"
        const links = $('a[jsname="UWckNb"]');
        
        for (let i = 0; i < links.length; i++) {
            const link = $(links[i]);
            const href = link.attr('href');
            const title = link.find('h3').text();

            // Validate the link and title
            if ((href && title.includes(bookName) && !href.includes('/gp/search')) || await bookVerification(href, bookName)) {
                return href; // Return the first valid Amazon link
            }
        }

        console.log(`No valid Amazon link found for: ${bookName} by ${authorName}`);
        return null; // Return null if no valid link is found
    } catch (error) {
        console.error('Error fetching Amazon link:', error.message);
        return null;
    }
};

module.exports = { getAmazonLink };

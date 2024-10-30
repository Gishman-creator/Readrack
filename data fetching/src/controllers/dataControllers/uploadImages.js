const axios = require('axios');
const sharp = require('sharp');
const poolpg = require('../../config/dbpg3');
const { putImage } = require('../../utils/uploadImages/imageUtils');

let isUploading = false; // Lock variable to prevent multiple uploads at the same time

// Function to convert images to JPEG
const convertToJpg = async (input) => {
    return sharp(input)
        .jpeg({ quality: 80 }) // You can adjust the quality to reduce size
        .toBuffer();
};

const uploadImages = async (req, res) => {
    if (isUploading) {
        return; // Prevent multiple processes from running simultaneously
    }

    isUploading = true;

    try {
        const client = await poolpg.connect();

        // Fetch books with a missing image
        const { rows: books } = await client.query(`
            SELECT book_name, id, image_link FROM books 
            WHERE image IS NULL and image_link IS NOT NULL;
        `);

        if (books.length === 0) {
            console.log("No images to upload.");
            if (req.io) {
                req.io.emit('uploadMessage', 'No images to upload.');
            }
            client.release();
            isUploading = false;
            return;
        }

        const totalBooks = books.length;
        let processedBooks = 0;

        // Loop through books and upload each image
        for (const book of books) {
            const { book_name, id, image_link } = book;
            console.log(`Processing book ID ${book_name} with link: ${image_link.substring(0, 100)}`);

            try {
                // Download the image from the provided link
                const response = await axios.get(image_link, { responseType: 'arraybuffer' });
                const imageBuffer = await convertToJpg(Buffer.from(response.data));
                const mimetype = response.headers['content-type'] || 'image/jpeg';
                
                console.log("Mimetype:", mimetype);

                // Upload the converted image to S3
                const imageKey = await putImage({ buffer: imageBuffer, mimetype });

                // Update the book record with the S3 image key
                await client.query(`UPDATE books SET image = $1 WHERE id = $2;`, [imageKey, id]);

                processedBooks++;

                // Emit progress updates
                const progressPercentage = ((processedBooks / totalBooks) * 100).toFixed(2);
                const progress = `${processedBooks}/${totalBooks} (${progressPercentage}%)`;
                console.log(`Progress: ${progress}\n`);

                if (req.io) {
                    req.io.emit('uploadImagesProgress', progress);
                }

            } catch (error) {
                console.error(`Error processing book ID ${id}:`, error.message);
                continue; // Continue to the next book if an error occurs
            }
        }

        client.release();
        isUploading = false;
    } catch (error) {
        console.error('Error during image upload:', error.message);
        isUploading = false;
    }
};

module.exports = { uploadImages };

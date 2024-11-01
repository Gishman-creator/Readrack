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

const uploadSerieImages = async (req, res) => {
    if (isUploading) {
        return; // Prevent multiple processes from running simultaneously
    }

    isUploading = true;

    try {
        const client = await poolpg.connect();

        // Fetch series with a missing image
        const { rows: series } = await client.query(`
            SELECT serie_name, id, image_link FROM series 
            WHERE image IS NULL and image_link IS NOT NULL;
        `);

        if (series.length === 0) {
            console.log("No images to upload.");
            if (req.io) {
                req.io.emit('uploadMessage', 'No images to upload.');
            }
            client.release();
            isUploading = false;
            return;
        }

        const totalSeries = series.length;
        let processedSeries = 0;

        // Loop through series and upload each image
        for (const serie of series) {
            const { serie_name, id, image_link } = serie;
            console.log(`Processing serie ID ${serie_name} with link: ${image_link.substring(0, 100)}`);

            try {
                // Download the image from the provided link
                const response = await axios.get(image_link, { responseType: 'arraybuffer' });
                const imageBuffer = await convertToJpg(Buffer.from(response.data));
                const mimetype = response.headers['content-type'] || 'image/jpeg';
                
                console.log("Mimetype:", mimetype);

                // Upload the converted image to S3
                const imageKey = await putImage({ buffer: imageBuffer, mimetype });

                // Update the serie record with the S3 image key
                await client.query(`UPDATE series SET image = $1 WHERE id = $2;`, [imageKey, id]);

                processedSeries++;

                // Emit progress updates
                const progressPercentage = ((processedSeries / totalSeries) * 100).toFixed(2);
                const progress = `${processedSeries}/${totalSeries} (${progressPercentage}%)`;
                console.log(`Progress: ${progress}\n`);

                if (req.io) {
                    req.io.emit('uploadSerieImagesProgress', progress);
                }

            } catch (error) {
                console.error(`Error processing serie ID ${id}:`, error.message);
                continue; // Continue to the next serie if an error occurs
            }
        }

        client.release();
        isUploading = false;
    } catch (error) {
        console.error('Error during image upload:', error.message);
        isUploading = false;
    }
};

module.exports = { uploadSerieImages };

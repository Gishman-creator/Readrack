// utils/imageUtils.js
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const dotenv = require('dotenv');
const crypto = require('crypto');
const poolpg = require('../config/dbpg'); // Assuming poolpg is still needed for other database queries

dotenv.config();

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const bucketName = process.env.BUCKET_NAME_2;
const bucketRegion = process.env.BUCKET_REGION_2;
const accessKey = process.env.ACCESS_KEY_2;
const secretAccessKey = process.env.SECRET_ACCESS_KEY_2;

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion
});

// Function to convert images to JPEG
const convertToJpg = async (inputBuffer) => {
    return sharp(inputBuffer)
        .jpeg({ quality: 80 }) // Adjust quality if needed
        .toBuffer();
};

exports.putImage = async (id, file, table) => {
    let imageName = null;
    let generatedImageKey;
    let isUnique = false;

    if (id) {
        const query = `SELECT image FROM ${table} WHERE id = $1`; // Use parameterized query for PostgreSQL
        const { rows } = await poolpg.query(query, [id]);
        imageName = rows.length > 0 && rows[0].image ? rows[0].image : null; // Extract image field or set to null
    }

    while (!isUnique) {
        generatedImageKey = randomImageName();

        try {
            // Check if the generated generatedImageKey is unique across the authors, series, and books tables
            const queries = [
                'SELECT 1 FROM books WHERE image = $1',
                'SELECT 1 FROM authors WHERE image = $1',
                'SELECT 1 FROM series WHERE image = $1'
            ];
            
            const promises = queries.map(query => poolpg.query(query, [generatedImageKey]));
            const results = await Promise.all(promises);

            // Check if generatedImageKey is unique in all tables
            if (results.every(result => result.rowCount === 0)) {
                isUnique = true; // If generatedImageKey is unique across all tables
            }
        } catch (error) {
            console.error('Database check error:', error);
            throw new Error('Failed to check image uniqueness');
        }
    }

    const imageKey = imageName && imageName !== 'null' ? imageName : generatedImageKey;

    // Convert the file to JPEG format
    const jpegBuffer = await convertToJpg(file.buffer);

    const params = {
        Bucket: bucketName,
        Key: imageKey,
        Body: jpegBuffer,
        ContentType: 'image/jpeg', // Set the MIME type to JPEG
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    return imageKey;
};

exports.getImageURL = async (image) => {
    const getObjectParams = {
        Bucket: bucketName,
        Key: image,
    };

    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return url;
};

// Function to delete an image from S3
exports.deleteImage = async (imageKey) => {
    try {
        const deleteParams = {
            Bucket: bucketName,
            Key: imageKey,
        };

        const command = new DeleteObjectCommand(deleteParams);
        await s3.send(command);
        return { success: true, message: `Image ${imageKey} deleted successfully.` };
    } catch (error) {
        console.error(`Failed to delete image with key ${imageKey}:`, error);
        throw new Error('Failed to delete image from S3');
    }
};

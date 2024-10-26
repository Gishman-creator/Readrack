// utils/imageUtils.js
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require('dotenv');
const crypto = require('crypto');
const poolpg = require('../../config/dbpg'); // Assuming poolpg is still needed for other database queries

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

exports.putImage = async (buffer) => {
    let imageKey;
    let isUnique = false;

    while (!isUnique) {
        imageKey = randomImageName();

        try {
            // Check if the generated imageKey is already in the database
            const { rowCount } = await poolpg.query(
                'SELECT 1 FROM books WHERE image = $1',
                [imageKey]
            );

            if (rowCount === 0) {
                isUnique = true; // If rowCount is 0, the imageKey is unique
            }
        } catch (error) {
            console.error('Database check error:', error);
            throw new Error('Failed to check image uniqueness');
        }
    }

    // If unique, proceed to upload image to S3
    const params = {
        Bucket: bucketName,
        Key: imageKey,
        Body: buffer.buffer,
        ContentType: buffer.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    return imageKey;
};

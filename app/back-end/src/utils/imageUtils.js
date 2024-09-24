// utils/imageUtils.js
const pool = require('../config/db');
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const dotenv = require('dotenv');
dotenv.config();
const crypto = require('crypto');

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion
})

exports.putImage = async (id, file, table) => {
    let imageName = null;

    // console.log('The image id from put image is:', id);

    if (id) {
        const [rows] = await pool.query(`SELECT image FROM ${table} WHERE id = ?`, [id]);
        imageName = rows.length > 0 && rows[0].image ? rows[0].image : null; // Extract image field or set to null
        // console.log('The fetched image name is:', imageName);
    }

    const imageKey = imageName && imageName !== 'null' ? imageName : randomImageName();

    // console.log('The image key is:', imageKey);

    const params = {
        Bucket: bucketName,
        Key: imageKey,
        Body: file.buffer,
        ContentType: file.mimetype,
    }

    const command = new PutObjectCommand(params);
    await s3.send(command);

    return imageKey;
}

exports.getImageURL = async (image) => {

    const getObjectParams = {
        Bucket: bucketName,
        Key: image,
    }

    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    // console.log('The image url is:', url);

    return url;
}
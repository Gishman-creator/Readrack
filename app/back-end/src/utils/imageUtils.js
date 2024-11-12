// utils/imageUtils.js
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
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

exports.putImage = async (id, file, table) => {
    let imageName = null;

    if (id) {
        const query = `SELECT image FROM ${table} WHERE id = $1`; // Use parameterized query for PostgreSQL
        const { rows } = await poolpg.query(query, [id]);
        imageName = rows.length > 0 && rows[0].image ? rows[0].image : null; // Extract image field or set to null
    }

    const imageKey = imageName && imageName !== 'null' ? imageName : randomImageName();

    const params = {
        Bucket: bucketName,
        Key: imageKey,
        Body: file.buffer,
        ContentType: file.mimetype,
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

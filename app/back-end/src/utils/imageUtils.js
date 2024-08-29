// utils/imageUtils.js
exports.convertImageToBase64 = (imageBuffer) => {
    // Check if the buffer is valid, and convert it to base64 if true
    if (imageBuffer) {
        return imageBuffer.toString('base64');
    }
    return null;
}
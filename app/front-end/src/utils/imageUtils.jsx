// utils/conversionUtils.js

export function bufferToBlobURL(buffer) {
    if (!buffer || !buffer.data) {
      console.error('Invalid buffer:', buffer);
      return null; // or a default image URL
    }
    const blob = new Blob([new Uint8Array(buffer.data)], { type: 'image/jpeg' }); // Adjust type as needed
    return URL.createObjectURL(blob);
}

export async function downloadImage (url, seriesName) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image. Status: ${response.status}`);
    const blob = await response.blob();
    if (!blob || blob.size === 0) throw new Error('Empty blob received');
    const fileName = seriesName ? `${seriesName}.jpg` : 'series-image.jpg';
    const file = new File([blob], fileName, { type: blob.type });
    return file; // Return the created file
  } catch (error) {
    console.error('Error downloading image:', error);
    return null; // Return null in case of an error
  }
};
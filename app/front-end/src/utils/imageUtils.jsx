import blank_image from '../assets/brand_blank_image.png'; // Adjust the path according to your project structure

export function bufferToBlobURL(image) {
  try {
    if (!image || !image.data || image.data.length === 0) {
      // Return the blank image URL if the image data is null, undefined, or empty
      return blank_image;
    }

    // Convert to byte array
    const byteArray = new Uint8Array(image.data);
    const mimeType = 'image/jpeg'; // Adjust as needed
    const blob = new Blob([byteArray], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error creating image for series:', image, error);
    return blank_image; // Return the blank image URL in case of an error
  }
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
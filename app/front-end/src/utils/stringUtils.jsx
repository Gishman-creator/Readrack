// utils/stringUtils.js

export function capitalize(str) {
    if (!str) return str;
    return str
        .split(' ')           // Split the string into an array of words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
        .join(' ');    
}

export function formatDate(date) {
    if (!date) return date;
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
}

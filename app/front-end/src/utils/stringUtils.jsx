import { format, parseISO } from 'date-fns';

export function capitalize(str) {
    if (!str) return str;
    return str
        .split(' ')           // Split the string into an array of words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
        .join(' ');    
}

export function formatDate(date) {
    if (!date) return date;

    // Convert the date string to a Date object
    const d = new Date(date);

    // Extract day, month, and year in UTC
    const day = d.getUTCDate();
    const month = d.getUTCMonth(); // Zero-based month
    const year = d.getUTCFullYear();

    // Array of month names
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Format date as 'MMM d, yyyy'
    return `${monthNames[month]} ${day}, ${year}`;
}


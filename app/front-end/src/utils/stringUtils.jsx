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
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Format date as 'MMM d, yyyy'
    return `${monthNames[month]} ${day}, ${year}`;
}

export function calculateAgeAtDeath (dob, dod) {
    if (!dob || !dod) return null;

    const birthDate = new Date(dob);
    const deathDate = new Date(dod);

    let age = deathDate.getFullYear() - birthDate.getFullYear();

    // Adjust if the death date is before the birthday in the death year
    const monthDiff = deathDate.getMonth() - birthDate.getMonth();
    const dayDiff = deathDate.getDate() - birthDate.getDate();
    
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  };

export function spacesToHyphens(str) {
    if (!str) return str;
    return str.split(' ').join('-');  // Replace spaces with hyphens
}


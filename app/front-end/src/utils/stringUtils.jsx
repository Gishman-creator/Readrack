import { format, parseISO } from 'date-fns';

export function capitalize(str) {
    if (!str) return str;
    return str
        .split(' ')           // Split the string into an array of words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
        .join(' ');    
}

// New function to capitalize genres
export function capitalizeGenres(genreStr) {
    if (!genreStr) return genreStr;

    return genreStr
        .split(',')   // Split the string by commas into an array of genres
        .map(genre => capitalize(genre.trim())) // Trim whitespace and capitalize each genre
        .join(', ');  // Join the genres back together with commas and spaces
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


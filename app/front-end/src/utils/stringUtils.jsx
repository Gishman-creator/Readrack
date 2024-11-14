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
    return str.toLowerCase().split(' ').join('-');  // Replace spaces with hyphens
}

// New function to format series name
export function formatSeriesName(serieName) {
    if (!serieName) return '';

    // Remove extra spaces and capitalize each word
    let formattedName = capitalize(serieName.trim());

    // Check if the name ends with "series", "mystery", or "mysteries"
    const endsWithSeries = /(series|mystery|mysteries)$/i.test(formattedName);
    const endsWithSerie = /serie$/i.test(formattedName);

    if (endsWithSeries) {
        return formattedName; // Return as is if it ends with "series", "mystery", or "mysteries"
    } else if (endsWithSerie) {
        return formattedName.replace(/serie$/i, 'Series'); // Replace "serie" with "Series"
    } else {
        return `${formattedName} Series`; // Append "Series" if it doesn't end with any of the above
    }
}


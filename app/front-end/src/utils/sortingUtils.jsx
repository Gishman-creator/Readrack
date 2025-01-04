// Sorting function to handle null values
export function sortByFirstBookYearAsc(a, b) {
    const yearA = a.first_book_year || Infinity;  // Use a large value for nulls
    const yearB = b.first_book_year || Infinity;  // Use a large value for nulls
    return yearA - yearB;  // Ascending order
};

export function sortByPublishDateDesc(a, b) {
    // Parse publish dates
    const dateA = parsePublishDate(a.publish_date) || parsePublishDate(a.publish_year);
    const dateB = parsePublishDate(b.publish_date) || parsePublishDate(b.publish_year);

    // If both dates are null, consider them equal
    if (!dateA && !dateB) return 0;

    // If one date is null, consider it greater (push it later in ascending order)
    // if (!dateA) return 1;
    // if (!dateB) return -1;

    // If one date is null, consider it greater (push it later in descending order)
    if (!dateA) return -1;
    if (!dateB) return 1;

    // Compare dates in ascending order
    // return dateA - dateB;

    // Compare dates in descending order
    return dateB - dateA;
}

// Helper function to parse publish_date
function parsePublishDate(publish_date) {
    if (!publish_date) return null;

    // Attempt to parse full date, month-year, or year only
    const fullDate = new Date(publish_date); // Try parsing as a full date

    if (!isNaN(fullDate.getTime())) {
        return fullDate; // Return full date if valid
    }

    // If it's not a full date, try month-year format
    const monthYearMatch = publish_date.match(/(\w+)\s+(\d{4})/);
    if (monthYearMatch) {
        const month = monthYearMatch[1];
        const year = monthYearMatch[2];
        return new Date(`${month} 1, ${year}`); // Set day to 1
    }

    // If it's just a year, return a date object for January 1st of that year
    const yearMatch = publish_date.match(/^(\d{4})$/);
    if (yearMatch) {
        return new Date(`${yearMatch[1]}-01-01`);
    }

    // Return null if no valid format found
    return null;
}

export const sortByNumBooks = (data, ascending) => {
    return [...data].sort((a, b) => {
        if (ascending) {
            return a.num_books - b.num_books; // Ascending order
        } else {
            return b.num_books - a.num_books; // Descending order
        }
    });
};

export function sortBySerieIndexAsc(a, b) {
    const indexA = a.serie_index || Infinity;  // Use a large value for nulls
    const indexB = b.serie_index || Infinity;  // Use a large value for nulls
    return indexA - indexB;  // Ascending order
}

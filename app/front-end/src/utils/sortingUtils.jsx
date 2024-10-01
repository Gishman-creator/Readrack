// Sorting function to handle null values
export function sortByFirstBookYearAsc(a, b) {
    const yearA = a.first_book_year || Infinity;  // Use a large value for nulls
    const yearB = b.first_book_year || Infinity;  // Use a large value for nulls
    return yearA - yearB;  // Ascending order
};

// Function to parse custom date string into a Date object or year
function parseCustomDate(customDate) {
    if (!customDate) return null;

    const yearOnlyRegex = /^\d{4}$/;  // Matches only years like "1988"
    const monthYearRegex = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s\d{4}$/;  // Matches "April 1993"

    // If the custom date is only a year, return just the year
    if (yearOnlyRegex.test(customDate)) {
        return new Date(parseInt(customDate, 10), 0);  // January of the given year
    }

    // If the custom date includes a month and year, return full Date
    if (monthYearRegex.test(customDate)) {
        return new Date(customDate);
    }

    return null;
}

// Sorting function to handle both customDate and publishDate
export function sortByPublishDateAsc(a, b) {
    // Parse custom dates
    const customDateA = parseCustomDate(a.customDate);
    const customDateB = parseCustomDate(b.customDate);

    // Use publishDate if customDate is not available
    const dateA = customDateA || (a.publishDate ? new Date(a.publishDate) : null);
    const dateB = customDateB || (b.publishDate ? new Date(b.publishDate) : null);

    // If both dates are null, consider them equal
    if (!dateA && !dateB) return 0;

    // If one date is null, consider it greater (push it later in ascending order)
    if (!dateA) return 1;
    if (!dateB) return -1;

    // Compare dates in ascending order
    return dateA - dateB;
}

export const sortByNumBooks = (data, ascending) => {
    return [...data].sort((a, b) => {
        if (ascending) {
            return a.numBooks - b.numBooks; // Ascending order
        } else {
            return b.numBooks - a.numBooks; // Descending order
        }
    });
};

export function sortBySerieIndexAsc(a, b) {
    const indexA = a.serieIndex || Infinity;  // Use a large value for nulls
    const indexB = b.serieIndex || Infinity;  // Use a large value for nulls
    return indexA - indexB;  // Ascending order
}

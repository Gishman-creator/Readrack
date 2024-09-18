// Sorting function to handle null values
export function sortByFirstBookYearAsc(a, b) {
    const yearA = a.first_book_year || Infinity;  // Use a large value for nulls
    const yearB = b.first_book_year || Infinity;  // Use a large value for nulls
    return yearA - yearB;  // Ascending order
};

export function sortByPublishDateAsc(a, b) {
    const dateA = new Date(a.publishDate);
    const dateB = new Date(b.publishDate);
    return dateA - dateB;
};

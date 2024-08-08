// Data.jsx
import React from 'react';

const generateRandomData = (length, labels) => {
    return labels.map(label => ({
        name: label,
        visits: Math.floor(Math.random() * 4000 + 1000), // Random visitors between 1000 and 5000
    }));
};

// Labels for each time period
const hoursOfDay = Array.from({ length: 24 }, (_, i) => `${i}:00`);
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const daysOfMonth = Array.from({ length: 31 }, (_, i) => `${i + 1}`);
const monthsOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

// Generate data for each time period
export const dayData = generateRandomData(24, hoursOfDay);
export const weekData = generateRandomData(7, daysOfWeek);
export const monthData = generateRandomData(31, daysOfMonth);
export const yearData = generateRandomData(12, monthsOfYear);

// src/components/Data.jsx

const seriesData = [
    {
      name: "Harry Potter",
      author: "J.K. Rowling",
      numBooks: 7,
      genres: ["Fantasy", "Adventure"],
      amazonLink: "https://www.amazon.com/dp/B0192CTMYG",
    },
    {
      name: "The Lord of the Rings",
      author: "J.R.R. Tolkien",
      numBooks: 3,
      genres: ["Fantasy", "Epic"],
      amazonLink: "https://www.amazon.com/dp/B0026REBFK",
    },
    {
      name: "A Song of Ice and Fire",
      author: "George R.R. Martin",
      numBooks: 5,
      genres: ["Fantasy", "Drama"],
      amazonLink: "https://www.amazon.com/dp/B000QCS8TW",
    },
    {
      name: "A Song of Ice and Fire",
      author: "George R.R. Martin",
      numBooks: 5,
      genres: ["Fantasy", "Drama"],
      amazonLink: "https://www.amazon.com/dp/B000QCS8TW",
    },
    {
      name: "A Song of Ice and Fire",
      author: "George R.R. Martin",
      numBooks: 5,
      genres: ["Fantasy", "Drama"],
      amazonLink: "https://www.amazon.com/dp/B000QCS8TW",
    },
    {
      name: "A Song of Ice and Fire",
      author: "George R.R. Martin",
      numBooks: 5,
      genres: ["Fantasy", "Drama"],
      amazonLink: "https://www.amazon.com/dp/B000QCS8TW",
    },
    {
      name: "A Song of Ice and Fire",
      author: "George R.R. Martin",
      numBooks: 5,
      genres: ["Fantasy", "Drama"],
      amazonLink: "https://www.amazon.com/dp/B000QCS8TW",
    },
    {
      name: "A Song of Ice and Fire",
      author: "George R.R. Martin",
      numBooks: 5,
      genres: ["Fantasy", "Drama"],
      amazonLink: "https://www.amazon.com/dp/B000QCS8TW",
    },
    {
      name: "A Song of Ice and Fire",
      author: "George R.R. Martin",
      numBooks: 5,
      genres: ["Fantasy", "Drama"],
      amazonLink: "https://www.amazon.com/dp/B000QCS8TW",
    },
    {
      name: "A Song of Ice and Fire",
      author: "George R.R. Martin",
      numBooks: 5,
      genres: ["Fantasy", "Drama"],
      amazonLink: "https://www.amazon.com/dp/B000QCS8TW",
    },
    {
      name: "A Song of Ice and Fire",
      author: "George R.R. Martin",
      numBooks: 5,
      genres: ["Fantasy", "Drama"],
      amazonLink: "https://www.amazon.com/dp/B000QCS8TW",
    },
    {
      name: "A Song of Ice and Fire",
      author: "George R.R. Martin",
      numBooks: 5,
      genres: ["Fantasy", "Drama"],
      amazonLink: "https://www.amazon.com/dp/B000QCS8TW",
    },
    {
      name: "A Song of Ice and Fire",
      author: "George R.R. Martin",
      numBooks: 5,
      genres: ["Fantasy", "Drama"],
      amazonLink: "https://www.amazon.com/dp/B000QCS8TW",
    },
    {
      name: "A Song of Ice and Fire",
      author: "George R.R. Martin",
      numBooks: 5,
      genres: ["Fantasy", "Drama"],
      amazonLink: "https://www.amazon.com/dp/B000QCS8TW",
    },
    {
      name: "A Song of Ice and Fire",
      author: "George R.R. Martin",
      numBooks: 5,
      genres: ["Fantasy", "Drama"],
      amazonLink: "https://www.amazon.com/dp/B000QCS8TW",
    },
    {
      name: "A Song of Ice and Fire",
      author: "George R.R. Martin",
      numBooks: 5,
      genres: ["Fantasy", "Drama"],
      amazonLink: "https://www.amazon.com/dp/B000QCS8TW",
    },
    {
      name: "A Song of Ice and Fire",
      author: "George R.R. Martin",
      numBooks: 5,
      genres: ["Fantasy", "Drama"],
      amazonLink: "https://www.amazon.com/dp/B000QCS8TW",
    },
    {
      name: "A Song of Ice and Fire",
      author: "George R.R. Martin",
      numBooks: 7,
      genres: ["Fantasy", "Drama"],
      amazonLink: "https://www.amazon.com/dp/B000QCS8TW",
    },
  ];
  
  export default seriesData;
  
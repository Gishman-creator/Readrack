const poolpg = require('../../config/dbpg');

// Function to migrate authors
async function migrateAuthors() {
  try {
    const [authors] = await pool.query('SELECT * FROM authors');
    for (const author of authors) {
      await poolpg.query(
        `INSERT INTO authors (id, image, author_name, dob, nationality, biography, x, facebook, instagram, website, genre, awards, search_count, dod, customDob)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
        ON CONFLICT (id) DO NOTHING`, // Handle potential conflicts
        [
          author.id,
          author.image,
          author.author_name,
          author.dob,
          author.nationality,
          author.biography,
          author.x,
          author.facebook,
          author.instagram,
          author.website,
          author.genre,
          author.awards,
          author.search_count,
          author.dod,
          author.customDob,
        ]
      );
    }
    console.log('✅ Authors migrated successfully');
  } catch (error) {
    console.error('❌ Error migrating authors:', error.message);
  }
}

// Function to migrate series
async function migrateSeries() {
  try {
    const [series] = await pool.query('SELECT * FROM series');
    for (const serie of series) {
      await poolpg.query(
        `INSERT INTO series (id, image, serie_name, author_id, num_books, genre, link, search_count) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        ON CONFLICT (id) DO NOTHING`,
        [
          serie.id,
          serie.image,
          serie.serie_name,
          serie.author_id,
          serie.num_books,
          serie.genre,
          serie.link,
          serie.search_count,
        ]
      );
    }
    res.status(200).json({ message: 'Migration of series completed successfully.' });
  } catch (error) {
    // Send an error response in case of failure
    res.status(500).json({ error: 'Migration of series failed.', details: error.message }); 
  }
}

// Function to migrate collections
async function migrateCollections() {
  try {
    const [collections] = await pool.query('SELECT * FROM collections');
    for (const collection of collections) {
      await poolpg.query(
        `INSERT INTO collections (id, image, collectionName, author_id, genre, link, search_count) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        ON CONFLICT (id) DO NOTHING`,
        [
          collection.id,
          collection.image,
          collection.collectionName,
          collection.author_id,
          collection.genre,
          collection.link,
          collection.search_count,
        ]
      );
    }
    res.status(200).json({ message: 'Migration of collections completed successfully.' });
  } catch (error) {
    // Send an error response in case of failure
    res.status(500).json({ error: 'Migration of collections failed.', details: error.message });
  }
}

// Function to migrate books
async function migrateBooks() {
  try {
    const [books] = await pool.query('SELECT * FROM books');
    for (const book of books) {
      await poolpg.query(
        `INSERT INTO books (id, image, book_name, author_id, serie_id, collection_id, genre, publishDate, link, search_count, customDate, serie_index) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
        ON CONFLICT (id) DO NOTHING`,
        [
          book.id,
          book.image,
          book.book_name,
          book.author_id,
          book.serie_id,
          book.collection_id,
          book.genre,
          book.publishDate,
          book.link,
          book.search_count,
          book.customDate,
          book.serie_index,
        ]
      );
    }
    res.status(200).json({ message: 'Migration of books completed successfully.' });
  } catch (error) {
    // Send an error response in case of failure
    res.status(500).json({ error: 'Migration of books failed.', details: error.message });
  }
}

// Function to migrate visits
async function migrateVisits() {
  try {
    const [visits] = await pool.query('SELECT * FROM visits');
    for (const visit of visits) {
      await poolpg.query(
        `INSERT INTO visits (id, session_id, page_visited, visit_time, user_agent, ip_address) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        ON CONFLICT (id) DO NOTHING`,
        [
          visit.id,
          visit.session_id,
          visit.page_visited,
          visit.visit_time,
          visit.user_agent,
          visit.ip_address,
        ]
      );
    }
    res.status(200).json({ message: 'Migration of visits completed successfully.' });
  } catch (error) {
    // Send an error response in case of failure
    res.status(500).json({ error: 'Migration of visits failed.', details: error.message });
  }
}

// Function to run all migrations
async function runMigrations() {
  try {
    await migrateAuthors();
    await migrateSeries();
    await migrateCollections();
    await migrateBooks();
    await migrateVisits();

    // Optionally close the connection pools if they are no longer needed
    await pool.end();
    await poolpg.end();
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error; // Re-throw to handle it in the route
  }
}

module.exports = { runMigrations };

// src/routes/apiRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');

const {runMigrations} = require('../controllers/dataControllers/migrate');
const convertPublishDateController = require('../controllers/dataControllers/convertPublishDateController');
const { migrateDod } = require('../controllers/dataControllers/migrateDodController');
const { updateAuthorData } = require('../controllers/dataControllers/updateAuthorData');
const { validateAuthor } = require('../controllers/dataControllers/validateAuthor');
const { updateAuthorRatings } = require('../controllers/dataControllers/updateAuthorRatings');
const { scrapeBookSeriesInOrder } = require('../controllers/dataControllers/scrapeBookSeriesInOrder');
const { scrapeSeries } = require('../controllers/dataControllers/scrapeSeries');
const { scrapeSeriesBooks } = require('../controllers/dataControllers/scrapeSeriesBooks');
const { scrapeBookInfo } = require('../controllers/dataControllers/scrapeBookInfo');
const { scrapeBooks } = require('../controllers/dataControllers/scrapeBooks');
const { scrapeDistinctBooks } = require('../controllers/dataControllers/scrapeDistinctBooks');
const { scrapeAuthorImage } = require('../controllers/dataControllers/scrapeAuthorImage');
const { uploadImages } = require('../controllers/dataControllers/uploadImages');
const { scrapeBookImage } = require('../controllers/dataControllers/scrapeBookImage');
const { scrapeBookLink } = require('../controllers/dataControllers/scrapeBookLink');
const { validateBookName } = require('../controllers/dataControllers/validateBookName');
const { validateSeries } = require('../controllers/dataControllers/validateSeries');
// const dataController = require('../controllers/dataControllers/dataController')
// const generateDataController = require('../controllers/dataControllers/generateDataController');
// const getRandomBufferByType = require('../controllers/dataControllers/getRandomBufferByType')

// Middleware to handle file uploads
const storage = multer.memoryStorage(); // Use memory storage for BLOBs

const upload = multer({ storage });

router.post('/migrate', runMigrations);
router.post('/migrateDod', migrateDod);
router.post('/updateAuthorData', updateAuthorData);
router.post('/validateAuthors', validateAuthor);
router.post('/scrapeBookSeriesInOrder', scrapeBookSeriesInOrder);
router.post('/scrapeSeries', scrapeSeries);
router.post('/scrapeSeriesBooks', scrapeSeriesBooks);
router.post('/scrapeBookInfo', scrapeBookInfo);
router.post('/scrapeBooks', scrapeBooks);
router.post('/scrapeDistinctBooks', scrapeDistinctBooks);
router.post('/scrapeAuthorImage', scrapeAuthorImage);
router.post('/uploadImages', uploadImages);
router.post('/scrapeBookImage', scrapeBookImage);
router.post('/scrapeBookLink', scrapeBookLink);
router.post('/validateBookName', validateBookName);
router.post('/validateSeries', validateSeries);



module.exports = router;

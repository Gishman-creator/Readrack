// src/routes/apiRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const loginController = require('../controllers/authtentication/loginController');
const signupController = require('../controllers/authtentication/signupController');
const verificationController = require('../controllers/authtentication/verificationController');
const resendCodeController = require('../controllers/authtentication/resendCodeController');
const logoutController = require('../controllers/authtentication/logoutController');
const tokenValidationController = require('../controllers/authtentication/tokenValidationController');
const { addAuthor } = require('../controllers/catalogControllers/addAuthorController');
const { addBook } = require('../controllers/catalogControllers/addBookController');
const { addSeries } = require('../controllers/catalogControllers/addSeriesController');
const searchController = require('../controllers/catalogControllers/searchController');
const getSeriesController = require('../controllers/catalogControllers/getSeriesController');
const getBooksController = require('../controllers/catalogControllers/getBooksController');
const getAuthorsController = require('../controllers/catalogControllers/getAuthorsController');
const updateAuthorController = require('../controllers/catalogControllers/updateAuthorController');
const updateBookController = require('../controllers/catalogControllers/updateBookController');
const updateSerieController = require('../controllers/catalogControllers/updateSerieController');
const deleteDataController = require('../controllers/catalogControllers/deleteDataController');
const recommendationController = require('../controllers/otherControllers/recommendationController');
const getGenresController = require('../controllers/otherControllers/getGenresController');
const searchCountController = require('../controllers/otherControllers/searchCountController');
const logVisitsController = require('../controllers/otherControllers/logVisitsController');
const getCountController = require('../controllers/otherControllers/getCountController');

// Middleware to handle file uploads
const storage = multer.memoryStorage(); // Use memory storage for BLOBs

const upload = multer({ storage });

// Authentication routes
router.post('/auth/login', loginController.login);
// router.post('/auth/signup', signupController.signup);
router.post('/auth/verify', verificationController.verifyCode);
router.post('/auth/resend-code', resendCodeController.resendCode);
router.post('/auth/logout', logoutController.logout);
router.post('/auth/validate-tokens', tokenValidationController.validateTokens);

// Catalog routes
router.post('/addAuthor', upload.single('authorImage'), addAuthor);
router.post('/addBook', upload.single('bookImage'), addBook);
router.post('/addSeries', upload.single('seriesImage'), addSeries);
router.post('/incrementSearchCount', searchCountController.incrementSearchCount);

router.post('/visit', logVisitsController.logVisit);

router.put('/updateAuthor/:id', upload.single('authorImage'), updateAuthorController.updateAuthor);
router.put('/updateBook/:id', upload.single('bookImage'), updateBookController.updateBook);
router.put('/updateSerie/:id', upload.single('seriesImage'), updateSerieController.updateSerie);

router.delete('/deleteData', deleteDataController.deleteData);

// router.get('/searchAuthors', searchController.searchAuthors);
// router.get('/searchSeries', searchController.searchSeries);
router.get('/search', searchController.search);
router.get('/get-visits-data', logVisitsController.getVisitsData);
router.get('/getCount', getCountController.getCount);

router.get('/getSeries', getSeriesController.getSeries);
router.get('/getBooks', getBooksController.getBooks);
router.get('/getBookNames', getBooksController.getBookNames);
router.get('/getAuthors', getAuthorsController.getAuthors);

router.get('/getAuthorById/:id', getAuthorsController.getAuthorById);
router.get('/getSerieById/:id', getSeriesController.getSerieById);
router.get('/getBookById/:id', getBooksController.getBookById);

router.get('/getBooksBySerieId/:serie_id', getBooksController.getBooksBySerieId);
router.get('/getBooksByAuthorId/:author_id', getBooksController.getBooksByAuthorId);
router.get('/getSeriesByAuthorId/:author_id', getSeriesController.getSeriesByAuthorId)

router.get('/getAuthorsCount', getAuthorsController.getAuthorsCount);
router.get('/getSeriesCount', getSeriesController.getSeriesCount);

// Other routes
router.get('/getGenres', getGenresController.getGenresController);

router.post('/recommendAuthors', recommendationController.recommendAuthors)
router.post('/recommendSeries', recommendationController.recommendSeries)

module.exports = router;

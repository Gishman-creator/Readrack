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
const { searchAuthors, searchSeries } = require('../controllers/catalogControllers/searchCatalogDataController');
const getSeriesController = require('../controllers/catalogControllers/getSeriesController');
const getBooksController = require('../controllers/catalogControllers/getBooksController');
const getAuthorsController = require('../controllers/catalogControllers/getAuthorsController');

// Middleware to handle file uploads
const storage = multer.memoryStorage(); // Use memory storage for BLOBs

const upload = multer({ storage });

// Authentication routes
router.post('/auth/login', loginController.login);
router.post('/auth/signup', signupController.signup);
router.post('/auth/verify', verificationController.verifyCode);
router.post('/auth/resend-code', resendCodeController.resendCode);
router.post('/auth/logout', logoutController.logout);
router.post('/auth/validate-tokens', tokenValidationController.validateTokens);

// Catalog routes
router.post('/addAuthor', upload.single('authorImage'), addAuthor);
router.post('/addBook', upload.single('bookImage'), addBook);
router.post('/addSeries', upload.single('seriesImage'), addSeries);
router.get('/searchAuthors', searchAuthors);
router.get('/searchSeries', searchSeries);
router.get('/getSeries', getSeriesController.getSeries);
router.get('/getBooks', getBooksController.getBooks);
router.get('/getAuthors', getAuthorsController.getAuthors);

module.exports = router;

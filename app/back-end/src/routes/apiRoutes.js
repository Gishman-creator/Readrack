// src/routes/apiRoutes.js
const express = require('express');
const router = express.Router();
const loginController = require('../controllers/authtentication/loginController');
const signupController = require('../controllers/authtentication/signupController');
const verificationController = require('../controllers/authtentication/verificationController');
const resendCodeController = require('../controllers/authtentication/resendCodeController');
const logoutController = require('../controllers/authtentication/logoutController');
const tokenValidationController = require('../controllers/authtentication/tokenValidationController');

// Authentication routes
router.post('/auth/login', loginController.login);
router.post('/auth/signup', signupController.signup);
router.post('/auth/verify', verificationController.verifyCode);
router.post('/auth/resend-code', resendCodeController.resendCode);

// Apply middleware directly in route
router.post('/auth/logout', logoutController.logout);

// Route to validate tokens
router.post('/auth/validate-tokens', tokenValidationController.validateTokens);

module.exports = router;


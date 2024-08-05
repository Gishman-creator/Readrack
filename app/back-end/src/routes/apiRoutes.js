const express = require('express');
const router = express.Router();
const loginController = require('../controllers/authtentication/loginController')
const signupController = require('../controllers/authtentication/signupController')
const verificationController = require('../controllers/authtentication/verificationController')
const resendCodeController = require('../controllers/authtentication/resendCodeController')

// Authentication routes
router.post('/auth/login', loginController.login);
router.post('/auth/signup', signupController.signup);
router.post('/auth/verify', verificationController.verifyCode);
router.post('/auth/resend-code', resendCodeController.resendCode);


module.exports = router;
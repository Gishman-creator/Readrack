// src/controllers/authController.js
const { validateAccessToken, regenerateAccessToken } = require('../../middlewares/tokenValidationMiddleware');

exports.validateTokens = [
    validateAccessToken,
    async (req, res) => {
        try {
            res.status(200).json({ message: 'Token validated successfully', status: 'success' });
        } catch (err) {
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    }
];

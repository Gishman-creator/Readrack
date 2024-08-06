// middlewares/tokenValidationMiddleware.js
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const validateAccessToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    console.log("Validating access token:", token);

    if (!token) {
        console.log("No access token provided");
        return res.status(401).json({ message: 'No access token provided' });
    }

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.log("Access token error:", err);
            if (err.name === 'TokenExpiredError') {
                console.log("Token expired, regenerating...");
                return regenerateAccessToken(req, res, next);
            }
            return res.status(401).json({ message: 'Invalid access token' });
        }

        console.log("Access token is valid");
        req.user = decoded;
        next();
    });
};

const regenerateAccessToken = async (req, res, next) => {
    const refreshToken = req.headers['x-refresh-token'];

    console.log("Validating refresh token:", refreshToken);

    if (!refreshToken) {
        console.log("No refresh token provided");
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    try {
        jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                console.log("Refresh token error:", err);
                return res.status(401).json({ message: 'Invalid refresh token' });
            }

            const { email } = decoded;
            console.log("Checking refresh token in database for email:", email);
            const [rows] = await pool.query('SELECT * FROM admin WHERE email = ? AND refresh_token = ?', [email, refreshToken]);

            if (rows.length === 0) {
                console.log("No matching refresh token found in database");
                return res.status(401).json({ message: 'Refresh token does not match' });
            }

            const user = rows[0];

            const newAccessToken = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );

            console.log("New access token generated:", newAccessToken);

            // Send the new access token back in the response body
            res.status(200).json({
                message: 'Access token regenerated',
                accessToken: newAccessToken
            });
        });
    } catch (err) {
        console.log("Server error during token regeneration:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    validateAccessToken,
    regenerateAccessToken
};

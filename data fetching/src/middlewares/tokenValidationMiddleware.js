// middlewares/tokenValidationMiddleware.js
const jwt = require('jsonwebtoken');
const poolpg = require('../config/dbpg');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const validateAccessToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No access token provided' });
    }

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return regenerateAccessToken(req, res, next);
            }
            return res.status(401).json({ message: 'Invalid access token' });
        }

        req.user = decoded;
        next();
    });
};

const regenerateAccessToken = async (req, res, next) => {
    const refreshToken = req.headers['x-refresh-token'];

    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    try {
        jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid refresh token' });
            }

            const { email } = decoded;

            // Query to check the refresh token in the database
            const query = 'SELECT * FROM admin WHERE email = $1 AND refresh_token = $2';
            const { rows } = await poolpg.query(query, [email, refreshToken]);

            if (rows.length === 0) {
                return res.status(401).json({ message: 'Refresh token does not match' });
            }

            const user = rows[0];

            const newAccessToken = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );

            // Send the new access token back in the response body
            res.status(200).json({
                message: 'Access token regenerated',
                accessToken: newAccessToken
            });
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    validateAccessToken,
    regenerateAccessToken
};

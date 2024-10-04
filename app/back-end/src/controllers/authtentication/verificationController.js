const jwt = require('jsonwebtoken');
const poolpg = require('../../config/dbpg');

// Environment variables for token secrets
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

exports.verifyCode = async (req, res) => {
    const { email, code } = req.body;

    try {
        // Check if the verification code matches
        const { rows } = await poolpg.query(
            'SELECT * FROM admin WHERE email = $1 AND verification_code = $2', // Use $1 and $2 for parameterization
            [email, code]
        );

        if (rows.length > 0) {
            const user = rows[0];

            // Clear the verification code to prevent reuse
            await poolpg.query('UPDATE admin SET verification_code = NULL WHERE email = $1', [email]);

            // Generate access token with email
            const accessToken = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );

            // Generate refresh token
            const refreshToken = jwt.sign(
                { id: user.id, email: user.email },
                REFRESH_TOKEN_SECRET,
                { expiresIn: '14d' }
            );

            // Update the user's refresh token in the database
            await poolpg.query('UPDATE admin SET refresh_token = $1 WHERE email = $2', [refreshToken, email]);

            res.status(200).json({
                message: 'Verification successful',
                accessToken,
                refreshToken
            });
        } else {
            res.status(401).json({ message: 'Invalid verification code' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

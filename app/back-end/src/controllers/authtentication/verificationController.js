const jwt = require('jsonwebtoken');
const pool = require('../../config/db');

// Environment variables for token secrets
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

exports.verifyCode = async (req, res) => {
    const { email, verificationCode } = req.body;
    console.log(email, verificationCode);

    try {
        // Check if the verification code matches
        const [rows] = await pool.query('SELECT * FROM admin WHERE email = ? AND verification_code = ?', [email, verificationCode]);

        if (rows.length > 0) {
            const user = rows[0];

            // Clear the verification code to prevent reuse
            await pool.query('UPDATE admin SET verification_code = NULL WHERE email = ?', [email]);

            // Generate access token
            const accessToken = jwt.sign(
                { id: user.id, role: user.role },
                ACCESS_TOKEN_SECRET,
                { expiresIn: '1h' } // Set your desired expiration time
            );

            // Generate refresh token
            const refreshToken = jwt.sign(
                { id: user.id },
                REFRESH_TOKEN_SECRET,
                { expiresIn: '7d' } // Set your desired expiration time
            );

            // Optionally, update the user's refresh token in the database if needed
            await pool.query('UPDATE admin SET refresh_token = ? WHERE email = ?', [refreshToken, email]);

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

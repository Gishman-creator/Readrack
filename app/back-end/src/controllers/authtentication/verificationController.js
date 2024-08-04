const pool = require('../../config/db');

exports.verifyCode = async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND verification_code = ?', [email, verificationCode]);

        if (rows.length > 0) {
            // Clear the verification code to prevent reuse
            await pool.query('UPDATE users SET verification_code = NULL WHERE email = ?', [email]);

            res.status(200).json({ message: 'Verification successful' });
        } else {
            res.status(401).json({ message: 'Invalid verification code' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const pool = require('../../config/db');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../../services/emailService'); // Import the email service
const { generateVerificationCode } = require('../../utils/verificationUtils'); // Utility to generate code

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length > 0) {
            const user = rows[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                const verificationCode = generateVerificationCode();
                
                // Store the verification code in the database
                await pool.query('UPDATE users SET verification_code = ? WHERE email = ?', [verificationCode, email]);

                // Send the verification email
                await sendEmail(
                    email,
                    'Login Verification Code',
                    `Your verification code is: ${verificationCode}`,
                    `<p>Your verification code is: <strong>${verificationCode}</strong></p>`
                );

                res.status(200).json({ message: 'Login successful, verification email sent', user });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

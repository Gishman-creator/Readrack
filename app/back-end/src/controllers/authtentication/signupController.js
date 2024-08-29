// const pool = require('../../config/db');
// const bcrypt = require('bcryptjs');
// const { sendEmail } = require('../../services/emailService');
// const { generateVerificationCode } = require('../../utils/verificationUtils');

// exports.signup = async (req, res) => {
//     const { email, password, firstName, lastName } = req.body;
//     try {
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const verificationCode = generateVerificationCode();

//         // Insert user into the database with the verification code
//         await pool.query('INSERT INTO admin (email, password, firstName, lastName, verification_code) VALUES (?, ?, ?, ?, ?)', [email, hashedPassword, firstName, lastName, verificationCode]);

//         // Send the verification email
//         await sendEmail(
//             email,
//             'Signup Verification Code',
//             `Your verification code is: ${verificationCode}`,
//             `<p>Your verification code is: <strong>${verificationCode}</strong></p>`
//         );

//         res.status(201).json({ message: 'Signup successful, verification email sent' });
//     } catch (err) {
//         res.status(500).json({ message: 'Server error', error: err.message });
//     }
// };

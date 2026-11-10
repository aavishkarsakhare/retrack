
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// BRAND REGISTRATION
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email and password are required'
            });
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Save brand in database
        const result = await db.query(
            `INSERT INTO brands (name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, name, email`,
            [name, email, passwordHash]
        );

        res.status(201).json({
            message: 'Registration successful',
            brand: result.rows[0]
        });

    } catch (err) {
        console.error('Registration error:', err.message);

        if (err.code === '23505') {
            return res.status(409).json({
                message: 'Email already registered'
            });
        }

        res.status(500).json({
            message: 'Registration failed'
        });
    }
});

// BRAND LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find brand by email
        const result = await db.query(
            'SELECT * FROM brands WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const brand = result.rows[0];

        // Compare entered password with stored hash
        const isMatch = await bcrypt.compare(
            password,
            brand.password_hash
        );

        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { brandId: brand.id, email: brand.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token
        });

    } catch (err) {
        console.error('Login error:', err.message);

        res.status(500).json({
            message: 'Login failed'
        });
    }
});

module.exports = router;

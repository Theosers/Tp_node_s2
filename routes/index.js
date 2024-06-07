const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Page d'enregistrement
router.get('/register', (req, res) => {
    res.render('home', { errors: req.flash('errors') });
});

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    let errors = [];

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        errors.push('All fields are required.');
    }

    if (password !== confirmPassword) {
        errors.push('Passwords do not match.');
    }

    if (errors.length > 0) {
        req.flash('errors', errors);
        return res.redirect('/register');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        req.flash('errors', ['User already exists.']);
        return res.redirect('/register');
    }

    const user = new User({
        firstName,
        lastName,
        email,
        password: new User().generateHash(password)
    });

    await user.save();
    req.flash('success_message', 'Registration successful. Please log in.');
    res.redirect('/login');
});

// Page de login
router.get('/login', (req, res) => {
    res.render('layout/frontend', { errors: req.flash('errors') });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.validPassword(password)) {
        req.flash('errors', ['Invalid email or password.']);
        return res.redirect('/login');
    }

    req.session.user = user;
    res.redirect('/dashboard');
});

// Middleware de sécurité
function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        req.flash('errors', ['You must be logged in to view this page.']);
        res.redirect('/login');
    }
}

// Page dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('layout/dashboard', { user: req.session.user });
});

// Route de déconnexion
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        } else {
            res.redirect('/login');
        }
    });
});


module.exports = router;

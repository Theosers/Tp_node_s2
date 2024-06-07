import User from '../models/User.mjs';

export const renderRegisterPage = (req, res) => {
    res.render('register', { errors: res.locals.errors, success_message: res.locals.flash_message });
};

export const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Trim input fields
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    let errors = [];

    if (!trimmedFirstName || !trimmedLastName || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
        errors.push('All fields are required.');
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
        errors.push('Passwords do not match.');
    }

    if (errors.length > 0) {
        req.flash('errors', errors);
        return res.redirect('/register');
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
        req.flash('errors', ['User already exists.']);
        return res.redirect('/register');
    }

    const user = new User({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        password: new User().generateHash(trimmedPassword)
    });

    await user.save();
    req.flash('success_message', 'Registration successful. Please log in.');
    res.redirect('/login');
};

export const renderLoginPage = (req, res) => {
    res.render('layout/frontend', { errors: res.locals.errors, success_message: res.locals.flash_message });
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Trim input fields
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    const user = await User.findOne({ email: trimmedEmail });

    if (!user || !user.validPassword(trimmedPassword)) {
        req.flash('errors', ['Invalid email or password.']);
        return res.redirect('/login');
    }

    req.session.user = user;
    req.session.save(err => {
        if (err) {
            return res.redirect('/login');
        }
        res.redirect('/dashboard');
    });
};

export const renderDashboard = (req, res) => {
    res.render('layout/dashboard', { user: req.session.user });
};

export const logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/dashboard');
        } else {
            res.redirect('/login');
        }
    });
};

export const ensureAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.flash('errors', ['You must be logged in to view this page.']);
        res.redirect('/login');
    }
};

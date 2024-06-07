import express from 'express';
const router = express.Router();
import {
    renderRegisterPage,
    registerUser,
    renderLoginPage,
    loginUser,
    renderDashboard,
    logoutUser,
    ensureAuthenticated
} from '../controllers/controller.mjs';

// Page d'enregistrement
router.get('/register', renderRegisterPage);
router.post('/register', registerUser);

// Page de login
router.get('/login', renderLoginPage);
router.post('/login', loginUser);

// Page dashboard protégée par le middleware d'authentification
router.get('/dashboard', ensureAuthenticated, renderDashboard);

// Route de déconnexion
router.get('/logout', logoutUser);

export default router;

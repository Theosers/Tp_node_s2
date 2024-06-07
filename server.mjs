import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import flash from 'connect-flash';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import MongoStore from 'connect-mongo';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SECRET_KEY, // Replace with your secret key
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions'
    })
}));
app.use(flash());

app.use((req, res, next) => {
    res.locals.flash_message = req.flash('success_message');
    res.locals.errors = req.flash('errors');
    next();
});

// Set view engine
app.set('view engine', 'pug');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
import routes from './routes/index.mjs';
app.use('/', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

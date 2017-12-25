const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');

// Load User model
require('./model/User')

// Passport Config
require('./config/passport')(passport);


// Load Routes
const index = require('./route/index');
const auth = require('./route/auth');
const stories = require('./route/stories');

// Load Keys an connect to mongodb
mongoose.Promise = global.Promise;
// Connect to mongoose
const db = require('./config/key');
mongoose.connect(db.mongoURI, {
        useMongoClient: true
    }).then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

const app = express();

// Handlebars Middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');


app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global vars
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

app.use(express.static(path.join(__dirname,'public')))

app.use('/', index);
app.use('/auth', auth);
app.use('/stories', stories);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
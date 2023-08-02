// Require
// Linking buttons to requests for saved lists
// Linking food and event Trends
// Working out the logic for recommendations
const bodyParser = require('body-parser');
// const rateLimit = require('express-rate-limit');
// const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');

const express = require("express");
const app = express();
const listRouter = require("./routes/listRoutes")
const searchHistoryRouter = require("./routes/searchHistoryRoutes")
const eventTrendsRouter = require("./routes/eventTrendRoutes")
const foodTrendsRouter = require("./routes/foodTrendRoutes")
const path = require("path");


const mainPageRoute = require('./main-page');
app.use(bodyParser.urlencoded({extended : false}));

// Set view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Render the initial EJS file before defining your routers
// app.use("/", renderInitialPage);

// Set up the main page
app.use("/",mainPageRoute.routes);

// Navigate to eventTrendsRouter whenever the eventTrends route is requested
app.use("/api/eventTrends", eventTrendsRouter);

// Navigate to foodTrendsRouter whenever the foodTrends route is requested
app.use("/api/foodTrends", foodTrendsRouter);

// Navigate to listRouter whenever the lists route is requested
app.use("/:username/lists", listRouter);

// Navigate to searchHistoryRouter whenever the searchHistory route is requested
app.use("/:username/searchHistory", searchHistoryRouter);


module.exports = app;
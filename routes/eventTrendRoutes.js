const express = require("express");
const eventTrendsController = require("../controllers/eventTrendsController.js");
// Add { mergeParams: true } to merge parent route params with child route params
const router = express.Router({ mergeParams: true }); 

router
    .route("/")
    .get(eventTrendsController.getEventTrends)

module.exports = router;
const express = require("express");
const foodTrendsController = require("../controllers/foodTrendsController");
// Add { mergeParams: true } to merge parent route params with child route params
const router = express.Router({ mergeParams: true }); 

router
    .route("/")
    .get(foodTrendsController.getFoodTrends)

module.exports = router;
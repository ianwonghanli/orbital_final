const express = require("express");
const searchHistoryController = require("../controllers/searchHistoryController");
// Add { mergeParams: true } to merge parent route params with child route params
const router = express.Router({ mergeParams: true }); 

router
    .route("/")
    .post(searchHistoryController.createSearchHistory)
    .get(searchHistoryController.getSearchHistory)

module.exports = router;
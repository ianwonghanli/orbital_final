const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    searchHistory: {
        type: [String]
    }
});

module.exports = mongoose.model("searchHistory", searchHistorySchema, "searchHistory");
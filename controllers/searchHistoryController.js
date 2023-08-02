const SearchHistory = require("../models/searchHistoryModel");

// Adds a query to the user's array of search history
// Requires a username parameter and query variable in the body
exports.createSearchHistory = async (req, res) => {
    try {
        const { username } = req.params;
        const { query } = req.body;
        console.log(`Username is: ${username}`)
        console.log(`Query is: ${query}`)

        // Get user's search history by username
        const user = await SearchHistory.findOne({username});
        console.log("User is: ")
        console.log(user)

        // Add to user's search history
        user.searchHistory.push(query);
        console.log(`New search history is: ${user.searchHistory}`)

        // Save changes
        await user.save();

        res.status(201).json({
            status: "success",
            data: user.searchHistory
        })
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to create search history",
            error
        });
    }
}

// Returns the user's search history
// Requires a username parameter
exports.getSearchHistory = async (req, res) => {
    try {
        const { username } = req.params;
        console.log(`Username is: ${username}`)

        // Get user's search history by username
        const user = await SearchHistory.findOne({username});
        console.log("User is: ")
        console.log(user)

        res.json({
            status: "success",
            data: user.searchHistory
        })
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to get search history",
            error
        });
    }
}
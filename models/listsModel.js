const mongoose = require('mongoose');

const listsSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    lists: {
        type: [{
            listName: {
                type: String,
                required: true
            },
            placeIds: {
                type: [String]
            }
        }]
    }
});

module.exports = mongoose.model("Lists", listsSchema, "savedList");
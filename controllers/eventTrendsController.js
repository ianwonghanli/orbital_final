const path = require("path");
const fs = require("fs");
const JSONData = fs.readFileSync(path.join(__dirname, "../data/eventTrends.json"));

exports.getEventTrends = (req, res) => {
    console.log("I AM IN GET EVENT TRENDS");
  res.json(JSON.parse(JSONData));
};
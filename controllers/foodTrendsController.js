const path = require("path");
const fs = require("fs");
const JSONData = fs.readFileSync(path.join(__dirname, "../data/foodTrends.json"));

exports.getFoodTrends = (req, res) => {
  res.json(JSON.parse(JSONData));
};
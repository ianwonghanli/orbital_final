const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");


// Saves the variables in config.env to the nodejs environment variables
dotenv.config({path: "config.env"})

// Connect to the MongoDB database
const DB = "mongodb+srv://ianwonghanli:RKQ2912LqecxBrCA@orbitaldb.gxc40tw.mongodb.net/final";

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Connected to the database");
})
.catch((error) => {
    console.error("Database connection error:", error);
    process.exit(1);
});

// Set up a port to listen for requests
const port = 4000;
app.listen(port, () => {
    console.log(`Running on port ${port}`);
})
// This function will render the EJS file and send the response
const renderInitialPage = (req, res, next) => {
  if (req.url === "/") {
    console.log("renderInitialPage engaged")
    res.render("app");
  }
  next();
};

module.exports = renderInitialPage;
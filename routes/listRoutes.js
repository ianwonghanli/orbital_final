const express = require("express");
const listController = require("../controllers/listController");
// Add { mergeParams: true } to merge parent route params with child route params
const router = express.Router({ mergeParams: true }); 

router
    .route("/")
    .post(listController.createNewList)
    .get(listController.getAllLists)
    .delete(listController.deleteList)

router
    .route("/:listName")
    .get(listController.getList)
    .post(listController.addNewPlace)
    .patch(listController.updateListName)
    .delete(listController.deleteListPlace)

module.exports = router;
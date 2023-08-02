const List = require("../models/listsModel");

// For /lists

// Creates a new list for the user
// Request requires a username parameter and listName variable in body
exports.createNewList = async (req, res) => {
    try {
        console.log("I AM THE CREATE NEW LIST REQUEST")

        // Get the username and listName from the request parameters and body
        const { username } = req.params;
        const { listName } = req.body;
        console.log(`Username: ${username}`)
        console.log(`Listname: ${listName}`)
    
        // Find the user's lists by username
        const user = await List.findOne({ username });
        console.log("User is: ")
        console.log(user)

        // Check if a list with the same name already exists for the user
        const existingList = user.lists.find(list => list.listName === listName);
        if (existingList) {
            return res.status(400).json({
                status: "error",
                message: "List name already exists for this user",
            });
        }
        console.log("List name is unique")
    
        // Create a new list for the user
        const newList = { 
            listName, 
            placeIds: [] 
        };
        user.lists.push(newList);
        console.log(`New list is ${user.lists}`)
    
        // Save the updated user
        await user.save();

        console.log("CREATE NEW LIST REQUEST COMPLETED SUCCESSFULLY")
    
        res.status(201).json({
          status: "success",
          data: newList,
        });
      } catch (error) {
        res.status(500).json({
          status: "error",
          message: "Failed to create a new list",
          error
        });
      }
}

// Returns all lists of a user
// Request requires a username parameter
exports.getAllLists = async (req, res) => {
    try {
        const { username } = req.params;
        console.log(`username is ${username}`);
    
        // Find the lists by username
        const user = await List.findOne({username});
        console.log("User is: ")
        console.log(user);
    
        res.json({
          status: "success",
          data: user.lists,
        });
      } catch (error) {
        res.status(500).json({
          status: "error",
          message: "Failed to retrieve lists",
        });
      }
}

// Removes the specified list
// Requires a username parameter and listName variable from body
exports.deleteList = async (req, res) => {
    try {
        console.log("I AM THE DELETE LIST REQUEST")
        const { username } = req.params;
        const { listName } = req.body
        console.log(`Username: ${username}`)
        console.log(`listName: ${listName}`)

        // Find the user's lists by username
        const user = await List.findOne({username});
        console.log("User is: ")
        console.log(user)

        // Find the index of the element with listName
        const indexToRemove = user.lists.findIndex(list => list.listName === listName);
        console.log(`Index to remove is: ${indexToRemove}`)

        if (indexToRemove === -1) {
            return res.status(404).json({
              status: "error",
              message: "List not found",
            });
        }
        console.log("List exists")

        // Remove the list from the user's lists array
        user.lists.splice(indexToRemove, 1);
        console.log(`New lists are ${user.lists}`)

        // Save the updated user
        await user.save();

        console.log("DELETE REQUEST COMPLETED SUCCESSFULLY")
        res.json({
            status: "success",
            message: "List deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to delete the list"
        });
    }
}

// For lists/listId

// Takes a place as input and adds it to the list
// Requires a username and listName parameter and placeId variable in body)
exports.addNewPlace = async (req, res) => {
    try {
        const { username, listName } = req.params;
        const { placeId } = req.body;
        console.log(`Username: ${username}`)
        console.log(`List name: ${listName}`)
        console.log(`PlaceId: ${placeId}`)

        // Find the user's lists by username
        const user = await List.findOne({username});
        console.log("User is: ")
        console.log(user)

        // Find the index of the element with listName
        const listIndex = user.lists.findIndex(list => list.listName === listName);
        console.log(`List index is: ${listIndex}`)

        if (listIndex === -1) {
            return res.status(404).json({
            status: "error",
            message: "List not found",
            });
        }
        console.log("List exists")

        const list = user.lists[listIndex]
        console.log(`List is ${list}`)

         // Check if the place already exists in the list
         const existingPlace = list.placeIds.find(place => place === placeId);
         if (existingPlace) {
             return res.status(400).json({
                 status: "error",
                 message: "Place already exists in the list",
             });
         }

        // Add the place to the list
        list.placeIds.push(placeId);
        console.log(`Updated list is: ${list}`)

        // Save the updated user
        user.save()

        res.json({
            status: "success",
            data: list
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to add a new place to the list"
        });
    }
}


// Returns the specified list
// Requires a username and listName parameter
exports.getList = async (req, res) => {
    try {
        const { username, listName } = req.params;

        // Find the user's lists by username
        const user = await List.findOne({username});

       // Find the index of the element with listName
        const listIndex = user.lists.findIndex(list => list.listName === listName);
        console.log(`List index is: ${listIndex}`)

        if (listIndex === -1) {
            return res.status(404).json({
            status: "error",
            message: "List not found",
            });
        }
        console.log("List exists")

        res.json({
            status: "success",
            data: user.lists[listIndex]
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to retrieve the list"
        });
    }
}

// Takes a name as input and changes the name of the list 
// Requires a username and listName parameter and newListName variable in body)
exports.updateListName = async (req, res) => {
    try {
        console.log("THIS IS THE START OF UPDATE LIST NAME")
        const { username, listName } = req.params;
        const { newListName } = req.body;
        console.log(`Username: ${username}`)
        console.log(`listName: ${listName}`)
        console.log(`newListName: ${newListName}`)

        // Find the user's lists by username
        const user = await List.findOne({username});

        // Check if newListName is unique
        const duplicateIndex = user.lists.findIndex(list => list.listName === newListName);
        console.log(`Duplicate name at index: ${duplicateIndex}`)

        if (duplicateIndex !== -1) {
            return res.status(404).json({
            status: "error",
            message: "List name already exists",
            });
        }
        console.log("List name is unique")

        // Find the index of the element with listName
        const listIndex = user.lists.findIndex(list => list.listName === listName);
        console.log(`List index is: ${listIndex}`)

        if (listIndex === -1) {
            return res.status(404).json({
            status: "error",
            message: "List not found",
            });
        }
        console.log("List exists")

        // Find the list within the user's lists array
        const list = user.lists[listIndex];
        console.log(`List is: ${list}`)

        // Update the list name
        list.listName = newListName;
        console.log(`New list name is: ${list.listName}`)

        // Save the updated user
        await user.save();

        res.json({
            status: "success",
            data: list,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to update the name of the list"
        });
    }
}

// Deletes the specified place 
// Requires a username and listName parameter and placeId in body)
exports.deleteListPlace = async (req, res) => {
    try {
        console.log("I AM IN DELETE LIST PLACE")
        const { username, listName } = req.params;
        const { placeId } = req.body;
        console.log(`Username: ${username}`)
        console.log(`listName: ${listName}`)
        console.log(`placeId: ${placeId}`)

        // Find the user's lists by username
        const user = await List.findOne({username});
        console.log("User is: ")
        console.log(user);

       // Find the index of the element with listName
       const listIndex = user.lists.findIndex(list => list.listName === listName);
       console.log(`List index is: ${listIndex}`)

       if (listIndex === -1) {
           return res.status(404).json({
           status: "error",
           message: "List not found",
           });
       }
       console.log("List exists")

        // Find the list within the user's lists array
        const list = user.lists[listIndex];
        console.log(`List is ${list}`)

        // Find the index of the element with listName
        const placeIndex = list.placeIds.indexOf(placeId);
        console.log(`Index of placeId is: ${placeIndex}`)

        if (placeIndex === -1) {
            return res.status(404).json({
            status: "error",
            message: "Place is not in the list",
            });
        }
        console.log("placeId is in the list")

        // Remove the place from the list
        list.placeIds.splice(placeIndex, 1);
        console.log(`New placeId array is ${list.placeIds}`)
            

        // Save the updated user
        await user.save();

        res.json({
            status: "success",
            data: list
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to delete the place from the list"
        });
    }
}
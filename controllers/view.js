const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const {promisify} = require('util');
const jwt = require('jsonwebtoken');


exports.getPage = catchAsync(async (req,res, next) => {
    console.log("I AM IN GETPAGE RIGHT NOW")
    const token = req.cookies.jwt;
    if (token) {
        console.log("THERE IS A TOKEN!")

        // 1) verify token
        const decoded = await promisify(jwt.verify)(
            req.cookies.jwt,
            'secret'
        );

        // 2) Check if user still exists
        const currentUser = await User.findById(decoded.id);

        if (!currentUser) {
            console.log("There isn't a user inside this token!");
            res.status(200).render('app');
        }

        // THERE IS A LOGGED IN USER
        console.log(currentUser.name);
        // const jsonData = JSON.stringify(currentUser);
        // console.log(jsonData);
        res.status(200).render('app', {
            name: currentUser.name,
            email: currentUser.email
        });
        // console.log(res.locals.user.name);
        // res.json(currentUser); // Send the user data as a JSON response to the front-end

        

    } else {
        console.log("THERE IS NO TOKEN")
        console.log("No user! All features are disabled!");
        // const user = req.locals.users; // Assuming req.locals.users contains the user data
        res.status(200).render('notLoggedIn', {
            name: "",
            email: ""
        });
    }
});
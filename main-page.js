const path = require('path');
const express = require('express');
const router = express.Router();

const userController = require('./controllers/userController');
const viewController = require('./controllers/view');


// router.get('/', )

router.use(userController.isLoggedIn);


router.get('/', userController.isLoggedIn, viewController.getPage);

router.get('/signup', userController.getSignUpForm);
router.post('/signup', userController.signup);
router.get('/login', userController.isLoggedIn, userController.getLoginForm);
router.post('/login', userController.login);
router.get('/logout', userController.logout);

// Protect all routes after this middleware
router.use(userController.protect);

exports.routes = router;

const {promisify} = require('util');
const User = require('./../models/userModel');
const List = require("./../models/listsModel");
const SearchHistory = require("./../models/searchHistoryModel");
const jwt = require('jsonwebtoken');
const AppError = require('./../views/appError');

const catchAsync = fn => {
    return (req,res,next) => {
        fn(req,res,next).catch(err => next(err));
    };
};

const signToken = id => {
    return jwt.sign({id}, 'secret', {
        expiresIn: '1y'
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
      expires: new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  
    res.cookie('jwt', token, cookieOptions);
  
    // Remove password from output
    user.password = undefined;
  
    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
};


exports.signup = catchAsync(async (req, res, next) => {
  console.log("I AM IN USER CONTROLLER SIGNUP")
  if (req.body.password != req.body.cpassword) {
    return next(
      new AppError('Password is different from confirm password. Please try again!', 401)
    );
  }

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    cpassword: req.body.cpassword
  });
  
  console.log("New User is: ")
  console.log(newUser)

  const newSavedList = await List.create({
    username: req.body.name,
    lists: []
  })

  console.log("New Saved List is: ")
  console.log(newSavedList)

  const newSearchHistory = await SearchHistory.create({
    username: req.body.name,
    SearchHistory: []
  })

  console.log("New SearchHistory is: ")
  console.log(newSearchHistory)

  createSendToken(newUser, 201, res);

});


exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;

    // check if email and password is present
    if(!email || !password) {
        return next(new AppError('Please provide an email and password', 401));
    }

    // check if password is correct
    const user = await User.findOne({email}).select('+password');

    if(!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect Email or Password', 401));
    }

    // if everything is ok, send token to user
    createSendToken(user, 200, res);
    // const token = signToken(user._id);
    // res.status(200).json({
    //     status:'success',
    //     token,
    //     data: {
    //         user: newUser
    //     }
    // });
});


exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
  
    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }
  
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, 'secret');
  
    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }
  
    // // 4) Check if user changed password after the token was issued
    // if (currentUser.changedPasswordAfter(decoded.iat)) {
    //   return next(
    //     new AppError('User recently changed password! Please log in again.', 401)
    //   );
    // }
  
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  });


exports.getLoginForm = (req,res) => {
    res.status(200).render('login');
}

exports.getSignUpForm = (req,res) => {
    res.status(200).render('signup');
}


exports.isLoggedIn = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        // console.log("yes");
        try {
            // 1) verify token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                'secret'
            );

            // 2) Check if user still exists
            const currentUser = await User.findById(decoded.id);

            if (!currentUser) {
                return next();
            }

            // // 3) Check if user changed password after the token was issued
            // if (currentUser.changedPasswordAfter(decoded.iat)) {
            //     return next();
            // }

            // THERE IS A LOGGED IN USER
            res.locals.user = currentUser;
            // console.log(res.locals.user.name);
            return next();

        } catch (err) {

            return next();
        }
    }
    next();
};

exports.logout = async function(req, res) {
  res.clearCookie('jwt');
  res.status(200).json({ status: 'success' });
}
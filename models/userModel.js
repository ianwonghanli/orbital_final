const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const catchAsync = fn => {
    return (req,res,next) => {
        fn(req,res,next).catch(err => next(err));
    };
};

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'userid needs a name'],
        minlength: 1,
        unique: true
    },
    email: {
        type: String,
        required: [true, 'userid needs an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'userid needs a password'],
        minlength: 6,
        select: false
    }
});


userSchema.pre('save', async function(next) {
    // Function is only run when password is modified
    if (!this.isModified('password')) return next();

    
    this.password = await bcrypt.hash(this.password, 12);

    // this.passwordConfirm = undefined;
    next();
});


userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

const user = mongoose.model('userScehma', userSchema);


// const us = new user({
//     name: 'jordyy',
//     email: 'jordanfirstemail@gmail.com',
//     password: 'testing12345'
// });

// us.save().then(doc => {
//     console.log(doc);
// }).catch(err => {
//     console.log(err);
// })



module.exports = user;
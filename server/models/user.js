const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');


//Step 1 : use Schema to create an Object
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

//Step 2: Create Methods
UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
};



//create Methodes
UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({ _id: user._id.toHexString(), access }, 'abc123').toString();

  user.tokens = user.tokens.concat([{ access, token }]);

  return user.save().then(() => {
    return token;
  });
};


// find by token
UserSchema.statics.findByToken = function (token) {
  var User = this;


  var decoded;

  try {

    decoded = jwt.verify(token, 'abc123');

  } catch (e) {

    // very important to learn how promisses works

    return Promise.reject("Invalide Authentication Token");
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
}


// mideware functions 
UserSchema.pre('save', function (next) {
  var user = this;

  if (user.isModified('password')) {


    bcrypt.genSalt(10, (err, slat) => {
      bcrypt.hash(user.password, slat, (err, hash) => {
        user.password = hash
        next();
      });
    });
  } else {
    next();
  }
});

 
var User = mongoose.model('User', UserSchema);

module.exports = { User }

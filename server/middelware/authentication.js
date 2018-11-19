
var {User} = require('../models/user')

var authentication = (req,res,next) =>{
    var token = req.header('x-auth');
  


    User.findByToken(token).then((user)=>{
  
      if(!user)
      return Promise.reject();
  
     req.user = user;
     req.token = token;
  
     next();
    }).catch((err)=>{
  
      res.status('404').send({"error":err});
    });
  };

  module.exports = {
    authentication
  }
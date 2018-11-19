// const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt =  require('bcryptjs');

var  password = '1234567'

bcrypt.genSalt(10,(err,slat)=>{
  bcrypt.hash(password,slat,(err,hash)=>{
    console.log(hash);
  });
});

var hased = "$2a$10$cKc3OEqyee3WVGS1k8x0H.1A3yFtrIyb/bIcUBD9/.gk08yujqro2";
bcrypt.compare(password,hased,(err,resultHash)=>{
  console.log(resultHash);

})
// var data = {
//   id: 10
// };

// var token = jwt.sign(data, '123abc');
// console.log(token);

// var decoded = jwt.verify(token, '123abc');
// console.log('decoded', decoded);

// var message = 'I am user number 3';
// var hash = SHA256(message).toString();
//
// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);

// var data = {
//   id: 4
// };
// var token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// }
//
//
// // token.data.id = 5;
// // token.hash = SHA256(JSON.stringify(token.data)).toString();
//
//
// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();
// if (resultHash === token.hash) {
//   console.log('Data was not changed');
// } else {
//   console.log('Data was changed. Do not trust!');
// }

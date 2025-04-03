const bcrypt = require('bcryptjs');
const password = '123456'; // your plaintext password
bcrypt.genSalt(10, function(err, salt) {
  bcrypt.hash(password, salt, function(err, hash) {
    if(err) throw err;
    console.log('Hashed password:', hash);
  });
});

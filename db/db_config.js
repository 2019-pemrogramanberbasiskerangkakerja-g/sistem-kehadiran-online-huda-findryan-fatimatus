var mysql = require('mysql');

var db = mysql.createConnection({
    host: "157.230.42.89",
    user: "yayan",
    password: "yayan123",
    database: "safario2"
});

db.connect(function(err) {
  if (err){
    console.log('Cek your DB Connection');
    console.log(err);
  }else{
    console.log('You are now connected with mysql database...');
  }
});

module.exports = db;
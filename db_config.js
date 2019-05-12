var mysql = require('mysql');

var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "safario"
});

db.connect(function(err) {
    if (error){
      console.log(error);
    }else{
    	console.log("Connected!");
    }
    
});

module.exports = db;
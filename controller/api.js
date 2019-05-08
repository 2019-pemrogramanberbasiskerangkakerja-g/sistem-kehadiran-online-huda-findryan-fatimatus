var db = require("../db_config");
var express = require('express');
var router = express.Router();

router.get('/login/:username/:password', function (req, res) {
   db.query('select * from user where username=? and password=?',
   [req.params.username,req.params.password], function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    });
});

router.post('/login2', function (req, res) {
	var user = req.body.username;
    var passw = req.body.password;
	var params = req.body;
	console.log(user);
   db.query('select * from user where username=? and password=?',
   [req.params.username,req.params.password], function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    });
});

module.exports = router;
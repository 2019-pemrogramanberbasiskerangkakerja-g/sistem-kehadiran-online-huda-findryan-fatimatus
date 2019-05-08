var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var nunjucks  = require('nunjucks');

var root = express();

root.use(cookieParser());
root.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

root.use(bodyParser.urlencoded({extended : true}));
root.use(bodyParser.json());

root.use(express.static(__dirname + '/assets'));


// Apply nunjucks and add custom filter and function (for example). 
root.set('view engine', 'njk');
var env = nunjucks.configure(['views/'], { // set folders with templates
    autoescape: true, 
    express: root
});

env.addFilter('myFilter', function(obj, arg1, arg2) {
    console.log('myFilter', obj, arg1, arg2);
    // Do smth with obj
    return obj;  
});
env.addGlobal('myFunc', function(obj, arg1) { 
    console.log('myFunc', obj, arg1);
    // Do smth with obj
    return obj;
});

//----login
var auth = require('./controller/auth.js');
root.use('/auth', auth);
//----endlogin

//----login
var register = require('./controller/register.js');
root.use('/register', register);
//----endlogin

//----dosen
var dosen = require('./controller/dosen.js');
root.use('/dosen', dosen);
//----enddosen

//----mahasiswa
var mahasiswa = require('./controller/mahasiswa.js');
root.use('/mahasiswa', mahasiswa);
//----endmahasiswa

var api = require('./controller/api.js');
root.use('/api', api);

//dashboard
root.get('/dashboard', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});
root.post('/login2', function (req, res) {
    var params = req.body;
    console.log(params.username);
   db.query('select * from user where username=? and password=?',
   [req.params.username,req.params.password], function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    });
});

//----api
// var api = require('./controller/api.js');
// root.use('/api', api);
//----endmahasiswa

module.exports = root;
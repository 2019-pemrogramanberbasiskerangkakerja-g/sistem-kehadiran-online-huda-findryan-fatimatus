var http = require("http");
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var md5 = require('md5');
var nunjucks  = require('nunjucks');
var mysql      = require('mysql');

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

var db = mysql.createConnection({
  host     : 'localhost', //mysql database host name
  user     : 'root', //mysql database user name
  password : '', //mysql database password
  database : 'safario' //mysql database name
});

db.connect(function(err) {
  if (err){
    console.log('Cek your DB Connection');
    console.log(err);
  }else{
    console.log('You are now connected with mysql database...');
  }
})


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

//----auth
root.get('/auth', function(request, response) { 
  if(request.session.flashdata){
    var flash = request.session.flashdata;
  }
  response.render('auth/login.njk',{flash});
});

root.post('/auth/login', function(request, response) {
  var user = request.body.username;
  var passw = request.body.password;
  var pass = md5(passw);
  console.log("user "+user);
  console.log("pass "+pass);
    // console.log("PASSWORD2 "+pass);
    let sql = "SELECT * FROM user where nrp_nip ='"+user+"' AND password='"+pass+"' limit 1";
    let query = db.query(sql, (err, results, fields) => {
      if(err){
        console.log(err);
      }
        // console.log(results);
        if (results.length > 0) { 
            //add to session         
            request.session.id_user = results[0].id_user;
            request.session.nrp_nip = results[0].nrp_nip;
            request.session.nama_user = results[0].nama_user;
            request.session.role = results[0].role;

            if(request.session.role == 1){
              response.redirect('/dosen');
            }else{
                // response.redirect('/mahasiswa');
                response.redirect('/mahasiswa');
              }


            }else{
            // console.log("SALLAH");
            request.session.flashdata = "Kombinasi username dan password salah !!";
            response.redirect('/auth');
          }
        });
  });


root.get('/auth/logout', function(request, response) {
  request.session.destroy();    
  response.redirect('/auth');
});
//-----------------------ENDAUTH-----------------

//----REGISTER-----------------------
root.get('/auth/register', function(request, response) {
  response.render('auth/register');
});

root.post('/auth/registeruser', function(request, response) {
  var user = request.body.username;
  var passw = request.body.password;
  var pass = md5(passw);
  var nama = request.body.nama;
  var category = request.body.category;

  let sql = "SELECT * FROM user where nrp_nip ='"+user+"'";
  let query = db.query(sql, (err, results, fields) => {
    if (results.length > 0) {        
      request.session.flashdata = "NRP/NIP telah digunakan oleh akun lain";
      response.redirect('/auth');
    }else{
      let sql = "INSERT INTO `user`(`nrp_nip`,`nama_user`,`password`,`role`) values ('"+user+"','"+nama+"','"+pass+"','"+category+"')";
      db.query(sql, function (err, result) {
        if(err){
          console.log(err);
        }else{
          console.log("Number of records inserted: " + result.affectedRows);
        }
      });
      request.session.flashdata = "Akun "+nama+" berhasil dibuat";
      response.redirect('/auth');
    }
  });
});
//-------------------ENDREGISTER--------------------

//-------------------DOSEN---------------------
root.get('/dosen', function(request, response) {
  if (request.session.role != 1) {
    response.redirect('/mahasiswa');
  }else{
    var username = request.session.nrp_nip;
    var nama = request.session.nama_user; 
    var id = request.session.id_user;
    let sql = "SELECT * FROM matkul";
    let query = db.query(sql, (err, results,fields) => {
      if(err)if(err){
        console.log(err);
      }
      response.render('dosen/index',{results,nama,id,username});
    });
  }
});

root.post('/dosen/addkelas', function(request, response) {
  var nama_matkul = request.body.nama_matkul;
  var kelas = request.body.kelas;
  sql = "INSERT INTO `matkul`(`nama_matkul`,`kelas`) values ('"+nama_matkul+"','"+kelas+"')";
  query = db.query(sql, (err, results) => {
    if(err){
      console.log(err);
    }
    response.redirect('/dosen');
  });
});

root.get('/createJadwal', function(request, response) {
 let sql = "SELECT * FROM matkul";
 let query = db.query(sql, (err, results,fields) => {
     if (error){
      console.log(error);
    }
         response.render('/dosen/index.njk',{results});
 });
});

root.post('/TambahJadwal', function(request, response) {
 var matkul = request.body.matkul;
 var pertemuan_ke = request.body.pertemuan_ke;
 var waktu_awal = request.body.waktu_awal;
 var waktu_akhir = request.body.waktu_akhir;
 var ruangan = request.body.ruangan;

 let sql = "INSERT  INTO `transaksi_matkul`(`id_matkul`,`pertemuan_ke`,`waktu_awal`,`waktu_akhir`,`ruangan`) values ('"+matkul+"','"+pertemuan_ke+"','"+waktu_awal+"','"+waktu_akhir+"','"+ruangan+"')";
 let query = db.query(sql, (err, results) => {
      if (error){
      console.log(error);
    }
     response.redirect('/dosen');
 });
});

root.get('/createPeserta', function(request, response) {
 let sql = "SELECT * FROM user WHERE role_user = '2'";
 let query = db.query(sql, (err, results,fields) => {
      if (error){
      console.log(error);
    }
         response.render('/dosen/index.njk',{results});
 });
});

root.post('/TambahPeserta', function(request, response) {
 var matkul = request.body.matkul;
 var user = request.body.user;

 let sql = "INSERT  INTO `daftar_peserta`(`id_matkul`,`id_user`) values ('"+matkul+"','"+user+"')";
 let query = db.query(sql, (err, results) => {
      if (error){
      console.log(error);
    }
     response.redirect('/dosen');
 });
});
//-------------------ENDDOSEN---------------------

//-------------------MAHASISWA------------------
root.get('/mahasiswa', function(request, response) {
    var username = request.session.nrp_nip;
    var nama = request.session.nama_user; 
    var id = request.session.id_user;
  //let sql = "SELECT DISTINCT matkul.nama_matkul,matkul.kelas,daftar_peserta.* FROM matkul INNER JOIN daftar_peserta ON (matkul.id_matkul = daftar_peserta.id_matkul ) where id_user = '"+id+"'";
  let sql = "SELECT m.nama_matkul,m.kelas,dp.* FROM matkul m , daftar_peserta dp where m.id_matkul = dp.id_matkul";
  let query = db.query(sql, (err, results,fields) => {
    if(err){
      console.log(err);
    }
    // console.log(matkuls);
    response.render('mahasiswa/index',{results,username,nama,id});
  });
    //response.render('mahasiswa/index.njk',{username,nama});
  });

root.get('/mahasiswa/absen/:id_matkul', function(request, response) { 
 var id = request.session.id_user;
 var matkul = request.params.id_matkul;
 console.log(matkul);
 let sql = "SELECT t.*, m.nama_matkul FROM transaksi_matkul t,matkul m where m.id_matkul = '"+matkul+"'";
 let query = db.query(sql, (err, results,fields) => {
      if (error){
      console.log(error);
    }
         response.render('mahasiswa/absen',{results,id});
 });
});

root.post('/mahasiswa/absensi', function(request, response) {
  var id = request.body.id_user;
  var matkul = request.body.id_tran_matkul;
  var status = request.body.status;
  var date = new Date();

  db.query('INSERT INTO transaksi_user (id_user,id_tran_matkul,waktu,status) values (?,?,?,?)',
       [id,matkul,date,status], function (error, results, fields) {
        if (error){
          console.log(error);
        }
       response.redirect('/mahasiswa');
      });
});

//-------------------ENDMAHASISWA------------------

//-------------------API---------------------------
root.get('/tabel/:nama_tabel', function (req, res) {
  var nama_tabel = req.params.nama_tabel;
  let sql = "SELECT * FROM "+nama_tabel+"";

  db.query(sql, function (error, results, fields) {
    if (error){
      console.log(error);
      res.status(500).json({ error: 'Tidak ada tabel yang dimaksudkan' });
    }else{
      res.status(200).json(results);
    }
  });
});

root.post('/login', function (req, res) {
  var user = req.body.nrp;
  var passw = req.body.password;
  var pass = md5(passw);
  db.query('select id_user,nrp_nip,nama_user from user where nrp_nip=? and password=?',
   [user,pass], function (error, results, fields) {
    if (error){
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length > 0){
      res.status(200).json(results);
    }else{
      res.status(404).json({ error: 'Username dan password tidak tepat' });
    }
  });
});

//tambah mahasiswa
root.post('/tambahmahasiswa', function (req, res) {
  console.log(req.body);
  var user = req.body.nrp;
  var nama = req.body.nama;
  var passw = req.body.password;
  var pass  = md5(passw);
  db.query('select id_user from user where nrp_nip=? and password=?',
   [user,pass], function (error, results, fields) {
    if (error){
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length > 0){
      res.status(404).json({ error: 'NRP/NIP sudah digunakan' });
    }else{
      db.query('INSERT INTO user (nrp_nip,nama_user,password,role) values (?,?,?,?)',
       [user,nama,pass,'2'], function (error, results, fields) {
        if (error){
          console.log(error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json({ OK: 'Akun dengan nrp '+user+' berhasil dibuat' });
      });
    }
  });
});

//tambah matkul
root.post('/tambahmatkul', function (req, res) {
  console.log(req.body);
  var nama_matkul = req.body.nama_matkul;
  var kelas = req.body.kelas;
  var semester = req.body.semester;
  db.query('select id_matkul from matkul where nama_matkul=? and kelas=?',
   [nama_matkul,kelas], function (error, results, fields) {
    if (error){
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length > 0){
      res.status(404).json({ error: 'Kelas telah ditambahkan' });
    }else{
      db.query('INSERT INTO matkul (nama_matkul,kelas,semester) values (?,?,?)',
        [nama_matkul,kelas,semester], function (error, results, fields) {
          if (error){
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
          }else{
            res.status(200).json({ OK: 'Kelas '+nama_matkul+' '+kelas+' berhasil dibuat' });
          }
        });
    }
  });
});

//tambah peserta
root.get('/tambahpeserta/:id_matkul/:nrp', function (req, res) {
  var id_matkul = req.params.id_matkul;
  var nrp_nip = req.params.nrp;

  db.query('SELECT * FROM matkul m, daftar_peserta d,user u WHERE m.id_matkul=d.id_matkul AND u.id_user=d.id_user AND id_matkul=? and id_user=?',
   [id_matkul,nrp_nip], function (error, results, fields) {
    if (error){
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length > 0){
      res.status(404).json({ error: 'Peserta '+results[0].nama_user+' telah terdaftar di Kelas' });
    }else{
      db.query('INSERT INTO daftar_peserta (id_matkul,id_user) values (?,?)',
        [id_matkul,nrp_nip], function (error, results, fields) {
          if (error){
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
          }else{
            res.status(200).json({ OK: 'Berhasil ditambahkan dalam kelas' });
          }
        });
    }
  });
});

//absen
root.post('/absen/:ruang/:nrp', function(request, response) {
  var ruangan = request.params.ruang;
  var nrp_nip = request.params.nrp;
  var status = "2";
  var date = new Date();

  db.query('SELECT u.nrp_nip, tm.ruangan,tm.id_tran_matkul FROM daftar_peserta d, matkul m, transaksi_matkul tm, user u WHERE m.id_matkul = d.id_matkul AND u.id_user=d.id_user AND tm.id_matkul = m.id_matkul AND u.nrp_nip=? AND tm.ruangan=?',
   [nrp_nip,ruangan], function (error, results, fields) {
    if (error){
      console.log(error);
      response.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length == 0 ){
      response.status(404).json({ error: 'Peserta tidak terdaftar dalam kelas' });
    }else{
      console.log(results);
      var matkul = results[0].id_tran_matkul;
      db.query('INSERT INTO transaksi_user (id_user,id_tran_matkul,waktu,status) values (?,?,?,?)',
       [nrp_nip,matkul,date,status], function (error, results, fields) {
          if (error){
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
          }else{
            res.status(200).json({ OK: 'Berhasil melakukan absensi' });
          }
        });
    }
  });
});

//tambahjadwal
// root.post('/tambahjadwal', function(request, response) {
//  var id_matkul = request.body.id_matkul;
//  var pertemuan_ke = request.body.pertemuan_ke;
//  var waktu_awal = request.body.waktu_awal;
//  var waktu_akhir = request.body.waktu_akhir;
//  var ruangan = request.body.ruangan;
// });

//rekap kuliah per semester
root.get('/rekappersemester/:id_matkul', function (req, res) {
  var id_matkul = req.params.id_matkul;

  db.query('SELECT tm.id_matkul,tm.pertemuan_ke, mat.nama_matkul, mat.kelas, tm.waktu_awal, tm.waktu_akhir, tm.ruangan FROM transaksi_matkul AS tm JOIN matkul AS mat WHERE tm.id_matkul = mat.id_matkul AND mat.id_matkul=? ORDER BY tm.pertemuan_ke',
   [id_matkul], function (error, results, fields) {
    if (error){
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }else{
      res.status(200).json(results);
    }
  });
});

//rekap kuliah per pertemuan
root.get('/rekappertemuan/:id_matkul/:pertemuanke', function (req, res) {
  var id_matkul = req.params.id_matkul;
  var pertemuanke = req.params.pertemuanke;

  db.query('SELECT tm.pertemuan_ke, mat.nama_matkul, mat.kelas, tm.waktu_awal, tm.waktu_akhir, tm.ruangan FROM transaksi_matkul AS tm JOIN matkul AS mat WHERE tm.id_matkul = mat.id_matkul AND mat.id_matkul=? AND tm.pertemuan_ke=? ORDER BY tm.pertemuan_ke',
   [id_matkul,pertemuanke], function (error, results, fields) {
    if (error){
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }else{
      res.status(200).json(results);
    }
  });
});

//rekap mahasiswa per kuliah
root.get('/rekapmahasiswa/:nrp/:id_matkul', function (req, res) {
  var nrp = req.params.nrp;
  var id_matkul = req.params.id_matkul;

  db.query('SELECT * FROM USER AS us JOIN transaksi_user AS tu, transaksi_matkul AS tm, matkul AS m WHERE us.id_user = tu.id_user AND tu.id_tran_matkul = tm.id_tran_matkul AND tm.id_matkul = m.id_matkul AND us.nrp_nip=? AND m.id_matkul=?',
   [nrp,id_matkul], function (error, results, fields) {
    if (error){
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }else{
      res.status(200).json(results);
    }
  });
});

//rekap mahasiswa per semester
root.get('/rekapmahasiswasemester/:nrp/:id_semester', function (req, res) {
  var nrp = req.params.nrp;
  var id_semester = req.params.id_semester;
  db.query('SELECT * FROM USER AS us JOIN transaksi_user AS tu, transaksi_matkul AS tm, matkul AS m WHERE us.id_user = tu.id_user AND tu.id_tran_matkul = tm.id_tran_matkul AND tm.id_matkul = m.id_matkul AND us.nrp_nip=? AND m.semester=?',
   [nrp,id_semester], function (error, results, fields) {
    if (error){
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }else{
      res.status(200).json(results);
    }
  });
});

root.post('/apitambahjadwal', function(request, response) {
 var matkul = request.body.matkul;
 var pertemuan_ke = request.body.pertemuan_ke;
 var waktu_awal = request.body.waktu_awal;
 var waktu_akhir = request.body.waktu_akhir;
 var ruangan = request.body.ruangan;

 db.query('select id_tran_matkul from transaksi_matkul where id_matkul=? and pertemuanke=? and ruangan=?',
   [matkul,pertemuan_ke,ruangan], function (error, results, fields) {
    if (error){
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length > 0){
      res.status(404).json({ error: 'Jadwal sudah ada' });
    }else{
     let sql1 = "INSERT  INTO `transaksi_matkul`(`id_matkul`,`pertemuan_ke`,`waktu_awal`,`waktu_akhir`,`ruangan`) values ('"+matkul+"','"+pertemuan_ke+"','"+waktu_awal+"','"+waktu_akhir+"','"+ruangan+"')";
     let query1 = db.query(sql1, (err, results) => {
       if (error){
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }else{
        res.status(200).json({ OK: 'Jadwal berhasil ditambahkan' });
      }
    });
   }
 });
});

root.listen(3000, function() {
  console.log('Listening to port:  ' + 3000);
});
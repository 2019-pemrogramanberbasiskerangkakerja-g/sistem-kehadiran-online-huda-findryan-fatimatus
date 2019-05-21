var http = require("http");
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var md5 = require('md5');
var nunjucks  = require('nunjucks');
var mysql = require('mysql');
var db = require("./db/db_config");
var root = express();
var axios = require('axios');
var FormData = require('form-data');

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

//----auth
root.get('/auth', function(request, response) { 
  if(request.session.flashdata){
    var flash = request.session.flashdata;
  }
  response.render('auth/login.njk',{flash});
});

root.get('/dosenlogin', function(request, response) { 
  if(request.session.flashdata){
    var flash = request.session.flashdata;
  }
  response.render('auth/logindosen.njk',{flash});
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
  var matkul=[];
  var mahasiswa=[];
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
      // console.log(results);
      matkul = results;
      //console.log(matkul);
      
    });

    let sql2 = "SELECT * FROM user WHERE role = '2'";
    query = db.query(sql2, (err, results,fields) => {
      if (err){
        console.log(err);
      }
      mahasiswa = results;
      //console.log(mahasiswa);
      response.render('dosen/index',{matkul,mahasiswa,nama,id,username});
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

root.post('/dosen/updatekelas', function(request, response) {
  var nama_matkul = request.body.nama_matkul;
  var kelas = request.body.kelas;
  var id_matkul = request.body.id_matkul;
  sql = "UPDATE matkul SET nama_matkul='"+nama_matkul+"', kelas='"+kelas+"' WHERE id_matkul="+id_matkul;
  query = db.query(sql, (err, results) => {
    if(err){
      console.log(err);
    }
    response.redirect('/dosen');
  });
});

root.post('/dosen/deletekelas/:id_matkul', function(request, response) {
  var id_matkul = request.params.id_matkul;
  sql = "DELETE FROM matkul WHERE id_matkul="+id_matkul+"";
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
 var username = request.session.nrp_nip;
 var matkul = request.params.id_matkul;
 console.log(matkul);
 let sql = "SELECT t.*, m.nama_matkul FROM transaksi_matkul t,matkul m where m.id_matkul = '"+matkul+"'";
 let query = db.query(sql, (err, results,fields) => {
  if (err){
    console.log(err);
  }
  response.render('mahasiswa/absen',{results,id,username});
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
root.get('/tabel/:nama_tabel?', function (req, res) {
  var nama_tabel = req.params.nama_tabel;
  // console.log(nama_tabel);
  var sql;
  if(typeof(nama_tabel) == 'undefined'){
    sql = "SHOW tables";
  }
  else if(nama_tabel != "user" && nama_tabel != "daftar_peserta" && nama_tabel != "matkul" && nama_tabel != "transaksi_matkul" && nama_tabel != "transaksi_user") {
    return res.status(500).json([{ err: 'Tidak ada tabel yang dimaksudkan' }]);
  }
  else{
    sql = "SELECT * FROM "+nama_tabel+"";
  }

  db.query(sql, function (err, results, fields) {
    if (err){
      console.log(err);
      return res.status(500).json([{ err: 'Tidak ada tabel yang dimaksudkan' }]);
    }else{
      return res.status(200).json(results);
    }
  });
});

root.post('/login', function (req, res) {

  if (typeof(req.body.nrp) == 'undefined' || typeof(req.body.password) == 'undefined') {
    return res.status(500).json([{ err: 'Format data masukan salah' }]);
  }

  var user = req.body.nrp;
  var passw = req.body.password;
  var pass = md5(passw);

  db.query('select id_user,nrp_nip,nama_user from user where nrp_nip=? and password=?',
   [user,pass], function (err, results, fields) {
    if (err){
      console.log(err);
      return res.status(500).json([{ err: 'Internal Server Error' }]);
    }
    if (results.length > 0){
      return res.status(200).json(results);
    }else{
      return res.status(404).json([{ err: 'Username dan password tidak tepat' }]);
    }
  });
});

//tambah mahasiswa
root.post('/tambahmahasiswa', function (req, res) {

  if (typeof(req.body.nrp) == 'undefined' || typeof(req.body.nama) == 'undefined' || typeof(req.body.password) == 'undefined') {
    return res.status(500).json([{ err: 'Format data masukan salah' }]);
  }

  var user = req.body.nrp;
  var nama = req.body.nama;
  var passw = req.body.password;
  var pass  = md5(passw);

  db.query('select id_user from user where nrp_nip=?',
   [user], function (err, results, fields) {
    if (err){
      console.log(err);
      return res.status(500).json([{ err: 'Internal Server Error' }]);
    }
    if (results.length > 0){
      return res.status(404).json([{ err: 'NRP/NIP sudah digunakan' }]);
    }else{
      db.query('INSERT INTO user (nrp_nip,nama_user,password,role) values (?,?,?,?)',
       [user,nama,pass,'2'], function (err, results, fields) {
        if (err){
          console.log(err);
          return res.status(500).json([{ err: 'Internal Server Error' }]);
        }
        return res.status(200).json([{ OK: 'Akun dengan nrp '+user+' berhasil dibuat' }]);
      });
    }
  });
});

//tambah matkul
root.post('/tambahmatkul', function (req, res) {

  if (typeof(req.body.nama_matkul) == 'undefined' || typeof(req.body.kelas) == 'undefined' || typeof(req.body.semester) == 'undefined') {
    return res.status(500).json([{ err: 'Format data masukan salah' }]);
  }

  var nama_matkul = req.body.nama_matkul;
  var kelas = req.body.kelas;
  var semester = req.body.semester;
  db.query('select id_matkul from matkul where nama_matkul=? and kelas=?',
   [nama_matkul,kelas], function (err, results, fields) {
    if (err){
      console.log(err);
      return res.status(500).json([{ err: 'Internal Server Error' }]);
    }
    if (results.length > 0){
      res.status(404).json([{ err: 'Kelas sudah ada pada database' }]);
    }else{
      db.query('INSERT INTO matkul (nama_matkul,kelas,semester) values (?,?,?)',
        [nama_matkul,kelas,semester], function (err, results, fields) {
          if (err){
            console.log(err);
            return res.status(500).json([{ err: 'Internal Server Error' }]);
          }else{
            return res.status(200).json([{ OK: 'Kelas '+nama_matkul+' '+kelas+' berhasil dibuat' }]);
          }
        });
    }
  });
});

//tambah peserta
root.post('/tambahpeserta', function (req, res) {

  if (typeof(req.body.id_matkul) == 'undefined' || typeof(req.body.nrp) == 'undefined') {
    return res.status(500).json([{ err: 'Format data masukan salah' }]);
  }

  var id_matkul = req.body.id_matkul;
  var nrp_nip = req.body.nrp;

  //cek matkul
  db.query('SELECT id_matkul FROM matkul WHERE id_matkul=?',
    [id_matkul], function (err, results, fields) {
      if (err){
        console.log(err);
        return res.status(500).json([{ err: 'Internal Server Error' }]);
      }
      if (results.length < 1){
        return res.status(500).json([{ err: 'ID Mata Kuliah tidak terdaftar' }]);
      }
    });

  var nrpbaru;
  //cek peserta
  db.query("SELECT id_user FROM user WHERE nrp_nip=? and role='2'",
    [nrp_nip], function (err, results, fields) {
      if (err){
        console.log(err);
        return res.status(500).json([{ err: 'Internal Server Error' }]);
      }
      if (results.length < 1){
        res.status(500).json([{ err: 'NRP Tidak terdaftar' }]);
      }else{
        nrpbaru = results[0].id_user;
        console.log(nrpbaru);
      }
    });

  db.query('SELECT * from daftar_peserta d WHERE d.id_matkul=? and d.id_user=?',
    [id_matkul,nrp_nip], function (err, results, fields) {
      if (err){
        console.log(err);
        return res.status(500).json([{ err: 'Internal Server Error' }]);
      }
      if (results.length > 0){
        return res.status(404).json([{ err: 'Peserta '+'telah terdaftar di Kelas' }]);
      }
      else{
        db.query('INSERT INTO daftar_peserta (id_matkul,id_user) values (?,?)',
          [id_matkul,nrpbaru], function (err, results, fields) {
            if (err){
              console.log(err);
              return res.status(500).json([{ err: 'Internal Server Error' }]);
            }else{
              return res.status(200).json([{ OK: 'Berhasil ditambahkan dalam kelas' }]);
            }
          });
      }
    });
});

//absen
root.post('/absen', function(req, res) {

  if (typeof(req.body.ruang) == 'undefined' || typeof(req.body.nrp) == 'undefined') {
    return res.status(500).json([{ err: 'Format data masukan salah' }]);
  }

  var ruangan = req.body.ruang;
  var nrp_nip = req.body.nrp;
  var status = "2";
  var date = new Date();

  db.query('SELECT u.nrp_nip, tm.ruangan,tm.id_tran_matkul, u.id_user FROM daftar_peserta d, matkul m, transaksi_matkul tm, user u WHERE m.id_matkul = d.id_matkul AND u.id_user=d.id_user AND tm.id_matkul = m.id_matkul AND u.nrp_nip=? AND tm.ruangan=?',
   [nrp_nip,ruangan], function (err, results, fields) {
    if (err){
      console.log(err);
      return res.status(500).json([{ err: 'Internal Server Error' }]);
    }
    if (results.length < 1 ){
      return res.status(500).json([{ err: 'Peserta tidak terdaftar dalam kelas' }]);
    }else{
      console.log(results);
      var matkul = results[0].id_tran_matkul;
      var id_user = results[0].id_user;

      db.query('SELECT * FROM transaksi_user WHERE id_tran_matkul=? AND id_user=?',
       [matkul,id_user], function (err, results, fields) {
        if (err){
          console.log(err);
          return res.status(500).json([{ err: 'Gagal melakukan absensi, coba lagi' }]);
        }else{
          if (results.length > 0 ){
            res.setHeader('Content-Type', 'application/json');
            res.status(500).json([{ err: 'Peserta sudah melakukan absen' }]);
            res.end();
          }
        }
      });

      db.query('INSERT INTO transaksi_user (id_user,id_tran_matkul,waktu,status) values (?,?,?,?)',
       [id_user,matkul,date,status], function (err, results, fields) {
        if (err){
          console.log(err);
          res.status(500).json([{ err: 'Gagal melakukan absensi, coba lagi' }]);
        }else{
          res.status(200).json({ OK: 'Berhasil melakukan absensi' });
        }
      });
    }
  });
});

//rekap kuliah per semester
root.get('/rekappersemester/:id_matkul?/:id_semester?', function (req, res) {

  if (typeof(req.params.id_matkul) == 'undefined' || typeof(req.params.id_semester) == 'undefined') {
    return res.status(500).json([{ err: 'Format data masukan salah' }]);
  }

  var id_matkul = req.params.id_matkul;

  db.query('SELECT  tm.id_matkul, us.nrp_nip, us.nama_user, mat.semester, tm.pertemuan_ke, mat.nama_matkul, mat.kelas, tm.waktu_awal, tm.waktu_akhir, tm.ruangan, tu.status FROM matkul AS mat JOIN user AS us, transaksi_matkul AS tm, transaksi_user AS tu WHERE tu.id_user = us.id_user AND tu.id_tran_matkul = tm.id_tran_matkul AND tm.id_matkul=mat.id_matkul AND us.role = 2 AND mat.id_matkul = ? AND mat.semester=? ORDER BY tm.pertemuan_ke',
   [id_matkul,id_semester], function (err, results, fields) {
    if (err){
      console.log(err);
      return res.status(500).json([{ err: 'Internal Server Error' }]);
    }else{
      return res.status(200).json(results);
    }
  });
});

//rekap kuliah per pertemuan
root.get('/rekappertemuan/:id_matkul?/:pertemuanke?', function (req, res) {

  if (typeof(req.params.id_matkul) == 'undefined' || typeof(req.params.pertemuanke) == 'undefined') {
    return res.status(500).json([{ err: 'Format data masukan salah' }]);
  }

  var id_matkul = req.params.id_matkul;
  var pertemuanke = req.params.pertemuanke;

  db.query('SELECT  tm.id_matkul, us.nrp_nip, us.nama_user, mat.semester, tm.pertemuan_ke, mat.nama_matkul, mat.kelas, tm.waktu_awal, tm.waktu_akhir, tm.ruangan, tu.status FROM matkul AS mat JOIN user AS us, transaksi_matkul AS tm, transaksi_user AS tu WHERE tu.id_user = us.id_user AND tu.id_tran_matkul = tm.id_tran_matkul AND tm.id_matkul=mat.id_matkul AND us.role = 2 AND mat.id_matkul =? AND tm.pertemuan_ke =? ORDER BY tm.pertemuan_ke',
   [id_matkul,pertemuanke], function (err, results, fields) {
    if (err){
      console.log(err);
      return res.status(500).json([{ err: 'Internal Server Error' }]);
    }else{
      return res.status(200).json(results);
    }
  });
});

//rekap mahasiswa per kuliah
root.get('/rekapmahasiswa/:nrp?/:id_matkul?', function (req, res) {

  if (typeof(req.params.nrp) == 'undefined' || typeof(req.params.id_matkul) == 'undefined') {
    return res.status(500).json([{ err: 'Format data masukan salah' }]);
  }

  var nrp = req.params.nrp;
  var id_matkul = req.params.id_matkul;

  db.query('SELECT tm.id_matkul, us.nrp_nip, us.nama_user, mat.semester, tm.pertemuan_ke, mat.nama_matkul, mat.kelas, tm.waktu_awal, tm.waktu_akhir, tm.ruangan, tu.status FROM user AS us JOIN transaksi_user AS tu, transaksi_matkul AS tm, matkul AS mat WHERE us.id_user = tu.id_user AND tu.id_tran_matkul = tm.id_tran_matkul AND tm.id_matkul = mat.id_matkul AND us.nrp_nip=? AND mat.id_matkul=?',
   [nrp,id_matkul], function (err, results, fields) {
    if (err){
      console.log(err);
      res.status(500).json([{ err: 'Internal Server Error' }]);
    }else{
      res.status(200).json(results);
    }
  });
});

//rekap mahasiswa per semester
root.get('/rekapmahasiswasemester/:nrp?/:id_semester?', function (req, res) {
  if (typeof(req.params.nrp) == 'undefined' || typeof(req.params.id_semester) == 'undefined') {
    return res.status(500).json([{ err: 'Format data masukan salah' }]);
  }
  var nrp = req.params.nrp;
  var id_semester = req.params.id_semester;
  db.query('SELECT * FROM user AS us JOIN transaksi_user AS tu, transaksi_matkul AS tm, matkul AS m WHERE us.id_user = tu.id_user AND tu.id_tran_matkul = tm.id_tran_matkul AND tm.id_matkul = m.id_matkul AND us.nrp_nip=? AND m.semester=?',
   [nrp,id_semester], function (err, results, fields) {
    if (err){
      console.log(err);
      res.status(500).json([{ err: 'Internal Server Error' }]);
    }else{
      res.status(200).json(results);
    }
  });
});

root.post('/apitambahjadwal', function(req, res) 
{
  if (typeof(req.body.id_matkul) == 'undefined' || typeof(req.body.pertemuan_ke) == 'undefined' || typeof(req.body.waktu_awal) == 'undefined' || typeof(req.body.waktu_akhir) == 'undefined' || typeof(req.body.ruangan) == 'undefined') {
    return res.status(500).json([{ err: 'Format data masukan salah' }]);
  }

  var matkul = req.body.id_matkul;
  var pertemuan_ke = req.body.pertemuan_ke;
  var waktu_awal = req.body.waktu_awal;
  var waktu_akhir = req.body.waktu_akhir;
  var ruangan = req.body.ruangan;

  var cek1 = new Date(waktu_awal);
  var cek2 = new Date(waktu_akhir);
  if(isNaN(cek1) || isNaN(cek2)){
    return res.status(500).json([{ err: 'Format waktu salah' }]);
  }

  db.query('select id_tran_matkul from transaksi_matkul where id_matkul=? and pertemuan_ke=? and ruangan=?',
   [matkul,pertemuan_ke,ruangan], function (err, results, fields) {
    if (err){
      console.log(err);
      return res.status(500).json([{ err: 'Internal Server Error' }]);
    }
    if (results.length > 0){
      return res.status(404).json({ err: 'Jadwal sudah ada' });
    }else{
     let sql1 = "INSERT INTO `transaksi_matkul`(`id_matkul`,`pertemuan_ke`,`waktu_awal`,`waktu_akhir`,`ruangan`) values ('"+matkul+"','"+pertemuan_ke+"','"+waktu_awal+"','"+waktu_akhir+"','"+ruangan+"')";
     let query1 = db.query(sql1, (err, results) => {
       if (err){
        console.log(err);
        return res.status(500).json([{ err: 'Internal Server Error' }]);
      }else{
        return res.status(200).json({ OK: 'Jadwal berhasil ditambahkan' });
      }
    });
   }
 });
});


//rekapp-----------------------------------------------------------------------------------------------------
root.get('/dosen/rekap/:id_matkul/:semester', function(request, response,next) {
 var matkul = request.params.id_matkul;
 var semester = request.params.semester;
 axios.get("http://157.230.240.242:3000/rekappersemester/"+matkul)
 .then(data => {
  data=data.data;
  console.log(data);
  response.render('dosen/rekap.njk',{data});
})
 .catch(err => next(err));
});

root.get('/dosen/rekapmahasiswa/:nrp/:id_matkul', function(request, response,next) {
  var nrp = request.params.nrp;
  var matkul = request.params.id_matkul;
  axios.get("http://157.230.240.242:3000/rekapmahasiswa/"+nrp+"/"+matkul)
  .then(rekap => {
    rekap=rekap.data;
    console.log(rekap);
    response.render('dosen/rekapmahasiswa.njk',{rekap});
  })
  .catch(err => next(err));
});

root.get('/dosen/rekapmahasiswasemester/:nrp/:semester', function(request, response,next) {
  var nrp = request.params.nrp;
  var semester = request.params.semester;
  axios.get("http://157.230.240.242:3000/rekapmahasiswasemester/"+nrp+"/"+semester)
  .then(mahasiswa => {
    mahasiswa=mahasiswa.data;
    console.log(mahasiswa);
    response.render('dosen/rekapsemester.njk',{mahasiswa});
  })
  .catch(err => next(err));
});

root.get('/dosen/rekappertemuan/:id_matkul/:pertemuan_ke', function(request, response,next) {
 var matkul = request.params.id_matkul;
 var pertemuan = request.params.pertemuan_ke;
 axios.get("http://157.230.240.242:3000/rekappertemuan/"+matkul+"/"+pertemuan)
 .then(pertemuan => {
  pertemuan=pertemuan.data;
  console.log(pertemuan);
  response.render('dosen/rekappertemuan.njk',{pertemuan});
})
 .catch(err => next(err));
});

//------------------------------API POST---------------------------------------//
root.post('/api/login', function(req, res,next) {

  var user = req.body.username;
  var passw = req.body.password;

  axios({
    method: 'post',
    url: 'http://157.230.42.89:3000/login',
    data: {
      nrp: user,
      password: passw
    },
    validateStatus: (status) => {
      console.log(status);
        return true; // I'm always returning true, you may want to do it depending on the status received
      },
    }).catch(error => {

    }).then(response => {
      if(response.status == 200){
        req.session.id_user = response.data[0].id_user;
        req.session.nrp_nip = response.data[0].nrp_nip;
        req.session.nama_user = response.data[0].nama_user;       
      };
      res.redirect('/mahasiswa');
    });
  });

root.post('/api/tambahmahasiswa', function(req, res,next) {
  var user = req.body.username;
  var nama = req.body.nama;
  var passw = req.body.password;

  axios({
    method: 'post',
    url: 'http://157.230.240.242:3000/tambahmahasiswa',
    data: {
      nrp: user,
      nama: nama,
      password: passw,
    },
      validateStatus: (status) => {
        console.log(status);
        return true; // I'm always returning true, you may want to do it depending on the status received
      },
    }).catch(error => {

    }).then(response => {
        if(response.status == 200){
          //bila berhasil
          req.session.flashdata = "Akun "+nama+" berhasil dibuat";
          res.redirect('/auth/register');
          console.log(response.data);
        }else if(response.status == 404){
          req.session.flashdata = "NRP sudah digunakan";
          res.redirect('/auth/register');
        }else{
          res.redirect('/auth/register');
        }
    });
});

root.post('/api/absen', function(req, res,next) {
  var nama_ruang = req.body.nama_ruang;
  var nomorinduk = req.body.nrp;
  axios({
    method: 'post',
    url: 'http://157.230.240.242:3000/absen',
    data: {
      ruang: nama_ruang,
      nrp: nomorinduk
    },
      validateStatus: (status) => {
        console.log(status);
        return true; // I'm always returning true, you may want to do it depending on the status received
      },
    }).catch(error => {

    }).then(response => {
        console.log(response);
        if(response.status == 200){
          //bila berhasil
          res.redirect('/mahasiswa');
          console.log(response.data);
        }else if(response.status == 500){
          //mahasiswa tidak terdaftar
          res.redirect('/mahasiswa');
        }else{

        }
    });
});

root.post('/api/tambahpeserta', function(req, res,next) {
  var user = req.body.user;
  var nama = req.body.id_matkul;

  axios({
    method: 'post',
    url: 'http://157.230.240.242:3000/tambahpeserta',
    data: {
      nrp: user,
      id_matkul: id_matkul

    },
      validateStatus: (status) => {
        console.log(status);
        return true; // I'm always returning true, you may want to do it depending on the status received
      },
    }).catch(error => {

    }).then(response => {
        if(response.status == 200){
          //bila berhasil
          //req.session.flashdata = "Akun "+nama+" berhasil dibuat";
          res.redirect('/dosen');
          console.log(response.data);
        }else if(response.status == 404){
          req.session.flashdata = "NRP sudah digunakan";
          res.redirect('/dosen');
        }else{
          res.redirect('/dosen');
        }
    });
});

root.post('/api/tambahmatkul', function(req, res,next) {
  var nama_matkul = req.body.nama_matkul;
  var kelas = req.body.kelas;
  var semester = req.body.semester;
  console.log("masuk");
  axios({
    method: 'post',
    url: 'http://157.230.240.242:3000/tambahmatkul',
    data: {
      nama_matkul: nama_matkul,
      kelas: kelas,
      semester: semester
    },
      validateStatus: (status) => {
        console.log(status);
        return true; // I'm always returning true, you may want to do it depending on the status received
      },
    }).catch(error => {

    }).then(response => {
        if(response.status == 200){
          //bila berhasil
          console.log(response.data);
          res.redirect('/dosen');
        }else if(response.status == 404){
          //mahasiswa tidak terdaftar
        }else{

        }
    });
});

root.post('/api/tambahjadwal', function(req, res,next) {
  
  var matkul = req.body.id_matkul;
  var pertemuan_ke = req.body.pertemuan_ke;
  var waktu_awal = req.body.waktu_awal;
  var waktu_akhir = req.body.waktu_akhir;
  var ruangan = req.body.ruangan;
  
  axios({
    method: 'post',
    url: 'http://157.230.240.242:3000/apitambahjadwal',
    data: {
      id_matkul: matkul,
      pertemuan_ke: pertemuan_ke,
      nama_ruang: ruangan,
      jam_masuk: waktu_awal,
      jam_selesai: waktu_akhir
    },
      validateStatus: (status) => {
        console.log(status);
        return true; // I'm always returning true, you may want to do it depending on the status received
      },
    }).catch(error => {

    }).then(response => {
        console.log(response);
        if(response.status == 200){
          //bila berhasil
          res.redirect('/dosen');
          console.log(response.data);
        }else if(response.status == 404){
          //mahasiswa tidak terdaftar
          console.log(response.data);
        }else{

        }
    });
});


root.listen(4000, function() {
  console.log('Listening to port:  ' + 3000);
});
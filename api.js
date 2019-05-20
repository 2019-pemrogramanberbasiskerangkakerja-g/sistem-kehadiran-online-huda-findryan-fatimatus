var http = require("http");
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var md5 = require('md5');
var nunjucks  = require('nunjucks');
var mysql = require('mysql');
var axios = require('axios');
var db = require("./db/db_config");
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

//----auth
root.get('/auth', function(req, res) { 
  if(req.session.flashdata){
    var flash = req.session.flashdata;
  }
  res.render('auth/login.njk',{flash});
});

root.post('/auth/login', function(req, res) {
  var user = req.body.username;
  var passw = req.body.password;
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
            req.session.id_user = results[0].id_user;
            req.session.nrp_nip = results[0].nrp_nip;
            req.session.nama_user = results[0].nama_user;
            req.session.role = results[0].role;

            if(req.session.role == 1){
              res.redirect('/dosen');
            }else{
                // res.redirect('/mahasiswa');
                res.redirect('/mahasiswa');
              }
            }else{
            // console.log("SALLAH");
            req.session.flashdata = "Kombinasi username dan password salah !!";
            res.redirect('/auth');
          }
        });
  });


root.get('/auth/logout', function(req, res) {
  req.session.destroy();    
  res.redirect('/auth');
});
//-----------------------ENDAUTH-----------------

//----REGISTER-----------------------
root.get('/auth/register', function(req, res) {
  res.render('auth/register');
});

root.post('/auth/registeruser', function(req, res) {
  var user = req.body.username;
  var passw = req.body.password;
  var pass = md5(passw);
  var nama = req.body.nama;
  var category = req.body.category;

  let sql = "SELECT * FROM user where nrp_nip ='"+user+"'";
  let query = db.query(sql, (err, results, fields) => {
    if (results.length > 0) {        
      req.session.flashdata = "NRP/NIP telah digunakan oleh akun lain";
      res.redirect('/auth');
    }else{
      let sql = "INSERT INTO `user`(`nrp_nip`,`nama_user`,`password`,`role`) values ('"+user+"','"+nama+"','"+pass+"','"+category+"')";
      db.query(sql, function (err, result) {
        if(err){
          console.log(err);
        }else{
          console.log("Number of records inserted: " + result.affectedRows);
        }
      });
      req.session.flashdata = "Akun "+nama+" berhasil dibuat";
      res.redirect('/auth');
    }
  });
});
//-------------------ENDREGISTER--------------------

//-------------------DOSEN---------------------
root.get('/dosen', function(req, res) {
  var matkul=[];
  var mahasiswa=[];
  if (req.session.role != 1) {
    res.redirect('/mahasiswa');
  }else{
    var username = req.session.nrp_nip;
    var nama = req.session.nama_user; 
    var id = req.session.id_user;
    
    let sql = "SELECT * FROM matkul";
    let query = db.query(sql, (err, results,fields) => {
      if(err){
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
      res.render('dosen/index',{matkul,mahasiswa,nama,id,username});
    });
    
  }
});

root.post('/dosen/addkelas', function(req, res) {
  var nama_matkul = req.body.nama_matkul;
  var kelas = req.body.kelas;
  sql = "INSERT INTO `matkul`(`nama_matkul`,`kelas`) values ('"+nama_matkul+"','"+kelas+"')";
  query = db.query(sql, (err, results) => {
    if(err){
      console.log(err);
    }
    res.redirect('/dosen');
  });
});

root.get('/createJadwal', function(req, res) {
 let sql = "SELECT * FROM matkul";
 let query = db.query(sql, (err, results,fields) => {
   if (err){
    console.log(err);
  }
  res.render('/dosen/index.njk',{results});
});
});

root.post('/TambahJadwal', function(req, res) {
 var matkul = req.body.matkul;
 var pertemuan_ke = req.body.pertemuan_ke;
 var waktu_awal = req.body.waktu_awal;
 var waktu_akhir = req.body.waktu_akhir;
 var ruangan = req.body.ruangan;

 let sql = "INSERT  INTO `transaksi_matkul`(`id_matkul`,`pertemuan_ke`,`waktu_awal`,`waktu_akhir`,`ruangan`) values ('"+matkul+"','"+pertemuan_ke+"','"+waktu_awal+"','"+waktu_akhir+"','"+ruangan+"')";
 let query = db.query(sql, (err, results) => {
  if (err){
    console.log(err);
  }
  res.redirect('/dosen');
});
});

root.get('/createPeserta', function(req, res) {
 let sql = "SELECT * FROM user WHERE role_user = '2'";
 let query = db.query(sql, (err, results,fields) => {
  if (err){
    console.log(err);
  }
  res.render('/dosen/index.njk',{results});
});
});

root.post('/TambahPeserta', function(req, res) {
 var matkul = req.body.matkul;
 var user = req.body.user;

 let sql = "INSERT  INTO `daftar_peserta`(`id_matkul`,`id_user`) values ('"+matkul+"','"+user+"')";
 let query = db.query(sql, (err, results) => {
  if (err){
    console.log(err);
  }
  res.redirect('/dosen');
});
});
//-------------------ENDDOSEN---------------------

//-------------------MAHASISWA------------------
root.get('/mahasiswa', function(req, res) {
  var username = req.session.nrp_nip;
  var nama = req.session.nama_user; 
  var id = req.session.id_user;
  //let sql = "SELECT DISTINCT matkul.nama_matkul,matkul.kelas,daftar_peserta.* FROM matkul INNER JOIN daftar_peserta ON (matkul.id_matkul = daftar_peserta.id_matkul ) where id_user = '"+id+"'";
  let sql = "SELECT m.nama_matkul,m.kelas,dp.* FROM matkul m , daftar_peserta dp where m.id_matkul = dp.id_matkul";
  let query = db.query(sql, (err, results,fields) => {
    if(err){
      console.log(err);
    }
    // console.log(matkuls);
    res.render('mahasiswa/index',{results,username,nama,id});
  });
    //res.render('mahasiswa/index.njk',{username,nama});
  });

root.get('/mahasiswa/absen/:id_matkul', function(req, res) { 
 var id = req.session.id_user;
 var matkul = req.params.id_matkul;
 console.log(matkul);
 let sql = "SELECT t.*, m.nama_matkul FROM transaksi_matkul t,matkul m where m.id_matkul = '"+matkul+"'";
 let query = db.query(sql, (err, results,fields) => {
  if (err){
    console.log(err);
  }
  res.render('mahasiswa/absen',{results,id});
});
});

root.post('/mahasiswa/absensi', function(req, res) {
  var id = req.body.id_user;
  var matkul = req.body.id_tran_matkul;
  var status = req.body.status;
  var date = new Date();

  db.query('INSERT INTO transaksi_user (id_user,id_tran_matkul,waktu,status) values (?,?,?,?)',
   [id,matkul,date,status], function (err, results, fields) {
    if (err){
      console.log(err);
    }
    res.redirect('/mahasiswa');
  });
});

//-------------------ENDMAHASISWA------------------

root.post('/api/login', function(req, response,next) {

  var user = req.body.nrp;
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
          console.log(response.data);
        };
    });
});

//absen
root.post('/api/absen', function(req, response,next) {
  var nama_ruang = req.body.ruang;
  var nomorinduk = req.body.nrp;
  axios({
    method: 'post',
    url: 'http://157.230.42.89:8000/absen',
    data: {
      nama_ruang: nama_ruang,
      nomorinduk: nomorinduk
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
        }else if(response.status == 200){
          //mahasiswa tidak terdaftar
        }else{

        }
    });
});

//tambahmahasiswa
root.post('/api/tambahmahasiswa', function(req, response,next) {
  var user = req.body.nrp;
  var nama = req.body.nama;
  var passw = req.body.password;

  axios({
    method: 'post',
    url: 'http://157.230.42.89:8000/tambahmahasiswa',
    data: {
      nrp: user,
      nama: nama,
      password: passw
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
        }else if(response.status == 404){
          console.log(response.data);
        }else{

        }
    });
});

//tambah matkul
root.post('/api/tambahmatkul', function(req, response,next) {
  var nama_matkul = req.body.nama_matkul;
  var kelas = req.body.kelas;
  var semester = req.body.semester;
  console.log("masuk");
  axios({
    method: 'post',
    url: 'http://157.230.42.89:8000/tambahmatkul',
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
        }else if(response.status == 404){
          //mahasiswa tidak terdaftar
        }else{

        }
    });
});

//tambah jadwal
root.post('/api/tambahjadwal', function(req, response,next) {
  
  var matkul = req.body.id_matkul;
  var pertemuan_ke = req.body.pertemuan_ke;
  var waktu_awal = req.body.waktu_awal;
  var waktu_akhir = req.body.waktu_akhir;
  var ruangan = req.body.ruangan;
  
  axios({
    method: 'post',
    url: 'http://157.230.42.89:8000/tambahjadwal',
    data: {
      id_matkul: matkul,
      pertemuan_ke: pertemuan_ke,
      nama_ruang: ruangan,
      jam_masuk: waktu_awal,
      jam_selesai: waktu_akhir,
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
        }else if(response.status == 404){
          //mahasiswa tidak terdaftar
          console.log(response.data);
        }else{

        }
    });
});

root.listen(4000, function() {
  console.log('Listening to port:  ' + 4000);
});
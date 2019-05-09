var db = require("../db_config");
var express = require('express');
var router = express.Router();

router.get('/', function(request, response) {
	var username = request.session.nrp_nip;
	var nama = request.session.nama_user; 
	var id = request.session.id_user;
	let sql = "SELECT * FROM daftar_peserta where id_user = '"+id+"'";
	let query = db.query(sql, (err, results,fields) => {
		if(err) throw err;
		// console.log(matkuls);
		response.render('mahasiswa/index.njk',{results,username,nama,id});
	});
    //response.render('mahasiswa/index.njk',{username,nama});
});

router.post('/absen', function(request, response) {
	var id = request.body.id_user;
	var matkul = request.body.id_matkul;
	var status = request.body.status;

	let sql = "INSERT INTO `absen`(`id_user`,`id_matkul`,`status`) values (`"+id+"`,`"+matkul+"`,`"+status+"`) ";
	let query = db.query(sql, (err, results) => {
		if(err) throw err;
		response.redirect('mahasiswa/index.njk');
	});
});

// router.get('/createJadwal', function(request, response) {
// 	let sql = "SELECT * FROM matkul";
// 	let query = db.query(sql, (err, results,fields) => {
// 		if(err) throw err;
// 			response.render('/dosen/index.njk',{results});
// 	});
// });

// router.post('/TambahJadwal', function(request, response) {
// 	var matkul = request.body.matkul;
// 	var pertemuan_ke = request.body.pertemuan_ke;
// 	var waktu_awal = request.body.waktu_awal;
// 	var waktu_akhir = request.body.waktu_akhir;
// 	var ruangan = request.body.ruangan;

// 	let sql = "INSERT  INTO `transaksi_matkul`(`id_matkul`,`pertemuan_ke`,`waktu_awal`,`waktu_akhir`,`ruangan`) values ('"+matkul+"','"+pertemuan_ke+"','"+waktu_awal+"','"+waktu_akhir+"','"+ruangan+"')";
// 	let query = db.query(sql, (err, results) => {
// 		if(err) throw err;
// 		response.redirect('/dosen');
// 	});
// });

// router.get('/createPeserta', function(request, response) {
// 	let sql = "SELECT * FROM user WHERE role_user = '2'";
// 	let query = db.query(sql, (err, results,fields) => {
// 		if(err) throw err;
// 			response.render('/dosen/index.njk',{results});
// 	});
// });

// router.post('/TambahPeserta', function(request, response) {
// 	var matkul = request.body.matkul;
// 	var user = request.body.user;

// 	let sql = "INSERT  INTO `daftar_peserta`(`id_matkul`,`id_user`) values ('"+matkul+"','"+user+"')";
// 	let query = db.query(sql, (err, results) => {
// 		if(err) throw err;
// 		response.redirect('/dosen');
// 	});
// });



module.exports = router;
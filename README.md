# SAFARIO
## Aplikasi Kehadiran Online

### Kelas         : PBKK G
### Nama Kelompok : Huda, Findryan, Fatimatus
### Pengajar      : Bapak Ridho Rahman

#### Berikut Teknologi yang digunakan pada Aplikasi Kehadiran Online (Safario):
* Front End       : Nunjucks
* Back End        : Node.js
* Framework       : Express js
* Database        : MySQL

#### Cara menjalankan program:
1. Lakunan Clone aplikasi
2. Install npm dengan menjalanakan  ``` npm install ```
3. Install package yang dibutuhkan dengan menjalankan syntax berikut:
 * Package express, ``` npm install express --save ```
 * Package cookie parser, ``` npm install cookie-parser ```
 * Package express session, ``` npm install express-session ```
 * Package body parser, ``` npm install body-parser ```
 * Package md5, ``` npm install md5 ```
 * Package nunjucks, ``` npm install nunjucks ```
 * Package mysql, ``` npm install mysql ```
4. Jalankan aplikasi dengan ``` node root.js ```

#### API Cek db:
Terdapat 4 tabel user, daftar_peserta, matkul, transaksi_matkul, transaksi_user
akses
``` GET /tabel/(Masukan Nama Tabel) ```


### Berikut List Api pada Aplikasi Kehadiran Online (Safario):
1. absen
  ``` POST /absen/```
sent via body: ruang, nrp

2. rekap kuliah per semester
  ``` GET /rekappersemester/IDMATAKULIAH ```
ex: /rekappersemester/1

3. rekap kuliah per pertemuan
  ``` GET /rekappertemuan/IDMATAKULIAH/PERTEMUANKE ```
ex: /rekappertemuan/1/1

4. rekap per mahasiswa per kuliah
  ``` GET /rekapmahasiswa/NRP/IDMATAKULIAH ```
ex: /rekapmahasiswa/5115100022/1

5. rekap per mahasiswa per semester
  ``` GET /rekapmahasiswasemester/NRP/SEMESTER ```
ex : rekapmahasiswasemester/5115100035/4

6. tambah user mhs baru
  ``` POST /tambahmahasiswa ```
sent via body: nrp, nama, password

7. tambah user mhs ke mata kuliah
  ``` GET /tambahpeserta/IDMATAKULIAH/NRP ```
\n ex : tambahpeserta/1/5115100022

8. tambah mata kuliah baru
  ``` POST /tambahmatkul ```
sent via body: nama_matkul, kelas, semester

9. tambah jadwal pertemuan untuk kuliah
``` POST /apitambahjadwal ```
sent via body: matkul, pertemuan_ke, waktu_awal, waktu_akhir, ruangan


10. Login
``` POST /login ```
sent via body: nrp, password

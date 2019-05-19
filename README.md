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

### Berikut List Api pada Aplikasi Kehadiran Online (Safario):
#### API Cek db:
Terdapat 5 tabel : user, daftar_peserta, matkul, transaksi_matkul, transaksi_user
akses
<br/>``` GET /tabel/(Masukan Nama Tabel) ```
<br/>
1. absen
  ``` POST /absen/```
<br/>sent via body: ruang, nrp
<br/>![db](absen1.PNG)

2. rekap kuliah per semester
  ``` GET /rekappersemester/IDMATAKULIAH/IDSEMESTER ```
<br/>ex: /rekappersemester/3/4
<br/>![db](rekappersemester.jpg)

3. rekap kuliah per pertemuan
  ``` GET /rekappertemuan/IDMATAKULIAH/PERTEMUANKE ```
<br/>ex: /rekappertemuan/4/2
<br/>![db](rekappertemuan.jpg)

4. rekap per mahasiswa per kuliah
  ``` GET /rekapmahasiswa/NRP/IDMATAKULIAH ```
<br/>ex: /rekapmahasiswa/2147483647/3
<br/>![db](rekapmahasiswa.jpg)

5. rekap per mahasiswa per semester
  ``` GET /rekapmahasiswasemester/NRP/SEMESTER ```
<br/>ex : rekapmahasiswasemester/2147483647/4
<br/>![db](rekapmahasiswasemester.jpg)

6. tambah user mhs baru
  ``` POST /tambahmahasiswa ```
<br/>sent via body: nrp, nama, password
<br/>![db](tambahmhs.PNG)

7. tambah user mhs ke mata kuliah
  ``` GET /tambahpeserta/IDMATAKULIAH/NRP ```
<br/> ex : tambahpeserta/1/5115100022

8. tambah mata kuliah baru
  ``` POST /tambahmatkul ```
<br/>sent via body: nama_matkul, kelas, semester
<br/>![db](tambahmtkl.PNG)

9. tambah jadwal pertemuan untuk kuliah
``` POST /apitambahjadwal ```
<br/>sent via body: id_matkul, pertemuan_ke, waktu_awal, waktu_akhir, ruangan
<br/>![db](tambahjadwal.PNG)

10. Login
``` POST /login ```
<br/>sent via body: nrp, password
<br/>![db](login.PNG)

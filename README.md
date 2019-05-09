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
 * Package body parser, ``` npm istall body-parser ```
 * Package md5, ``` npm install md5 ```
 * Package nunjucks, ``` npm install nunjucks ```
 * Package mysql, ``` npm install mysql ```
4. Jalankan aplikasi dengan ``` node root.js ```

### Berikut List Api pada Aplikasi Kehadiran Online (Safario):
1. absen
  ``` POST /absen/RUANG/NRP ```

2. rekap kuliah per semester
  ``` GET /rekap/IDMATAKULIAH ```

3. rekap kuliah per pertemuan
  ``` GET /rekap/IDMATAKULIAH/PERTEMUANKE ```

4. rekap per mahasiswa per kuliah
  ``` GET /rekapmahasiswa/NRP/IDMATAKULIAH ```

5. rekap per mahasiswa per semester
  ``` GET /rekapmahasiswa/NRP/IDSEMESTER ```

6. tambah user mhs baru
  ``` POST /tambahmahasiswa ```
sent via body: nrp, nama, password

7. tambah user mhs ke mata kuliah
  ``` POST /tambahpeserta/IDMATAKULIAH/NRP ```

8. tambah mata kuliah baru
  ``` POST /tambahmatkul ```
sent via body: id mata kuliah, nama matakuliah, kelas

9. tambah jadwal pertemuan untuk kuliah
``` POST /tambahjadwal ```
sent via body: id mata kuliah, pertemuan ke, ruang, jam masuk, jam selesai

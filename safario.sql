/*
SQLyog Ultimate v8.6 Beta2
MySQL - 5.5.5-10.1.29-MariaDB : Database - safario
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`safario` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `safario`;

/*Table structure for table `daftar_peserta` */

DROP TABLE IF EXISTS `daftar_peserta`;

CREATE TABLE `daftar_peserta` (
  `id_daftar` int(11) NOT NULL AUTO_INCREMENT,
  `id_matkul` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  PRIMARY KEY (`id_daftar`),
  KEY `FK_daftar_peserta1` (`id_matkul`),
  KEY `FK_daftar_peserta2` (`id_user`),
  CONSTRAINT `FK_daftar_peserta1` FOREIGN KEY (`id_matkul`) REFERENCES `matkul` (`id_matkul`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_daftar_peserta2` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Data for the table `daftar_peserta` */

insert  into `daftar_peserta`(`id_daftar`,`id_matkul`,`id_user`) values (1,2,2);

/*Table structure for table `matkul` */

DROP TABLE IF EXISTS `matkul`;

CREATE TABLE `matkul` (
  `id_matkul` int(11) NOT NULL AUTO_INCREMENT,
  `nama_matkul` varchar(500) NOT NULL,
  `kelas` varchar(500) NOT NULL,
  PRIMARY KEY (`id_matkul`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

/*Data for the table `matkul` */

insert  into `matkul`(`id_matkul`,`nama_matkul`,`kelas`) values (1,'PBKK','H'),(2,'PBA','A'),(3,'AJK','B'),(4,'PBAA','A'),(5,'PBA','B');

/*Table structure for table `transaksi_matkul` */

DROP TABLE IF EXISTS `transaksi_matkul`;

CREATE TABLE `transaksi_matkul` (
  `id_tran_matkul` int(11) NOT NULL AUTO_INCREMENT,
  `id_matkul` int(11) NOT NULL,
  `pertemuan_ke` int(11) NOT NULL,
  `waktu_awal` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `waktu_akhir` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ruangan` varchar(50) NOT NULL,
  PRIMARY KEY (`id_tran_matkul`),
  KEY `FK_transaksi_matkul` (`id_matkul`),
  CONSTRAINT `FK_transaksi_matkul` FOREIGN KEY (`id_matkul`) REFERENCES `matkul` (`id_matkul`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

/*Data for the table `transaksi_matkul` */

insert  into `transaksi_matkul`(`id_tran_matkul`,`id_matkul`,`pertemuan_ke`,`waktu_awal`,`waktu_akhir`,`ruangan`) values (1,2,1,'2019-05-01 16:40:18','2019-05-01 12:00:00','IF102'),(2,3,1,'2019-05-02 10:00:00','2019-05-02 10:00:00','IF103'),(3,4,2,'2019-05-14 10:00:00','2019-05-14 12:00:00','IF105');

/*Table structure for table `transaksi_user` */

DROP TABLE IF EXISTS `transaksi_user`;

CREATE TABLE `transaksi_user` (
  `id_tran_user` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `id_tran_matkul` int(11) NOT NULL,
  `waktu` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` int(11) NOT NULL,
  PRIMARY KEY (`id_tran_user`),
  KEY `FK_transaksi_user` (`id_user`),
  KEY `FK_transaksi_user1` (`id_tran_matkul`),
  CONSTRAINT `FK_transaksi_user` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_transaksi_user1` FOREIGN KEY (`id_tran_matkul`) REFERENCES `transaksi_matkul` (`id_tran_matkul`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

/*Data for the table `transaksi_user` */

insert  into `transaksi_user`(`id_tran_user`,`id_user`,`id_tran_matkul`,`waktu`,`status`) values (1,1,1,'2019-05-01 10:05:00',1),(2,1,2,'2019-05-02 10:10:00',0),(3,2,1,'2019-05-01 10:10:00',1);

/*Table structure for table `user` */

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id_user` int(11) NOT NULL AUTO_INCREMENT,
  `nrp_nip` varchar(50) NOT NULL,
  `nama_user` varchar(500) NOT NULL,
  `password` varchar(500) NOT NULL,
  `role` int(11) NOT NULL,
  PRIMARY KEY (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

/*Data for the table `user` */

insert  into `user`(`id_user`,`nrp_nip`,`nama_user`,`password`,`role`) values (1,'2147483647','Findryan Kurnia P','202cb962ac59075b964b07152d234b70',2),(2,'2147483646','Huda','81dc9bdb52d04dc20036dbd8313ed055',2),(3,'5115100035','Findryan Kurnia P','202cb962ac59075b964b07152d234b70',2),(4,'123','ridho','202cb962ac59075b964b07152d234b70',1),(5,'5115100061','rewq','202cb962ac59075b964b07152d234b70',2),(6,'5115100065','awantot','202cb962ac59075b964b07152d234b70',2);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

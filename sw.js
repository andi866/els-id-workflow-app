/* ============================================================
   SERVICE WORKER

   Keberadaannya yang membuat halaman ini bisa dipasang sebagai
   aplikasi — itu syarat dari sistem, bukan pilihan.

   Yang disimpan hanya pembungkusnya: halaman kosong, ikon, dan
   keterangan aplikasi. Isi aplikasinya sendiri TIDAK pernah
   disimpan.

   Itu disengaja. Data transaksi berubah tiap menit, dan aplikasi
   yang menampilkan antrian kemarin jauh lebih berbahaya daripada
   aplikasi yang menolak terbuka saat internet mati.
   ============================================================ */

/*
 * Nomor versi dinaikkan tiap pembungkusnya berubah.
 *
 * Tanpa itu, HP yang sudah memasang tetap memakai halaman lama
 * yang tersimpan — dan perbaikan apa pun di sini tidak terasa.
 */
var VERSI = 'els-workflow-v6';

/*
 * Halaman pembungkusnya TIDAK ikut disimpan.
 *
 * Yang disimpan cuma ikon dan keterangan aplikasi — keduanya
 * jarang berubah. Halamannya sendiri selalu diambil baru.
 *
 * Alasannya: tiap kali halaman itu diperbaiki, HP yang sudah
 * memasang tetap memakai salinan lamanya sampai entah kapan. Yang
 * terjadi kemarin persis itu — perbaikan sidik jari sudah
 * diunggah, tapi yang jalan masih versi sebelumnya.
 *
 * Halaman ini kecil, jadi mengambilnya tiap kali hampir tidak
 * terasa. Yang berat isi aplikasinya, dan itu memang tidak pernah
 * disimpan di sini.
 */
var BERKAS = ['./manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(VERSI).then(function (c) {
      return c.addAll(BERKAS).catch(function () {});
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (nama) {
      return Promise.all(nama.map(function (n) {
        if (n !== VERSI) return caches.delete(n);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);

  /*
   * Apa pun yang menuju Google dibiarkan lewat apa adanya.
   *
   * Login, pembacaan data, penyimpanan — semuanya harus langsung
   * ke sumbernya. Menyentuhnya di sini hanya akan membuat data
   * basi tersaji tanpa ada yang tahu.
   */
  if (url.origin !== self.location.origin) return;

  /*
   * Halaman pembungkus selalu diambil baru; sisanya boleh dari
   * simpanan.
   */
  var halaman = e.request.mode === 'navigate' ||
                /index\.html$|\/$/.test(url.pathname);

  if (halaman) {
    e.respondWith(
      fetch(e.request).catch(function () {
        return caches.match(e.request);
      })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function (ada) {
      return ada || fetch(e.request);
    })
  );
});

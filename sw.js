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
var VERSI = 'els-workflow-v2';
var BERKAS = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

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

  e.respondWith(
    caches.match(e.request).then(function (ada) {
      return ada || fetch(e.request);
    })
  );
});

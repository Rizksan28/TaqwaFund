export const learningCategories = ["Kelola Usaha", "Kenali Akad", "Pahami Risiko", "Prinsip Syariah"] as const;
export type LearningCategory = typeof learningCategories[number];
export type Lesson = {
  id: string; title: string; category: LearningCategory; minutes: number; summary: string;
  sections: { title: string; body: string; example: string; action: string }[];
  questions: { prompt: string; options: string[]; correct: number; explanation: string }[];
  source: { title: string; url: string }; checkedAt: string;
};
const bookkeepingSource = { title: "Bank Indonesia — Pencatatan Transaksi Keuangan UMK", url: "https://www.bi.go.id/id/umkm/penelitian/Pages/Pedoman-Umum-Pedoman-Teknis-dan-Modul-PTK-untuk-UMK.aspx" };
const akadSource = { title: "OJK — Akad dalam Perbankan Syariah", url: "https://ojk.go.id/id/kanal/syariah/tentang-syariah/Pages/Akad-PBS.aspx" };
const principleSource = { title: "OJK — Perbankan Syariah dan Kelembagaan", url: "https://ojk.go.id/id/kanal/syariah/tentang-syariah/Pages/PBS-dan-Kelembagaan.aspx" };

export const lessons: Lesson[] = [
  {
    id: "records", title: "Mulai Catatan Keuangan Harian", category: "Kelola Usaha", minutes: 3,
    summary: "Bedakan omzet, biaya, dan uang yang benar-benar tersedia untuk usaha.", source: bookkeepingSource, checkedAt: "2026-10-09",
    sections: [
      { title: "Catat setiap transaksi", body: "Gunakan satu catatan untuk pemasukan dan pengeluaran usaha. Simpan tanggal, jenis transaksi, nominal, dan bukti yang tersedia. Catatan rutin membantu Anda menelusuri perubahan saldo tanpa mengandalkan ingatan.", example: "Penjualan tunai Rp300.000 dan transfer Rp200.000 dicatat terpisah, dengan total pemasukan Rp500.000.", action: "Siapkan kolom tanggal, keterangan, pemasukan, pengeluaran, dan metode pembayaran." },
      { title: "Omzet bukan uang bebas", body: "Omzet menunjukkan penjualan, bukan seluruh laba atau kas yang bebas digunakan. Masih ada biaya bahan, operasional, kewajiban, dan transaksi yang belum dibayar. Selisih omzet dan biaya sederhana belum tentu sama dengan laba akuntansi.", example: "Omzet Rp500.000 dikurangi biaya bahan Rp200.000 dan operasional Rp100.000 menyisakan Rp200.000, sebelum biaya lain.", action: "Pisahkan biaya rutin, pembelian aset, dan pengambilan pribadi dalam catatan." },
      { title: "Cocokkan saldo secara rutin", body: "Bandingkan catatan dengan uang tunai dan saldo rekening. Periksa transaksi ganda, biaya yang terlupa, serta pembayaran yang belum masuk. Gunakan alat yang bisa Anda jalankan secara konsisten; spreadsheet atau aplikasi bukan pengganti kebiasaan mencatat.", example: "Selisih saldo Rp25.000 ternyata biaya pengiriman yang belum dicatat.", action: "Luangkan waktu di akhir hari atau minggu untuk mencocokkan saldo." }
    ], questions: [
      { prompt: "Omzet Rp500.000 dan biaya Rp300.000. Berapa selisih sederhananya?", options: ["Rp500.000", "Rp200.000", "Rp300.000"], correct: 1, explanation: "Selisihnya Rp200.000. Nilai ini masih perlu ditinjau bersama biaya dan kewajiban lain." },
      { prompt: "Apa yang dilakukan saat saldo berbeda dari catatan?", options: ["Periksa transaksi dan biaya yang belum dicatat", "Hapus semua catatan", "Anggap selisih sebagai laba"], correct: 0, explanation: "Telusuri penyebab selisih agar catatan dan saldo dapat dicocokkan." }
    ]
  },
  {
    id: "separation", title: "Pisahkan Uang Pribadi dan Usaha", category: "Kelola Usaha", minutes: 3,
    summary: "Jaga keterlacakan dana tanpa mencampur kebutuhan rumah tangga dan operasional.", source: bookkeepingSource, checkedAt: "2026-10-09",
    sections: [
      { title: "Kenali dana yang tercampur", body: "Jika belanja rumah tangga dan pembelian bahan memakai sumber dana yang sama, kondisi kas usaha sulit dibaca. Pemisahan pencatatan membantu Anda melihat transaksi mana yang berkaitan dengan usaha.", example: "Pembelian tepung Rp150.000 dicatat sebagai biaya usaha; belanja pribadi Rp50.000 sebagai pengambilan pemilik.", action: "Kelompokkan transaksi minggu ini menjadi transaksi usaha dan transaksi pribadi." },
      { title: "Tentukan tempat dana usaha", body: "Gunakan rekening atau tempat penyimpanan dana usaha yang terpisah bila memungkinkan. Tujuannya memudahkan penelusuran, bukan memberi jaminan pembiayaan. Catat pula dana pribadi yang Anda masukkan ke usaha.", example: "Pemilik memasukkan Rp1.000.000 ke usaha. Dana itu dicatat sebagai kontribusi pemilik, bukan penjualan.", action: "Tentukan sumber dana yang akan digunakan untuk menerima dan membayar transaksi usaha." },
      { title: "Catat pengambilan pemilik", body: "Pengambilan uang oleh pemilik tetap perlu dicatat, meskipun usahanya kecil. Menyembunyikan transaksi pribadi sebagai pembelian bahan membuat catatan biaya tidak sesuai kondisi sebenarnya.", example: "Pemilik mengambil Rp200.000 untuk kebutuhan rumah. Catat pengambilan tersebut secara terpisah.", action: "Tinjau pengambilan pribadi secara berkala bersama kebutuhan operasional." }
    ], questions: [
      { prompt: "Dana pribadi yang dimasukkan ke usaha dicatat sebagai apa?", options: ["Penjualan", "Kontribusi pemilik", "Keuntungan otomatis"], correct: 1, explanation: "Kontribusi pemilik bukan pendapatan dari penjualan." },
      { prompt: "Belanja rumah tangga memakai dana usaha sebaiknya…", options: ["Tidak dicatat", "Dicatat sebagai biaya bahan", "Dicatat sebagai pengambilan pribadi"], correct: 2, explanation: "Pisahkan pengambilan pribadi dari biaya operasional usaha." }
    ]
  },
  {
    id: "buffer", title: "Bangun Dana Cadangan Usaha", category: "Kelola Usaha", minutes: 3,
    summary: "Siapkan ruang untuk menghadapi perubahan pemasukan dan biaya tak terduga.", source: bookkeepingSource, checkedAt: "2026-10-09",
    sections: [
      { title: "Mulai dari kebutuhan operasional", body: "Daftar biaya yang harus dibayar agar usaha berjalan, seperti bahan, sewa, dan upah. Cadangan perlu disesuaikan dengan pola usaha dan kewajiban Anda; tidak ada satu angka yang cocok untuk semua usaha.", example: "Usaha dengan biaya rutin Rp4.000.000 per bulan memakai angka itu sebagai dasar memetakan kebutuhan, bukan sebagai target universal.", action: "Catat biaya wajib dan waktu pembayarannya." },
      { title: "Sisihkan dari surplus yang tersedia", body: "Tentukan penyisihan berdasarkan dana yang benar-benar tersedia setelah mempertimbangkan kewajiban. Hindari menganggap seluruh omzet dapat disimpan sebagai cadangan. Pendapatan yang belum diterima juga belum menjadi kas.", example: "Saldo rekening mencakup uang untuk membayar pemasok minggu depan. Bagian tersebut belum bebas disisihkan.", action: "Periksa jadwal kewajiban sebelum menentukan penyisihan." },
      { title: "Tinjau saat kondisi berubah", body: "Pisahkan catatan cadangan dari dana belanja rutin. Jika cadangan dipakai, tulis tujuan dan nominalnya. Tinjau kembali kebutuhan ketika biaya atau pola penjualan berubah.", example: "Cadangan digunakan untuk mengganti alat yang rusak; penggunaan dan saldo sisanya dicatat.", action: "Tetapkan waktu peninjauan saldo dan kebutuhan cadangan." }
    ], questions: [
      { prompt: "Dasar memetakan cadangan adalah…", options: ["Biaya wajib dan pola usaha", "Seluruh omzet tanpa melihat kewajiban", "Angka yang sama untuk semua usaha"], correct: 0, explanation: "Cadangan mengikuti kebutuhan operasional dan kondisi masing-masing usaha." },
      { prompt: "Uang yang segera dibayar ke pemasok…", options: ["Pasti merupakan laba", "Perlu diperhitungkan sebagai kewajiban", "Boleh diabaikan"], correct: 1, explanation: "Pertimbangkan kewajiban sebelum menentukan dana yang bisa disisihkan." }
    ]
  },
  {
    id: "akad", title: "Kenali Murabahah, Ijarah, dan Musyarakah", category: "Kenali Akad", minutes: 4,
    summary: "Pahami perbedaan jual beli, sewa, dan kemitraan modal sebelum memilih produk.", source: akadSource, checkedAt: "2026-10-09",
    sections: [
      { title: "Murabahah: jual beli", body: "Murabahah adalah jual beli dengan harga perolehan dan keuntungan yang diketahui. Tinjau objek transaksi, harga jual, dan jadwal pembayaran yang disepakati.", example: "Contoh edukasi: harga barang Rp10 juta dan margin Rp2 juta menghasilkan harga jual Rp12 juta, sebelum biaya lain yang disepakati.", action: "Minta rincian harga perolehan, margin, dan biaya lain." },
      { title: "Ijarah: pemanfaatan aset", body: "Ijarah adalah sewa manfaat barang atau jasa dengan imbalan yang disepakati. Sewa biasa tidak otomatis memindahkan kepemilikan; periksa jenis akadnya.", example: "Menyewa mesin untuk produksi berbeda dari membeli mesin tersebut.", action: "Tinjau masa sewa, tanggung jawab perawatan, dan ketentuan akhir masa sewa." },
      { title: "Musyarakah: kemitraan modal", body: "Musyarakah adalah kerja sama modal. Keuntungan mengikuti nisbah yang disepakati; kerugian usaha pada prinsipnya mengikuti porsi modal, dengan ketentuan tanggung jawab tertentu perlu ditinjau dalam akad.", example: "Bagian dari laba aktual tidak sama dengan angka pembayaran bulanan yang selalu tetap.", action: "Periksa kontribusi modal, nisbah, pengelolaan, risiko, dan cara pengakhiran akad." }
    ], questions: [
      { prompt: "Akad untuk sewa manfaat aset adalah…", options: ["Murabahah", "Ijarah", "Musyarakah"], correct: 1, explanation: "Ijarah berkaitan dengan sewa manfaat. Detail hak dan kewajiban perlu dibaca dalam akad." },
      { prompt: "Bagian keuntungan dalam Musyarakah mengikuti…", options: ["Laba dan nisbah yang disepakati", "Jaminan keuntungan tanpa risiko", "Harga jual barang saja"], correct: 0, explanation: "Musyarakah adalah kemitraan modal, bukan jaminan hasil usaha yang selalu tetap." }
    ]
  },
  {
    id: "risk", title: "Periksa Risiko Sebelum Mengajukan", category: "Pahami Risiko", minutes: 3,
    summary: "Tinjau kewajiban, biaya, dan skenario pendapatan yang berubah.", source: akadSource, checkedAt: "2026-10-09",
    sections: [
      { title: "Baca semua komponen biaya", body: "Bandingkan penawaran menggunakan rincian akad dan biaya, bukan hanya angka bulanan. Minta penjelasan tertulis untuk hal yang belum jelas. Angka simulasi di TaqwaFund merupakan contoh, bukan tarif atau keputusan mitra.", example: "Dua skenario dengan angka bulanan sama dapat memiliki masa pembayaran dan biaya tambahan berbeda.", action: "Susun daftar nominal, jangka waktu, biaya, dan kewajiban yang perlu dikonfirmasi." },
      { title: "Uji perubahan pemasukan", body: "Buat skenario ketika penjualan turun atau biaya naik. Pertimbangkan kewajiban lain dan jadwal penerimaan uang. Surplus sederhana tidak menggantikan analisis mitra atau pemeriksaan arus kas lengkap.", example: "Pesanan dibayar bulan depan, sementara bahan harus dibayar minggu ini. Waktu penerimaan uang ikut memengaruhi kas.", action: "Bandingkan jadwal pemasukan dan pembayaran dalam skenario normal dan sepi." },
      { title: "Jangan samakan rekomendasi dengan persetujuan", body: "Kesesuaian awal dan simulasi belum merupakan keputusan pembiayaan. Periksa identitas penyedia, saluran resmi, dan dokumen sebelum mengirim data. Tanyakan ketentuan keterlambatan, penghentian, dan penyelesaian sengketa.", example: "Status simulasi tercatat di aplikasi tidak berarti pengajuan sudah diterima bank.", action: "Pastikan penerima dan data yang akan dibagikan sebelum melanjutkan pengajuan nyata." }
    ], questions: [
      { prompt: "Status simulasi tercatat berarti…", options: ["Bank pasti menyetujui", "Dana pasti cair", "Contoh proses dicatat, belum menjadi keputusan mitra"], correct: 2, explanation: "Simulasi tidak sama dengan penerimaan, peninjauan, atau persetujuan oleh mitra." },
      { prompt: "Saat membandingkan produk, periksa…", options: ["Angka bulanan saja", "Akad, total biaya, tenor, dan kewajiban", "Warna logo saja"], correct: 1, explanation: "Rincian biaya dan kewajiban memberikan konteks yang tidak terlihat dari angka bulanan saja." }
    ]
  },
  {
    id: "principles", title: "Transaksi Amanah dan Prinsip Syariah", category: "Prinsip Syariah", minutes: 3,
    summary: "Kenali pentingnya kejelasan transaksi, keadilan, dan praktik usaha yang bertanggung jawab.", source: principleSource, checkedAt: "2026-10-09",
    sections: [
      { title: "Jelas sejak awal", body: "Prinsip syariah menekankan keadilan dan menghindari riba, maysir, gharar, serta objek yang dilarang. Kejelasan objek, harga, dan hak para pihak membantu mencegah salah pengertian.", example: "Penjual menjelaskan ukuran barang, harga, dan waktu penyerahan sebelum pembeli menyetujui transaksi.", action: "Periksa apakah informasi utama transaksi sudah dapat dipahami kedua pihak." },
      { title: "Label saja belum cukup", body: "Nama produk tidak menggantikan pemeriksaan akad dan praktiknya. Sertifikat, pengawasan produk, serta penjelasan pihak berwenang memiliki fungsi berbeda dari kuis atau checklist pribadi.", example: "Menyelesaikan materi TaqwaLearn tidak menjadi sertifikasi kepatuhan usaha.", action: "Minta rujukan dan penjelasan dari pihak yang berwenang untuk persoalan akad tertentu." },
      { title: "Bangun kebiasaan transparan", body: "Jelaskan ketentuan transaksi dan hindari menutupi informasi penting. Ketika ada ketidakjelasan, klarifikasi sebelum menyetujui. Ringkasan edukasi ini bukan fatwa untuk menilai transaksi tertentu.", example: "Ketentuan pengembalian barang dijelaskan sebelum transaksi, bukan setelah timbul sengketa.", action: "Tinjau informasi harga, penyerahan, dan penanganan keluhan dalam usaha Anda." }
    ], questions: [
      { prompt: "Saat ketentuan transaksi belum jelas, sebaiknya…", options: ["Klarifikasi sebelum menyetujui", "Langsung menyetujui tanpa membaca", "Abaikan informasi yang kurang"], correct: 0, explanation: "Kejelasan membantu kedua pihak memahami hak dan kewajiban." },
      { prompt: "Menyelesaikan kuis TaqwaLearn merupakan…", options: ["Fatwa atas seluruh transaksi", "Sertifikasi halal", "Progres belajar, bukan sertifikasi"], correct: 2, explanation: "Progres belajar tidak menggantikan penilaian atau sertifikasi dari pihak berwenang." }
    ]
  }
];

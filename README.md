# 🧩 CRM Eureka!

## 1. Tujuan Sistem (Objective)
   * Mendigitalisasi proses manajemen prospek dan pelanggan untuk tim sales logistik.
   * Menyederhanakan aktivitas sales: input, tracking, follow-up, hingga konversi ke deal.
   * Menyediakan tampilan List dan Kanban dalam satu antarmuka guna mempermudah visibilitas pipeline.

## 2. Target Pengguna
   a. Sales Representative
   b. Sales Manager / Admin
   c. Tim Customer Support
   d. Manajemen
	
## 3. Entitas & Data Model Utama

| Entitas            | Deskripsi Singkat                                                                 |
|--------------------|-----------------------------------------------------------------------------------|
| Lead               | Prospek yang terdiri dari kontak individu + perusahaan (mencakup informasi kontak, sumber, owner, status, stage) |
| Company            | Tabel referensi perusahaan (dengan alamat, industri, dll)                         |
| User               | Sales atau admin system yang mengelola lead                                       |
| Activity / Task    | Riwayat follow-up telepon/email, meeting, reminder                                |
| Deal / Opportunity | Prospek yang sudah qualified dan sedang dinegosiasi                               |
	
## 4. Fitur Utama (MVP v1)	
🔹 Dashboard Leads
    1. Tampilan List View dengan kolom: No, Name, Company, Contact, Owner, Stage.
    2. Kanban View: drag & drop antar kolom stage hingga update stage via AJAX.
	
🔹 Filtering & Export	
    1. Filter berdasarkan Owner, Stage, Lead Source.
    2. Tombol Export untuk unduh data (CSV).
	
🔹 CRUD Lead	
    1. Form tambah baru, edit, dan hapus lead.
    2. Otomatis menyimpan referensi Company dan Owner jika belum ada.
	
🔹 Task & Activity Log (fase berikut)	
    1. Catat interaksi setiap lead.
    2. Status follow-up, notifikasi, dan timeline.
	
🔹 Integrasi Email/WhatsApp (opsional lanjut)	
    1. Mengirim email/WA dari CRM.
    2. Logging komunikasi masuk/keluar ke lead.
	
## 5. Alur Pengguna (User Flow)
   1. Admin / Sales klik Menambahkan Lead
   2. Data disimpan dengan atribut seperti nama, perusahaan, kontak, sumber, stage awal = New
   3. Di Dashboard, sales bisa memilih List View untuk manajemen terstruktur atau Kanban View untuk visual pipeline
   4. Sales drag & drop lead ke stage berikutnya bila ada perkembangan, lalu otomatis AJAX call ke backend agar langsung update di database
   5. Jika lead masuk ke stage lanjut seperti “Qualified”, lead dapat dikonversi ke Deal / Opportunity

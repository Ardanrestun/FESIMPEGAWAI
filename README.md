
# SIMPEGAWAI

Repositori:
- **Backend:** [BESIMPEGAWAI](https://github.com/Ardanrestun/BESIMPEGAWAI)
- **Frontend:** [FESIMPEGAWAI](https://github.com/Ardanrestun/FESIMPEGAWAI)

---

## Arsitektur Solusi

**Diagram Alur Data**

```
[Database] 
    ↕ 
[Backend API (BESIMPEGAWAI)] 
    ↔ (RESTful API)
[Frontend App (FESIMPEGAWAI)]
    ↔ (Browser)
[User]
```

**Penjelasan Alur:**
1. Frontend mengirim request ke API Backend untuk mengambil data `Task`, `Employee`, dan `Remuneration`.
2. Backend memproses permintaan, melakukan query ke database, menghitung total remunerasi berdasarkan data input dari employee.
3. Backend mengembalikan hasil data ke Frontend.
4. Frontend menampilkan data tersebut ke user secara real-time dan interaktif.

---

## Penjelasan Desain

**Pemilihan Pendekatan:**
- **Modularisasi:** Backend dan Frontend dipisahkan agar lebih fleksibel untuk deployment dan scaling.
- **Perhitungan Remunerasi:** 
  - Remunerasi dihitung berbasis kontribusi masing-masing employee dalam sebuah task.
  - Total remunerasi = `(hours_spent × hourly_rate) + additional_charges`.
  - Bila satu task dikerjakan oleh beberapa employee, remunerasi masing-masing dihitung dan dijumlahkan untuk mendapatkan total task remuneration.
- **Kenapa seperti ini?**
  - Memberikan fleksibilitas apabila satu task dihandle banyak employee.
  - Mengakomodasi model penggajian berbasis jam dan tambahan biaya khusus (misal lembur, bonus).

---

## Setup & Deploy

### Prasyarat
- Node.js LTS
- PHP 8.1+
- Composer
- PostgreSQL 15

### Langkah-langkah Local Setup

#### 1. Clone Repositori
```bash
git clone https://github.com/Ardanrestun/BESIMPEGAWAI.git
git clone https://github.com/Ardanrestun/FESIMPEGAWAI.git
```

#### 2. Setup Backend (BESIMPEGAWAI)
```bash
cd BESIMPEGAWAI
cp .env.example .env
# Edit .env sesuai konfigurasi database lokal
# Edit .env untuk pointing ke URL frontend (misal: http://localhost:1000)
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

#### 3. Setup Frontend (FESIMPEGAWAI)
```bash
cd FESIMPEGAWAI
cp .env.local.example .env
# Edit .env untuk pointing ke URL backend (misal: http://localhost:8000)
npm install
npm run dev

# Login administrator
email:admin@mail.com
password:12345678
1. tambahkan role pada setting role management
2. tambahkan user pada setting user management
3. tambahkan menu pada setting menu management


# Role yang wajib ditambahkan
1. Employee

# Url menu yang wajib ditambahkan
1. /employee/manage
2. /employee/managetask 
3. /employee/duties -> untuk Employee



```

### Catatan
- Pastikan backend (`php artisan serve`) jalan di port 8000 atau sesuaikan `.env` frontend.
- Database default menggunakan PostgreSQL, pastikan service PostgreSQL sudah aktif.

---

### Langkah - Langkah Penggunaan
- Tambahkan Employee
- Tambahkan Task
- Hubungkan Employee dan Task 
- Login sebagai employee 

## Tantangan & Solusi

| Tantangan | Solusi |
|:---|:---|
| **1. Perhitungan Remunerasi Dinamis**: Banyak kombinasi hours, rate, dan charges yang perlu dihitung akurat. | Membuat struktur data yang mengumpulkan semua kontribusi employee per task sebelum dijumlahkan di backend. |
| **2. Pivot Table yang Efisien**: Awalnya pivot antara `detail_task` dan `employee` membingungkan dalam menentukan total budget. | Redesain pivot menjadi langsung antara `task` dan `employee`, sehingga kontribusi langsung dikaitkan ke task. |
| **3. Sinkronisasi Frontend-Backend**: Perbedaan struktur data bisa menyebabkan error parsing. | Membuat response API Terstandarisasi dan menyesuaikan fetcher di frontend agar kompatibel. |
| **4. Setup Local Development yang Konsisten**: Dependency versi berbeda antar device developer. | Menyediakan `.env.example` dan dokumentasi langkah setup di README ini. |

---

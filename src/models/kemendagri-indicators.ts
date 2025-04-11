
import { Indicator } from "./types";

// Indikator penilaian KEMENDAGRI
export const kemendagriIndicators: Indicator[] = [
  // I. ASPEK KEUANGAN
  {
    id: "roe",
    name: "ROE",
    category: "Keuangan",
    formula: "Laba (Rugi) Bersih setelah Pajak / Jumlah Ekuitas * 100 %",
    unit: "%",
    weight: 0.055
  },
  {
    id: "rasio_operasi",
    name: "Rasio Operasi",
    formula: "Biaya Operasi / Pendapatan Operasi",
    category: "Keuangan",
    unit: "",
    weight: 0.055
  },
  {
    id: "cash_ratio",
    name: "Cash Ratio",
    formula: "Kas+Setara Kas / Utang Lancar * 100 %",
    category: "Keuangan",
    unit: "%",
    weight: 0.055
  },
  {
    id: "efektifitas_penagihan",
    name: "Efektifitas Penagihan",
    formula: "Jumlah Penerimaan Rek Air / Jumah Rekening Air * 100 %",
    category: "Keuangan",
    unit: "%",
    weight: 0.055
  },
  {
    id: "solvabilitas",
    name: "Solvabilitas",
    formula: "Total Aktiva / Total Utang * 100%",
    category: "Keuangan",
    unit: "%",
    weight: 0.030
  },
  
  // II. ASPEK PELAYANAN
  {
    id: "cakupan_pelayanan_teknis",
    name: "Cakupan Pelayanan Teknis",
    formula: "Jumlah Penduduk Terlayani / Jumlah Penduduk wilayah pelayanan * 100%",
    category: "Pelayanan",
    unit: "%",
    weight: 0.050
  },
  {
    id: "pertumbuhan_pelanggan",
    name: "Pertumbuhan Pelanggan",
    formula: "(Jmh Pelanggan thn ini - pelanggan thn lalu) / pelanggan tahun lalu * 100 %",
    category: "Pelayanan",
    unit: "%",
    weight: 0.050
  },
  {
    id: "tingkat_penyelesaian_aduan",
    name: "Tingkat Penyelesaian Aduan",
    formula: "Jumlah Pengaduan Selesai Ditangani / Jumlah Pengaduan *100%",
    category: "Pelayanan",
    unit: "%",
    weight: 0.025
  },
  {
    id: "kualitas_air_pelanggan",
    name: "Kualitas Air Pelanggan",
    formula: "JumlahUji Kualitas Yg Memenuhi syarat / Jumlah yang Diuji",
    category: "Pelayanan",
    unit: "",
    weight: 0.075
  },
  {
    id: "konsumsi_air_domestik",
    name: "Konsumsi Air Domestik",
    formula: "(Jmh Air Yang Terjual Domestik Setahun/12) / Jumlah Pelanggan Domestik",
    category: "Pelayanan",
    unit: "m³/pelanggan/bulan",
    weight: 0.050
  },
  
  // III. ASPEK OPERASI
  {
    id: "efisiensi_produksi",
    name: "Efisiensi Produksi",
    formula: "Volume Produksi Riil (m3) / Kapasitas terpasang (m3) * 100%",
    category: "Operasi",
    unit: "%",
    weight: 0.070
  },
  {
    id: "tingkat_kehilangan_air",
    name: "Tingkat Kehilangan Air",
    formula: "Distribusi Air - Air Terjual / Distribusi Air * 100%",
    category: "Operasi",
    unit: "%",
    weight: 0.070
  },
  {
    id: "jam_operasi_layanan",
    name: "Jam Operasi Layanan",
    formula: "Waktu Distribusi Air Ke pelggan 1 thn / 365",
    category: "Operasi",
    unit: "jam/hari",
    weight: 0.080
  },
  {
    id: "tekanan_air_samb_pelanggan",
    name: "Tekanan Air Samb Pelanggan",
    formula: "Jmh Pelanggan dilayani dgn tekanan diatas 0,7Bar / Jumlah Pelanggan * 100%",
    category: "Operasi",
    unit: "%",
    weight: 0.065
  },
  {
    id: "penggantian_meter_air",
    name: "Penggantian Meter Air",
    formula: "Jumlah Meter Yg diganti atau dikalibrasi tahun ybs / Jumlah Pelanggan * 100%",
    category: "Operasi",
    unit: "%",
    weight: 0.065
  },
  
  // IV. ASPEK SDM
  {
    id: "rasio_pegawai_per_1000_pelanggan",
    name: "Rasio Jmh Pegawai per 1000 pelanggan",
    formula: "Jumlah Pegawai / Jumlah Pelanggan * 1000",
    category: "SDM",
    unit: "pegawai/1000 pelanggan",
    weight: 0.070
  },
  {
    id: "ratio_diklat_pegawai",
    name: "Ratio Diklat Pegawai atau Peningkatan Kompetensi",
    formula: "Jumlah Pegawai Yg Ikut Diklat / Jumlah Pegawai *100%",
    category: "SDM",
    unit: "%",
    weight: 0.040
  },
  {
    id: "biaya_diklat_terhadap_biaya",
    name: "Biaya Diklat Terhadap Biaya",
    formula: "Biaya Diklat / Biaya Pegawai * 100%",
    category: "SDM",
    unit: "%",
    weight: 0.040
  }
];

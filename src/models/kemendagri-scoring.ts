import { Indicator, Value } from "./types";
import { kemendagriIndicators } from "./kemendagri-indicators";

/**
 * Menghitung skor berdasarkan nilai indikator
 * @param value Nilai indikator
 * @param indicatorId ID indikator
 * @returns Skor yang dihitung
 */
export const calculateKemendagriScore = (value: number, indicatorId: string): number => {
  // Indikator dengan nilai tetap
  if (indicatorId === "peningkatan_rasio_laba_aktiva" || 
      indicatorId === "peningkatan_ratio_laba_penjualan" || 
      indicatorId === "penurunan_tingkat_kehilangan_air") {
    return 1;
  }
  
  // Indikator Administrasi - nilai langsung dari input
  if (indicatorId === "rencana_jangka_panjang" || 
      indicatorId === "rencana_organisasi" || 
      indicatorId === "prosedur_operasi_standar" || 
      indicatorId === "gambar_nyata_laksana" || 
      indicatorId === "pedoman_penilaian_kinerja" || 
      indicatorId === "rencana_kerja_anggaran" || 
      indicatorId === "tertib_laporan_internal" || 
      indicatorId === "tertib_laporan_eksternal" || 
      indicatorId === "opini_auditor_independen" || 
      indicatorId === "tindak_lanjut_hasil_pemeriksaan") {
    return value;
  }
  
  // Indikator lainnya dihitung berdasarkan formula
  switch (indicatorId) {
    // Aspek Keuangan
    case "ratio_laba_terhadap_penjualan":
      if (value > 20) return 5;
      if (value > 14) return 4;
      if (value > 6) return 3;
      if (value > 0) return 2;
      return 1;
      
    case "ratio_aktiva_lancar_utang_lancar":
      if (value > 3) return 1;
      if (value > 2.7) return 2;
      if (value > 2.3) return 3;
      if (value > 2) return 4;
      if (value <= 1) return 1;
      if (value <= 1.25) return 2;
      if (value <= 1.5) return 3;
      if (value <= 1.75) return 4;
      if (value <= 2) return 5;
      return 4; // Default untuk nilai antara 2-2.3
      
    case "rasio_utang_jangka_panjang_ekuitas":
      if (value < 0.5) return 5;
      if (value > 1) return 1;
      if (value > 0.8) return 2;
      if (value > 0.7) return 3;
      return 4; // untuk nilai 0.5-0.7
      
    case "rasio_total_aktiva_total_utang":
      if (value > 2) return 5;
      if (value > 1.7) return 4;
      if (value > 1.3) return 3;
      if (value > 1) return 2;
      return 1;
      
    case "rasio_biaya_operasi_pendapatan_operasi":
      if (value > 1) return 1;
      if (value > 0.85) return 2;
      if (value > 0.65) return 3;
      if (value > 0.5) return 4;
      return 5;
      
    case "ratio_laba_operasi_angsuran":
      if (value > 2) return 5;
      if (value > 1.7) return 4;
      if (value > 1.3) return 3;
      if (value > 1) return 2;
      return 5;
      
    case "ratio_aktiva_produktif_penjualan_air":
      if (value <= 2) return 5;
      if (value > 8) return 1;
      if (value > 6) return 2;
      if (value > 4) return 3;
      return 4; // untuk nilai 2-4
      
    case "jangka_waktu_penagihan_piutang":
      if (value <= 60) return 5;
      if (value > 180) return 1;
      if (value > 150) return 2;
      if (value > 90) return 3;
      return 4; // untuk nilai 60-90
      
    case "efektifitas_penagihan":
      if (value > 90) return 5;
      if (value > 85) return 4;
      if (value > 80) return 3;
      if (value > 75) return 2;
      return 1;
      
    // Aspek Operasional
    case "cakupan_pelayanan":
      if (value > 60) return 5;
      if (value > 45) return 4;
      if (value > 30) return 3;
      if (value > 15) return 2;
      return 1;
      
    case "tingkat_kehilangan_air":
      if (value <= 20) return 4;
      if (value > 40) return 1;
      if (value > 30) return 2;
      return 3;
      
    case "produktifitas_pemanfaatan_instalasi":
      if (value > 90) return 4;
      if (value > 80) return 3;
      if (value > 70) return 2;
      return 1;
      
    case "peneraan_meter":
      if (value <= 0) return 0;
      if (value <= 10) return 1;
      if (value <= 20) return 2;
      if (value <= 25) return 3;
      return 1;
      
    case "kemampuan_penanganan_pengaduan":
      if (value < 80) return 1;
      return 2;
      
    case "ratio_karyawan_per_1000_pelanggan":
      if (value > 18) return 1;
      if (value > 15) return 2;
      if (value > 11) return 3;
      if (value > 8) return 4;
      return 5;
      
    // Indikator dengan nilai langsung dari input
    case "kualitas_air_distribusi":
    case "kontinuitas_air":
    case "kecepatan_penyambungan_baru":
    case "kemudahan_pelayanan_service_point":
      return value;
      
    default:
      // Untuk indikator lain yang masih menggunakan formula default
      if (value <= 0) return 1;
      if (value > 0 && value <= 3) return 2;
      if (value > 3 && value <= 7) return 3;
      if (value > 7 && value <= 10) return 4;
      if (value > 10) return 5;
      return 0;
  }
};

/**
 * Menghitung total skor dari semua indikator dalam kategori
 */
export const calculateKemendagriCategoryScore = (
  values: Record<string, Value>, 
  category: string
): number => {
  const categoryIndicators = kemendagriIndicators.filter(
    indicator => indicator.category === category
  );
  
  let categoryScore = 0;
  
  categoryIndicators.forEach((indicator) => {
    const valueObj = values[indicator.id];
    if (valueObj) {
      categoryScore += valueObj.score;
    }
  });
  
  return categoryScore;
};

/**
 * Menghitung total skor dari semua indikator
 */
export const calculateKemendagriTotalScore = (values: Record<string, Value>): number => {
  // Hitung skor untuk setiap aspek
  const keuanganScore = calculateKemendagriCategoryScore(values, "Keuangan");
  const operasionalScore = calculateKemendagriCategoryScore(values, "Operasional");
  const administrasiScore = calculateKemendagriCategoryScore(values, "Administrasi");
  
  // Hitung total skor dengan bobot yang benar
  const totalScore = 
    (keuanganScore / 60 * 45) + 
    (operasionalScore / 47 * 40) + 
    (administrasiScore / 36 * 15);
  
  return totalScore;
};

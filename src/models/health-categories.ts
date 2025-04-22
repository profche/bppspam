
// Fungsi untuk mendapatkan kategori berdasarkan total skor
export const getHealthCategory = (score: number): {
  category: string;
  color: string;
} => {
  if (score >= 3.4) {
    return {
      category: "Sehat",
      color: "bg-green-500"
    };
  } else if (score >= 2.8) {
    return {
      category: "Cukup Sehat",
      color: "bg-blue-500"
    };
  } else if (score >= 2.2) {
    return {
      category: "Kurang Sehat",
      color: "bg-yellow-500"
    };
  } else {
    return {
      category: "Sakit",
      color: "bg-red-500"
    };
  }
};

// Fungsi untuk kemendagri mendapatkan kategori berdasarkan total skor
export const getHealthCategorykemendagri = (score: number): {
  category: string;
  color: string;
} => {
  if (score >= 75) {
    return {
      category: "Baik Sekali",
      color: "bg-green-500"
    };
  } else if (score >= 60) {
    return {
      category: "Baik",
      color: "bg-blue-500"
    };
  } else if (score >= 45) {
    return {
      category: "Cukup",
      color: "bg-yellow-500"
    };
  } else if (score >= 30) {
    return {
      category: "Kurang",
      color: "bg--500"
    };
  } else {
    return {
      category: "Sakit",
      color: "bg-red-500"
    };
  }
};
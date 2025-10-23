// Helper function untuk format angka dengan 1 digit desimal dan koma sebagai pemisah
export const formatDecimal = (value) => {
  const num = Number(value);
  if (isNaN(num)) return "0";
  
  // Jika angka bulat, tampilkan tanpa desimal
  if (num % 1 === 0) {
    return num.toString();
  }
  
  // Format dengan 1 digit desimal dan ganti titik dengan koma
  return num.toFixed(1).replace('.', ',');
};

// Helper function untuk format angka dengan 2 digit desimal dan koma sebagai pemisah
export const formatDecimal2 = (value) => {
  const num = Number(value);
  if (isNaN(num)) return "0";
  
  // Jika angka bulat, tampilkan tanpa desimal
  if (num % 1 === 0) {
    return num.toString();
  }
  
  // Format dengan 2 digit desimal dan ganti titik dengan koma
  return num.toFixed(2).replace('.', ',');
};

// Helper function untuk format persentase dengan 1 digit desimal dan koma sebagai pemisah
export const formatPercentage = (value) => {
  const num = Number(value);
  if (isNaN(num)) return "0%";
  
  // Jika angka bulat, tampilkan tanpa desimal
  if (num % 1 === 0) {
    return num.toString() + "%";
  }
  
  // Format dengan 1 digit desimal dan ganti titik dengan koma
  return num.toFixed(1).replace('.', ',') + "%";
};

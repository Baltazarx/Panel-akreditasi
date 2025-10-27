// Access matrix & checker
export const ACCESS_MATRIX = {
  admin: { "*": { C: true, U: true, D: true, R: true } },
  "waket1": { "*": { C: true, U: true, D: true, R: true } },
  "waket2": { "*": { C: true, U: true, D: true, R: true } },
  tpm: { "*": { C: true, U: true, D: true, R: true } },
  prodi: { tabel_1a1: { C: true, U: true, D: true, R: true }, "beban_kerja_dosen": { C: true, U: true, D: true, R: true }, pegawai: { R: true }, tahun: { R: true } },
  lppm: { tabel_1a2: { C: true, U: true, D: true, R: true }, tabel_1a3: { C: true, U: true, D: true, R: true } },
  kepegawaian: { tabel_1a5: { C: true, U: true, D: true, R: true }, tendik: { R: true } },
};

export function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

export function roleCan(role, tableKey, action) {
  if (!role) return false;
  const r = ACCESS_MATRIX[role];
  if (!r) return false;
  if (r["*"]) return !!r["*"][action];
  return !!r[tableKey]?.[action];
}

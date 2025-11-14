import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical } from 'react-icons/fi';

const ENDPOINT = "/tabel-3a1-sarpras-penelitian";
const TABLE_KEY = "tabel_3a1_sarpras_penelitian";
const LABEL = "3.A.1 Sarana dan Prasarana Penelitian";

/* ---------- Modal Form Tambah/Edit ---------- */
function ModalForm({ isOpen, onClose, onSave, initialData, maps }) {
  const [form, setForm] = useState({
    nama_sarpras: "",
    daya_tampung: "",
    luas_ruang_m2: "",
    kepemilikan: "",
    lisensi: "",
    perangkat_detail: "",
    link_bukti: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        nama_sarpras: initialData.nama_sarpras || "",
        daya_tampung: initialData.daya_tampung || "",
        luas_ruang_m2: initialData.luas_ruang_m2 || "",
        kepemilikan: initialData.kepemilikan || "",
        lisensi: initialData.lisensi || "",
        perangkat_detail: initialData.perangkat_detail || "",
        link_bukti: initialData.link_bukti || "",
      });
    } else {
      setForm({
        nama_sarpras: "",
        daya_tampung: "",
        luas_ruang_m2: "",
        kepemilikan: "",
        lisensi: "",
        perangkat_detail: "",
        link_bukti: "",
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit Sarana dan Prasarana Penelitian" : "Tambah Sarana dan Prasarana Penelitian"}
          </h2>
          <p className="text-white/80 mt-1 text-sm">Lengkapi data sarana dan prasarana penelitian sesuai dengan format LKPS.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Prasarana */}
            <div className="md:col-span-2">
              <label htmlFor="nama_sarpras" className="block text-sm font-medium text-slate-700 mb-1">
                Nama Prasarana <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nama_sarpras"
                value={form.nama_sarpras}
                onChange={(e) => handleChange("nama_sarpras", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="cth: Laboratorium Komputer, Laboratorium Jaringan, dll"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Prasarana diisi nama laboratorium</p>
            </div>

            {/* Daya Tampung */}
            <div>
              <label htmlFor="daya_tampung" className="block text-sm font-medium text-slate-700 mb-1">
                Daya Tampung
              </label>
              <input
                type="number"
                id="daya_tampung"
                value={form.daya_tampung}
                onChange={(e) => handleChange("daya_tampung", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="cth: 30"
                min="0"
              />
            </div>

            {/* Luas Ruang (m²) */}
            <div>
              <label htmlFor="luas_ruang_m2" className="block text-sm font-medium text-slate-700 mb-1">
                Luas Ruang (m²)
              </label>
              <input
                type="number"
                id="luas_ruang_m2"
                value={form.luas_ruang_m2}
                onChange={(e) => handleChange("luas_ruang_m2", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="cth: 50"
                min="0"
                step="0.01"
              />
            </div>

            {/* Kepemilikan */}
            <div>
              <label htmlFor="kepemilikan" className="block text-sm font-medium text-slate-700 mb-1">
                Milik sendiri (M)/Sewa (W)
              </label>
              <select
                id="kepemilikan"
                value={form.kepemilikan}
                onChange={(e) => handleChange("kepemilikan", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
              >
                <option value="">Pilih Kepemilikan</option>
                <option value="M">Milik sendiri (M)</option>
                <option value="W">Sewa (W)</option>
              </select>
            </div>

            {/* Lisensi */}
            <div>
              <label htmlFor="lisensi" className="block text-sm font-medium text-slate-700 mb-1">
                Berlisensi (L)/Public Domain (P)/Tidak Berlisensi (T)
              </label>
              <select
                id="lisensi"
                value={form.lisensi}
                onChange={(e) => handleChange("lisensi", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
              >
                <option value="">Pilih Lisensi</option>
                <option value="L">Berlisensi (L)</option>
                <option value="P">Public Domain (P)</option>
                <option value="T">Tidak Berlisensi (T)</option>
              </select>
            </div>

            {/* Perangkat Detail */}
            <div className="md:col-span-2">
              <label htmlFor="perangkat_detail" className="block text-sm font-medium text-slate-700 mb-1">
                Perangkat
              </label>
              <textarea
                id="perangkat_detail"
                value={form.perangkat_detail}
                onChange={(e) => handleChange("perangkat_detail", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] resize-none"
                rows="3"
                placeholder="cth: Hardware, Software, Bandwidth, Device, Tool, dll"
              />
              <p className="text-xs text-gray-500 mt-1">Perangkat yang dimiliki diisi perangkat keras, perangkat lunak, bandwidth, device, tool dan lain-lain.</p>
            </div>

            {/* Link Bukti */}
            <div className="md:col-span-2">
              <label htmlFor="link_bukti" className="block text-sm font-medium text-slate-700 mb-1">
                Link Bukti
              </label>
              <input
                type="url"
                id="link_bukti"
                value={form.link_bukti}
                onChange={(e) => handleChange("link_bukti", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="https://example.com/bukti"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 rounded-xl border-2 border-red-500 text-red-500 font-medium bg-white hover:bg-red-500 hover:border-red-500 hover:text-white active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0384d6] to-[#043975] hover:from-[#043975] hover:to-[#0384d6] text-white font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Tabel Data ---------- */
function DataTable({
  rows,
  maps,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
  onRestore,
  onHardDelete,
  showDeleted,
  selectedRows,
  setSelectedRows,
  isAllSelected,
  handleSelectAll,
}) {
  const filteredRows = rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at);
  
  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Close dropdown when clicking outside, scrolling, or resizing
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.dropdown-container') && !event.target.closest('.fixed')) {
        setOpenDropdownId(null);
      }
    };

    const handleScroll = () => {
      if (openDropdownId) {
        setOpenDropdownId(null);
      }
    };

    const handleResize = () => {
      if (openDropdownId) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [openDropdownId]);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <tr className="sticky top-0">
            {showDeleted && (
              <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20 w-16">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                />
              </th>
            )}
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">No</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Nama Prasarana</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Daya Tampung</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Luas Ruang (m²)</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Milik sendiri (M)/Sewa (W)</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Berlisensi (L)/Public Domain (P)/Tidak Berlisensi (T)</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Perangkat</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Link Bukti</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.length === 0 ? (
            <tr>
              <td 
                colSpan={showDeleted ? 10 : 9} 
                className="px-6 py-16 text-center text-slate-500 border border-slate-200"
              >
                <p className="font-medium">Data tidak ditemukan</p>
                <p className="text-sm">Belum ada data yang ditambahkan atau data yang cocok dengan filter.</p>
              </td>
            </tr>
          ) : (
            filteredRows.map((r, i) => (
              <tr
                key={r.id || i}
                className={`transition-colors ${
                  i % 2 === 0 ? "bg-white" : "bg-slate-50"
                } hover:bg-[#eaf4ff]`}
              >
                {showDeleted && (
                  <td className="px-4 py-3 text-center border border-slate-200">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(r.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows([...selectedRows, r.id]);
                        } else {
                          setSelectedRows(selectedRows.filter(id => id !== r.id));
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                    />
                  </td>
                )}
                <td className="px-4 py-3 text-center border border-slate-200 font-medium text-slate-800">{i + 1}</td>
                <td className="px-4 py-3 border border-slate-200 font-semibold text-slate-800">{r.nama_sarpras || "-"}</td>
                <td className="px-4 py-3 text-center border border-slate-200 text-slate-700">{r.daya_tampung || "-"}</td>
                <td className="px-4 py-3 text-center border border-slate-200 text-slate-700">{r.luas_ruang_m2 || "-"}</td>
                <td className="px-4 py-3 text-center border border-slate-200 text-slate-700">
                  {r.kepemilikan === "M" ? "Milik sendiri (M)" : r.kepemilikan === "W" ? "Sewa (W)" : "-"}
                </td>
                <td className="px-4 py-3 text-center border border-slate-200 text-slate-700">
                  {r.lisensi === "L" ? "Berlisensi (L)" : r.lisensi === "P" ? "Public Domain (P)" : r.lisensi === "T" ? "Tidak Berlisensi (T)" : "-"}
                </td>
                <td className="px-4 py-3 border border-slate-200 text-slate-700">
                  <div className="max-w-xs truncate" title={r.perangkat_detail || ""}>
                    {r.perangkat_detail || "-"}
                  </div>
                </td>
                <td className="px-4 py-3 border border-slate-200 text-slate-700">
                  {r.link_bukti ? (
                    <a 
                      href={r.link_bukti} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[#0384d6] underline hover:text-[#043975]"
                    >
                      Lihat Bukti
                    </a>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 border border-slate-200">
                  <div className="flex items-center justify-center dropdown-container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const rowId = getIdField(r) ? r[getIdField(r)] : r.id || i;
                        if (openDropdownId !== rowId) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const dropdownWidth = 192;
                          setDropdownPosition({
                            top: rect.bottom + 4,
                            left: Math.max(8, rect.right - dropdownWidth)
                          });
                          setOpenDropdownId(rowId);
                        } else {
                          setOpenDropdownId(null);
                        }
                      }}
                      className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-1"
                      aria-label="Menu aksi"
                      aria-expanded={openDropdownId === (getIdField(r) ? r[getIdField(r)] : r.id || i)}
                    >
                      <FiMoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Dropdown Menu - Fixed Position */}
      {openDropdownId !== null && (() => {
        const currentRow = filteredRows.find((r, idx) => {
          const rowId = getIdField(r) ? r[getIdField(r)] : r.id || idx;
          return rowId === openDropdownId;
        });
        if (!currentRow) return null;

        const isDeleted = currentRow.deleted_at;

        return (
          <div 
            className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100] overflow-hidden"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`
            }}
          >
            {!isDeleted && canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0384d6] hover:bg-[#eaf3ff] hover:text-[#043975] transition-colors text-left"
                aria-label={`Edit data ${currentRow.nama_sarpras || ''}`}
              >
                <FiEdit2 size={16} className="flex-shrink-0 text-[#0384d6]" />
                <span>Edit</span>
              </button>
            )}
            {!isDeleted && canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                aria-label={`Hapus data ${currentRow.nama_sarpras || ''}`}
              >
                <FiTrash2 size={16} className="flex-shrink-0 text-red-600" />
                <span>Hapus</span>
              </button>
            )}
            {isDeleted && canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors text-left"
                aria-label={`Pulihkan data ${currentRow.nama_sarpras || ''}`}
              >
                <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                <span>Pulihkan</span>
              </button>
            )}
            {isDeleted && canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onHardDelete(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors text-left font-medium"
                aria-label={`Hapus permanen data ${currentRow.nama_sarpras || ''}`}
              >
                <FiXCircle size={16} className="flex-shrink-0 text-red-700" />
                <span>Hapus Permanen</span>
              </button>
            )}
          </div>
        );
      })()}
    </div>
  );
}

/* ---------- Page Component ---------- */
export default function Tabel3A1({ auth, role }) {
  const { authUser: authUserFromContext } = useAuth();
  // auth sudah berisi authUser langsung dari c3.jsx (auth={authUser})
  const authUser = auth || authUserFromContext;
  const { maps: mapsFromHook } = useMaps(authUser || true);
  const maps = mapsFromHook ?? { units: {}, unit_kerja: {} };

  // Debug: Log authUser untuk melihat strukturnya
  useEffect(() => {
    if (authUser) {
      console.log("Tabel3A1 - authUser saat mount:", authUser);
      console.log("Tabel3A1 - authUser.id_unit_prodi:", authUser.id_unit_prodi);
      console.log("Tabel3A1 - authUser.id_unit:", authUser.id_unit);
      console.log("Tabel3A1 - authUser.unit:", authUser.unit);
      if (authUser.token) {
        try {
          const base64Url = authUser.token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decoded = JSON.parse(jsonPayload);
          console.log("Tabel3A1 - Decoded token:", decoded);
          console.log("Tabel3A1 - Decoded token id_unit_prodi:", decoded.id_unit_prodi);
        } catch (e) {
          console.error("Tabel3A1 - Gagal decode token:", e);
        }
      }
    }
  }, [authUser]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  // Modal state & editing row
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [modalOpen]);

  // Permission flags
  const canCreate = roleCan(role, TABLE_KEY, "C");
  const canUpdate = roleCan(role, TABLE_KEY, "U");
  const canDelete = roleCan(role, TABLE_KEY, "D");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url = ENDPOINT;
        if (showDeleted) {
          url += "?include_deleted=1";
        }
        const data = await apiFetch(url);
        setRows(Array.isArray(data) ? data : data?.items || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        Swal.fire({
          icon: 'error',
          title: 'Gagal memuat data',
          text: err.message || 'Terjadi kesalahan saat memuat data.'
        });
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    setSelectedRows([]);
  }, [showDeleted]);

  // Create / Update handler
  const handleSave = async (form) => {
    try {
      // Backend mengambil id_unit_prodi dari req.user (session/token), bukan dari payload
      // Jadi kita tidak perlu mengirim id_unit di payload
      // Tapi kita tetap perlu memastikan user memiliki id_unit_prodi untuk validasi di frontend
      
      if (!editingRow) {
        // Validasi: pastikan user memiliki id_unit_prodi
        let userUnit = authUser?.id_unit_prodi || authUser?.id_unit || authUser?.unit || authUser?.id_unit_kerja;
        
        // Jika masih tidak ada, coba decode dari token
        if (!userUnit && authUser?.token) {
          try {
            const base64Url = authUser.token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const decoded = JSON.parse(jsonPayload);
            userUnit = decoded?.id_unit_prodi || decoded?.id_unit || decoded?.id_unit_kerja;
          } catch (e) {
            console.error("Gagal decode token:", e);
          }
        }
        
        // Validasi: jika user tidak memiliki id_unit_prodi, tampilkan error
        if (!userUnit) {
          console.error("Tabel3A1 - User tidak memiliki id_unit_prodi:", {
            authUser,
            id_unit_prodi: authUser?.id_unit_prodi,
            id_unit: authUser?.id_unit,
            unit: authUser?.unit,
            id_unit_kerja: authUser?.id_unit_kerja
          });
          
          Swal.fire({
            icon: 'error',
            title: 'Unit/Prodi Tidak Ditemukan',
            html: `
              <p>Unit/Prodi tidak ditemukan dari data user Anda.</p>
              <p><strong>Solusi:</strong></p>
              <ol style="text-align: left; margin: 10px 0;">
                <li>Pastikan akun Anda memiliki Unit/Prodi di database</li>
                <li>Silakan <strong>logout</strong> dan <strong>login ulang</strong> untuk mendapatkan token baru</li>
                <li>Jika masih error, hubungi administrator untuk memastikan akun Anda memiliki Unit/Prodi</li>
              </ol>
            `,
            confirmButtonText: 'Mengerti'
          });
          return;
        }
      }

      // Backend mengambil id_unit_prodi dari req.user, jadi kita tidak perlu mengirimnya di payload
      // Hapus id_unit dari form jika ada, karena backend akan mengambilnya dari session
      const { id_unit, ...formWithoutIdUnit } = form;
      const payload = formWithoutIdUnit;

      if (editingRow) {
        await apiFetch(`${ENDPOINT}/${editingRow.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data sarana dan prasarana penelitian berhasil diperbarui.',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await apiFetch(ENDPOINT, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data sarana dan prasarana penelitian berhasil ditambahkan.',
          timer: 1500,
          showConfirmButton: false
        });
      }
      setModalOpen(false);
      setEditingRow(null);

      // Refresh data
      const url = showDeleted ? `${ENDPOINT}?include_deleted=1` : ENDPOINT;
      const data = await apiFetch(url);
      setRows(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      console.error("Save error:", err);
      Swal.fire({
        icon: 'error',
        title: `Gagal ${editingRow ? 'memperbarui' : 'menambah'} data`,
        text: err.message || 'Terjadi kesalahan saat menyimpan data.'
      });
    }
  };

  // Soft Delete handler
  const handleDelete = async (row) => {
    Swal.fire({
      title: 'Anda yakin?',
      text: `Data "${row.nama_sarpras}" akan dihapus (soft delete).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiFetch(`${ENDPOINT}/${row.id}`, { method: "DELETE" });
          
          // Refresh data
          const url = showDeleted ? `${ENDPOINT}?include_deleted=1` : ENDPOINT;
          const data = await apiFetch(url);
          setRows(Array.isArray(data) ? data : data?.items || []);

          Swal.fire('Dihapus!', 'Data telah dihapus (soft delete).', 'success');
        } catch (err) {
          console.error("Delete error:", err);
          Swal.fire('Gagal!', `Gagal menghapus data: ${err.message}`, 'error');
        }
      }
    });
  };

  // Hard Delete handler
  const handleHardDelete = async (row) => {
    Swal.fire({
      title: 'Hapus Permanen?',
      html: `Data "<strong>${row.nama_sarpras}</strong>" akan dihapus <strong style="color: red;">PERMANEN</strong>.<br/><br/>Data yang dihapus permanen <strong>TIDAK DAPAT dipulihkan</strong>!`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#7f1d1d',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus permanen!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiFetch(`${ENDPOINT}/${row.id}/hard`, { method: "DELETE" });
          
          // Refresh data
          const url = showDeleted ? `${ENDPOINT}?include_deleted=1` : ENDPOINT;
          const data = await apiFetch(url);
          setRows(Array.isArray(data) ? data : data?.items || []);

          Swal.fire('Dihapus Permanen!', 'Data telah dihapus secara permanen.', 'success');
        } catch (err) {
          console.error("Hard delete error:", err);
          Swal.fire('Gagal!', `Gagal menghapus permanen: ${err.message}`, 'error');
        }
      }
    });
  };

  // Restore handler
  const handleRestore = async (row) => {
    Swal.fire({
      title: 'Pulihkan Data?',
      text: `Data "${row.nama_sarpras}" akan dipulihkan.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, pulihkan!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Gunakan getIdField untuk mendapatkan ID yang benar
          const idField = getIdField(row);
          const rowId = idField ? row[idField] : row.id;
          
          if (!rowId) {
            throw new Error('ID data tidak valid. Silakan refresh halaman dan coba lagi.');
          }

          await apiFetch(`${ENDPOINT}/${rowId}/restore`, { method: "POST" });
          
          // Refresh data
          const url = showDeleted ? `${ENDPOINT}?include_deleted=1` : ENDPOINT;
          const data = await apiFetch(url);
          setRows(Array.isArray(data) ? data : data?.items || []);

          Swal.fire('Dipulihkan!', 'Data telah dipulihkan.', 'success');
        } catch (err) {
          console.error("Restore error:", err);
          const errorMessage = err.message || err.error || 'Terjadi kesalahan saat memulihkan data';
          Swal.fire('Gagal!', `Gagal memulihkan data: ${errorMessage}`, 'error');
        }
      }
    });
  };

  // Select all logic
  const filteredRows = rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at);
  const isAllSelected = filteredRows.length > 0 && selectedRows.length === filteredRows.length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allDeletedIds = filteredRows.map(r => r.id);
      setSelectedRows(allDeletedIds);
    } else {
      setSelectedRows([]);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl overflow-visible">
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola data sarana dan prasarana penelitian sesuai dengan format LKPS.
          </p>
          {!loading && (
            <span className="inline-flex items-center text-sm text-slate-700">
              Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{filteredRows.length}</span>
            </span>
          )}
        </div>
      </header>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-800">
            {filteredRows.length} baris
          </span>
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowDeleted(false)}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                !showDeleted
                  ? "bg-white text-[#0384d6] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              aria-label="Tampilkan data aktif"
            >
              Data
            </button>
            <button
              onClick={() => setShowDeleted(true)}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                showDeleted
                  ? "bg-white text-[#0384d6] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              aria-label="Tampilkan data terhapus"
            >
              Data Terhapus
            </button>
          </div>
          {canUpdate && showDeleted && selectedRows.length > 0 && (
            <button
              onClick={() => {
                // Bulk restore functionality bisa ditambahkan di sini jika diperlukan
                Swal.fire('Info', 'Fitur bulk restore akan segera ditambahkan.', 'info');
              }}
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={false}
            >
              Pulihkan ({selectedRows.length})
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          {canCreate && (
            <button
              onClick={() => { setModalOpen(true); setEditingRow(null); }}
              className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Tambah Data
            </button>
          )}
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-slate-500">Memuat data...</p>
        </div>
      )}

      {/* Data Table */}
      {!loading && (
        <DataTable
          rows={rows}
          maps={maps}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onEdit={(r) => { setEditingRow(r); setModalOpen(true); }}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onHardDelete={handleHardDelete}
          showDeleted={showDeleted}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          isAllSelected={isAllSelected}
          handleSelectAll={handleSelectAll}
        />
      )}

      {/* Keterangan sesuai LKPS */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-sm font-semibold text-yellow-800 mb-2">Keterangan:</h3>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>Prasarana diisi nama laboratorium</li>
          <li>Perangkat yang dimiliki diisi perangkat keras, perangkat lunak, bandwidth, device, tool dan lain-lain.</li>
        </ul>
      </div>

      {/* Modal */}
      <ModalForm
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingRow(null); }}
        onSave={handleSave}
        initialData={editingRow}
        maps={maps}
      />
    </div>
  );
}

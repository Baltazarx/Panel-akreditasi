// src/components/tables/Tabel1A5.jsx
import React, { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { useMaps } from "../../hooks/useMaps";
import { Badge, Card, EmptyState } from "../ui";

const ENDPOINT = "/api/kualifikasi-tendik";
const TABLE_KEY = "tabel_1a6_agregasi";
const LABEL = "1.A.5 Jumlah Tenaga Kependidikan dengan Pendidikan Terakhir";

const educationLevels = ["S3", "S2", "S1", "D4", "D3", "D2", "D1", "SMA/SMK/MA"];

function PrettyTable({ rows, maps }) {
  return (
    <Card>
      <div className="overflow-x-auto rounded-2xl">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0">
              <th className="px-4 py-3 text-left font-semibold border" rowSpan={2}>No.</th>
              <th className="px-4 py-3 text-left font-semibold border" rowSpan={2}>Jenis Tenaga Kependidikan</th>
              <th colSpan={educationLevels.length} className="px-4 py-3 text-center font-semibold border">Jumlah Tenaga Kependidikan dengan Pendidikan Terakhir</th>
              <th className="px-4 py-3 text-left font-semibold border" rowSpan={2}>Unit Kerja</th>
              
            </tr>
            <tr className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0">
              {educationLevels.map((level) => (
                <th key={level} className="px-4 py-2 text-left font-semibold border">{level}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                className="odd:bg-white even:bg-gray-50 dark:odd:bg-white/5 dark:even:bg-white/10 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition"
              >
                <td className="px-4 py-3 align-middle border">{i + 1}.</td>
                <td className="px-4 py-3 align-middle border">{r.jenis_tendik}</td>
                {educationLevels.map((level) => (
                  <td key={level} className="px-4 py-3 align-middle border">{r[level] || 0}</td>
                ))}
                <td className="px-4 py-3 align-middle border">{r.unit_kerja}</td>
                
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td className="px-4" colSpan={educationLevels.length + 2}>
                  <EmptyState />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function Tabel1A5({ role }) {
  const { maps } = useMaps(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchRows() {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch(ENDPOINT);
      setRows(Array.isArray(data) ? data : data?.items || []);
    } catch (e) {
      setError(e?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight">{LABEL}</h3>
        <div className="flex items-center gap-2 text-sm">
          <Badge>{rows.length} baris</Badge>
        </div>
      </div>

      {error && (
        <Card className="p-3 text-red-700 dark:text-red-400 bg-red-50/80 dark:bg-red-500/10 border-red-200/60 dark:border-red-500/30">
          {error}
        </Card>
      )}

      <PrettyTable rows={rows} maps={maps} />
    </div>
  );
}

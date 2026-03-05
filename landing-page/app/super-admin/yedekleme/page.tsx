"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Download,
  RotateCcw,
  Trash2,
  Plus,
  Loader2,
  Search,
  Filter,
  School,
  Clock,
  HardDrive,
} from "lucide-react";
import { adminApi } from "@/lib/api";

interface Backup {
  id: string;
  filename: string;
  size: number;
  schoolId: string;
  type: "MANUAL" | "AUTO" | "GRADE_PROMOTION";
  note: string | null;
  createdAt: string;
  school?: { id: string; name: string; code: string };
}

interface SchoolOption {
  id: string;
  name: string;
  code: string;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  MANUAL: { label: "Manuel", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  AUTO: { label: "Otomatik", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  GRADE_PROMOTION: { label: "Sınıf Atlama", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function BackupManagementPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [search, setSearch] = useState("");
  const [backupNote, setBackupNote] = useState("");
  const [showNewBackup, setShowNewBackup] = useState(false);
  const [newBackupSchoolId, setNewBackupSchoolId] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [backupsData, schoolsData] = await Promise.all([
        adminApi.getAllBackups(),
        adminApi.getSchools(),
      ]);
      setBackups(Array.isArray(backupsData) ? backupsData : []);
      const schoolList = Array.isArray(schoolsData)
        ? schoolsData
        : schoolsData?.schools || [];
      setSchools(schoolList.map((s: any) => ({ id: s.id, name: s.name, code: s.code })));
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!newBackupSchoolId) return;
    setActionLoading("create");
    try {
      await adminApi.createSchoolBackup(newBackupSchoolId, backupNote || undefined);
      setShowNewBackup(false);
      setBackupNote("");
      setNewBackupSchoolId("");
      await fetchData();
    } catch (error) {
      console.error("Backup error:", error);
      alert("Yedekleme oluşturulurken hata oluştu");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = async (backup: Backup) => {
    setActionLoading(backup.id);
    try {
      const data = await adminApi.downloadBackup(backup.schoolId, backup.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = backup.filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("İndirme sırasında hata oluştu");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = (backup: Backup) => {
    const schoolName = backup.school?.name || "Bilinmeyen Okul";
    setConfirmDialog({
      open: true,
      title: "Yedek Geri Yükleme",
      message: `"${schoolName}" için ${new Date(backup.createdAt).toLocaleString("tr-TR")} tarihli yedeği geri yüklemek istediğinize emin misiniz?\n\nDİKKAT: Bu işlem mevcut tüm okul verilerini silip yedeğe geri döndürecektir!`,
      onConfirm: async () => {
        setConfirmDialog(null);
        setActionLoading(backup.id);
        try {
          await adminApi.restoreBackup(backup.schoolId, backup.id);
          alert("Geri yükleme başarıyla tamamlandı");
        } catch (error) {
          console.error("Restore error:", error);
          alert("Geri yükleme sırasında hata oluştu");
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleDelete = (backup: Backup) => {
    setConfirmDialog({
      open: true,
      title: "Yedek Silme",
      message: `${new Date(backup.createdAt).toLocaleString("tr-TR")} tarihli yedeği silmek istediğinize emin misiniz?`,
      onConfirm: async () => {
        setConfirmDialog(null);
        setActionLoading(backup.id);
        try {
          await adminApi.deleteBackup(backup.schoolId, backup.id);
          await fetchData();
        } catch (error) {
          console.error("Delete error:", error);
          alert("Silme sırasında hata oluştu");
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  // Filter backups
  const filtered = backups.filter((b) => {
    if (selectedSchool && b.schoolId !== selectedSchool) return false;
    if (selectedType && b.type !== selectedType) return false;
    if (search) {
      const q = search.toLowerCase();
      const schoolName = b.school?.name?.toLowerCase() || "";
      const schoolCode = b.school?.code?.toLowerCase() || "";
      if (!schoolName.includes(q) && !schoolCode.includes(q) && !b.filename.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Stats
  const totalSize = backups.reduce((a, b) => a + b.size, 0);
  const manualCount = backups.filter((b) => b.type === "MANUAL").length;
  const autoCount = backups.filter((b) => b.type === "AUTO").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Yedekleme Yönetimi</h1>
          <p className="text-sm text-slate-500 mt-1">Tüm okulların yedeklerini yönetin</p>
        </div>
        <Button
          className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
          onClick={() => setShowNewBackup(true)}
        >
          <Plus className="h-4 w-4" />
          Yeni Yedek Oluştur
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{backups.length}</p>
              <p className="text-xs text-slate-500">Toplam Yedek</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <HardDrive className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatSize(totalSize)}</p>
              <p className="text-xs text-slate-500">Toplam Boyut</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{autoCount}</p>
              <p className="text-xs text-slate-500">Otomatik Yedek</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <School className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{manualCount}</p>
              <p className="text-xs text-slate-500">Manuel Yedek</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Backup Dialog */}
      {showNewBackup && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-base">Yeni Yedek Oluştur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Okul Seçin
              </label>
              <select
                value={newBackupSchoolId}
                onChange={(e) => setNewBackupSchoolId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              >
                <option value="">Okul seçin...</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Not (İsteğe Bağlı)
              </label>
              <input
                type="text"
                value={backupNote}
                onChange={(e) => setBackupNote(e.target.value)}
                placeholder="Yedek hakkında kısa not..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
                onClick={handleCreateBackup}
                disabled={!newBackupSchoolId || actionLoading === "create"}
              >
                {actionLoading === "create" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                Yedek Oluştur
              </Button>
              <Button variant="outline" onClick={() => { setShowNewBackup(false); setBackupNote(""); setNewBackupSchoolId(""); }}>
                İptal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Okul adı veya kodu ile ara..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            >
              <option value="">Tüm Okullar</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            >
              <option value="">Tüm Türler</option>
              <option value="MANUAL">Manuel</option>
              <option value="AUTO">Otomatik</option>
              <option value="GRADE_PROMOTION">Sınıf Atlama</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Backup List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Yedekler ({filtered.length})
            </CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-blue-600" onClick={fetchData}>
              <RotateCcw className="h-3.5 w-3.5" />
              Yenile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Henüz yedek bulunmuyor.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Okul</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Tarih</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Tür</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Boyut</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Not</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-400">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((backup) => {
                    const typeInfo = typeLabels[backup.type] || typeLabels.MANUAL;
                    return (
                      <tr key={backup.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {backup.school?.name || "—"}
                          </div>
                          <div className="text-xs text-slate-400">{backup.school?.code || "—"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-700 dark:text-slate-300">
                            {new Date(backup.createdAt).toLocaleDateString("tr-TR")}
                          </div>
                          <div className="text-xs text-slate-400">
                            {new Date(backup.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {formatSize(backup.size)}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs max-w-[200px] truncate">
                          {backup.note || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="İndir"
                              onClick={() => handleDownload(backup)}
                              disabled={actionLoading === backup.id}
                            >
                              {actionLoading === backup.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                              title="Geri Yükle"
                              onClick={() => handleRestore(backup)}
                              disabled={actionLoading === backup.id}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Sil"
                              onClick={() => handleDelete(backup)}
                              disabled={actionLoading === backup.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bilgi */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Yedekleme Politikası</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>• <strong>Manuel yedekler:</strong> Her okul için en fazla 10 adet saklanır. Limit aşıldığında en eski silinir.</li>
            <li>• <strong>Otomatik yedekler:</strong> Her gün saat 03:00&apos;te tüm okullar için alınır. 3 günden eski olanlar otomatik silinir.</li>
            <li>• <strong>Sınıf atlama yedekleri:</strong> Sınıf atlama işlemi öncesi otomatik alınır, limit yoktur.</li>
            <li>• <strong>Geri yükleme:</strong> Sadece aynı okula ait yedekler geri yüklenebilir.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      {confirmDialog?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{confirmDialog.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line mb-6">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmDialog(null)}>
                İptal
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDialog.onConfirm}>
                Onayla
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

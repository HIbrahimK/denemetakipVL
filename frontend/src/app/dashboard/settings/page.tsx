"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import {
    Settings as SettingsIcon,
    Upload,
    Save,
    RotateCcw,
    Database,
    List,
    Download,
    ArrowUpCircle,
} from "lucide-react";

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [school, setSchool] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        website: "",
        address: "",
        phone: "",
        isParentLoginActive: true,
        studentLoginType: "studentNumber",
    });
    const [backups, setBackups] = useState<any[]>([]);

    const fetchBackups = async () => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        try {
            const res = await fetch(`http://localhost:3001/schools/${user.schoolId}/backups`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            setBackups(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSchool = async () => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.schoolId) return;

        try {
            const res = await fetch(`http://localhost:3001/schools/${user.schoolId}`);
            const data = await res.json();
            setSchool(data);
            setFormData({
                name: data.name || "",
                website: data.website || "",
                address: data.address || "",
                phone: data.phone || "",
                isParentLoginActive: data.isParentLoginActive ?? true,
                studentLoginType: data.studentLoginType || "studentNumber",
            });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchSchool();
        fetchBackups();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        try {
            const res = await fetch(`http://localhost:3001/schools/${user.schoolId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const updated = await res.json();
                setSchool(updated);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePromote = async () => {
        if (!confirm("Tüm öğrencilerin sınıf seviyesini bir üst seviyeye taşımak istediğinize emin misiniz?")) return;

        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        try {
            const res = await fetch(`http://localhost:3001/schools/${user.schoolId}/promote`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            alert(data.message);
        } catch (error) {
            console.error(error);
        }
    };

    const handleBackup = async () => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        try {
            const res = await fetch(`http://localhost:3001/schools/${user.schoolId}/backup`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            alert(data.message);
            fetchBackups();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDownload = async (backupId: string) => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        try {
            const res = await fetch(`http://localhost:3001/schools/${user.schoolId}/backups/${backupId}/download`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const backup = await res.json();

            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = backup.filename;
            a.click();
        } catch (error) {
            console.error(error);
        }
    };

    const handleRestore = async (backupId: string) => {
        if (!confirm("Bu yedeği geri yüklemek istediğinize emin misiniz? Mevcut verilerin üzerine yazılabilir.")) return;

        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        try {
            const res = await fetch(`http://localhost:3001/schools/${user.schoolId}/restore`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ backupId }),
            });
            const data = await res.json();
            alert(data.message);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <SettingsIcon className="h-8 w-8 text-indigo-600" />
                        Okul Ayarları
                    </h2>
                    <p className="text-slate-500">Okul bilgilerini ve sistem parametrelerini buradan yönetin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sol Taraf: Okul Ayarları */}
                <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-lg rounded-xl overflow-hidden">
                    <CardHeader className="bg-[#17a2b8] text-white py-4">
                        <CardTitle className="text-lg font-semibold uppercase tracking-wider">Okul Ayarları</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-8">
                        <form onSubmit={handleSave} className="space-y-6">
                            {/* Logo Yükleme */}
                            <div className="flex flex-col items-start gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-24 w-24 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-2">
                                        {school?.logoUrl ? (
                                            <img src={school.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                                        ) : (
                                            <img src="https://api.dicebear.com/7.x/initials/svg?seed=School" alt="Default Logo" className="opacity-20" />
                                        )}
                                    </div>
                                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Okul Logosunu Yükleyin:</Label>
                                </div>
                                <div className="flex w-full">
                                    <div className="flex-1 border border-slate-200 dark:border-slate-700 rounded-l-md px-3 py-2 text-sm text-slate-500 bg-white dark:bg-slate-950">
                                        Dosya Seçin
                                    </div>
                                    <Button type="button" variant="secondary" className="rounded-l-none rounded-r-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-l-0 border-slate-200 dark:border-slate-700">
                                        Browse
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="school-name" className="font-bold text-slate-900 dark:text-slate-100">Okul Adı:</Label>
                                    <Input
                                        id="school-name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="h-11 border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-[#17a2b8]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="school-website" className="font-bold text-slate-900 dark:text-slate-100">Okul İnternet Sitesi Adresi:</Label>
                                    <Input
                                        id="school-website"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="h-11 border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-[#17a2b8]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="school-address" className="font-bold text-slate-900 dark:text-slate-100">Okul Adresi:</Label>
                                    <Input
                                        id="school-address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="h-11 border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-[#17a2b8]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="school-phone" className="font-bold text-slate-900 dark:text-slate-100">Okul Telefon No:</Label>
                                    <Input
                                        id="school-phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="h-11 border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-[#17a2b8]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-4">
                                <div className="flex items-center gap-4">
                                    <Label className="font-bold text-slate-700 dark:text-slate-300 min-w-[100px]">Veli Girişi</Label>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="p-login"
                                            checked={formData.isParentLoginActive}
                                            onCheckedChange={(checked: boolean) => setFormData({ ...formData, isParentLoginActive: checked })}
                                        />
                                        <Label htmlFor="p-login" className="font-medium cursor-pointer">Aktif</Label>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <Label className="font-bold text-slate-700 dark:text-slate-300 min-w-[100px]">Öğrenci Giriş Seçenekleri</Label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="loginType"
                                                value="studentNumber"
                                                checked={formData.studentLoginType === "studentNumber"}
                                                onChange={(e) => setFormData({ ...formData, studentLoginType: e.target.value })}
                                                className="accent-[#17a2b8] h-4 w-4"
                                            />
                                            <span className="text-sm font-medium">Okul No</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="loginType"
                                                value="tcNo"
                                                checked={formData.studentLoginType === "tcNo"}
                                                onChange={(e) => setFormData({ ...formData, studentLoginType: e.target.value })}
                                                className="accent-[#17a2b8] h-4 w-4"
                                            />
                                            <span className="text-sm font-medium">TC Kimlik No</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <Button disabled={loading} className="w-24 bg-[#28a745] hover:bg-[#218838] text-white font-semibold rounded-md border-none h-10">
                                Kaydet
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Sağ Taraf: Sistem İşlemleri */}
                <div className="space-y-8">
                    {/* Sınıf Atlatma */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-lg rounded-xl overflow-hidden">
                        <CardHeader className="bg-[#17a2b8] text-white py-3">
                            <CardTitle className="text-md font-medium">Sınıf Atlatma</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Button className="w-full bg-[#dc3545] hover:bg-[#c82333] text-white font-medium h-12 rounded-md gap-2" onClick={handlePromote}>
                                <ArrowUpCircle className="h-5 w-5" />
                                Sınıf Atlama İşlemi
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Veri Yedekleme */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-lg rounded-xl overflow-hidden">
                        <CardHeader className="bg-[#17a2b8] text-white py-3">
                            <CardTitle className="text-md font-medium text-center sm:text-left">Veri Yedekleme</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <Button className="w-full bg-[#ffc107] hover:bg-[#e0a800] text-slate-900 font-bold h-10 rounded-md gap-2 shadow-sm" onClick={handleBackup}>
                                <Database className="h-4 w-4" />
                                Tüm Verileri Yedekle
                            </Button>

                            <div className="pt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="font-bold text-slate-800 dark:text-slate-200 text-sm">Alınan Yedekler</Label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-[#007bff] hover:text-[#0056b3] gap-1 font-semibold"
                                        onClick={fetchBackups}
                                    >
                                        <RotateCcw className="h-3.5 w-3.5" />
                                        Yenile
                                    </Button>
                                </div>

                                <div className="border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden bg-white dark:bg-slate-950">
                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-bold text-slate-600 dark:text-slate-400">Tarih</th>
                                                    <th className="px-3 py-2 text-right font-bold text-slate-600 dark:text-slate-400">İşlem</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {backups.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={2} className="px-3 py-8 text-center text-slate-400">
                                                            Henüz yedek bulunmuyor.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    backups.map((b) => (
                                                        <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                            <td className="px-3 py-2">
                                                                <div className="font-medium text-slate-700 dark:text-slate-300">
                                                                    {new Date(b.createdAt).toLocaleDateString('tr-TR')}
                                                                </div>
                                                                <div className="text-[10px] text-slate-400">
                                                                    {new Date(b.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-2 text-right">
                                                                <div className="flex justify-end gap-1">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                                        title="İndir"
                                                                        onClick={() => handleDownload(b.id)}
                                                                    >
                                                                        <Download className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                                        title="Geri Yükle"
                                                                        onClick={() => handleRestore(b.id)}
                                                                    >
                                                                        <RotateCcw className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

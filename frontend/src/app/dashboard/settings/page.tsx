"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { API_BASE_URL } from "@/lib/auth";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Settings as SettingsIcon,
    Upload,
    Save,
    RotateCcw,
    Database,
    List,
    Download,
    ArrowUpCircle,
    Image as ImageIcon,
    Loader2,
    Trash2,
    FileUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSchool } from "@/contexts/school-context";

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
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
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
    }>({
        open: false,
        title: "",
        description: "",
        onConfirm: () => {},
    });
    const { toast } = useToast();
    const { refreshSchoolData } = useSchool();

    const fetchBackups = async () => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        try {
            const res = await fetch(`${API_BASE_URL}/schools/${user.schoolId}/backups`, {
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
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/schools/${user.schoolId}`, {
                headers: {
                }
            });
            if (!res.ok) {
                throw new Error('Failed to fetch school data');
            }
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

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Hata",
                description: "L�tfen bir resim dosyas� se�in.",
                variant: "destructive"
            });
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "Hata",
                description: "Dosya boyutu 5MB'dan k���k olmal�d�r.",
                variant: "destructive"
            });
            return;
        }

        setUploadingLogo(true);
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        try {
            // Resize and compress image before upload
            const img = new Image();
            const reader = new FileReader();
            
            reader.onload = (e) => {
                img.src = e.target?.result as string;
            };

            img.onload = async () => {
                // Create canvas to resize image
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    toast({
                        title: "Hata",
                        description: "Canvas olu�turulamad�.",
                        variant: "destructive"
                    });
                    setUploadingLogo(false);
                    return;
                }

                // Calculate new dimensions (max 512x512)
                let width = img.width;
                let height = img.height;
                const maxSize = 512;

                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to base64 with compression
                const base64 = canvas.toDataURL('image/jpeg', 0.85);

                const res = await fetch(`${API_BASE_URL}/schools/${user.schoolId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ logoUrl: base64 }),
                });

                if (res.ok) {
                    const updated = await res.json();
                    setSchool(updated);
                    
                    // Update localStorage to refresh logo in dashboard
                    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
                    storedUser.school = { logoUrl: base64, name: updated.name };
                    localStorage.setItem("user", JSON.stringify(storedUser));
                    
                    // Trigger school data refresh
                    refreshSchoolData();
                    
                    toast({
                        title: "Ba�ar�l�",
                        description: "Logo ba�ar�yla g�ncellendi.",
                    });
                } else {
                    toast({
                        title: "Hata",
                        description: "Logo y�klenirken bir hata olu�tu.",
                        variant: "destructive"
                    });
                }
                setUploadingLogo(false);
            };

            reader.readAsDataURL(file);
        } catch (error) {
            console.error(error);
            toast({
                title: "Hata",
                description: "Logo y�klenirken bir hata olu�tu.",
                variant: "destructive"
            });
            setUploadingLogo(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        try {
            const res = await fetch(`${API_BASE_URL}/schools/${user.schoolId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const updated = await res.json();
                setSchool(updated);
                
                // Update user school name in localStorage
                const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
                storedUser.school = { ...storedUser.school, name: updated.name };
                localStorage.setItem("user", JSON.stringify(storedUser));
                
                // Trigger school data refresh
                refreshSchoolData();
                
                toast({
                    title: "Ba�ar�l�",
                    description: "Ayarlar ba�ar�yla kaydedildi.",
                });
            } else {
                toast({
                    title: "Hata",
                    description: "Ayarlar kaydedilirken bir hata olu�tu.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Hata",
                description: "Ayarlar kaydedilirken bir hata olu�tu.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePromote = async () => {
        setConfirmDialog({
            open: true,
            title: "S�n�f Atlama Onayla",
            description: "T�m ��rencilerin s�n�f seviyesini bir �st seviyeye ta��mak istedi�inize emin misiniz?",
            onConfirm: async () => {
                const token = localStorage.getItem("token");
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                try {
                    const res = await fetch(`${API_BASE_URL}/schools/${user.schoolId}/promote`, {
                        method: "POST",
                    });
                    const data = await res.json();
                    toast({
                        title: "Ba�ar�l�",
                        description: data.message,
                    });
                } catch (error) {
                    console.error(error);
                    toast({
                        title: "Hata",
                        description: "S�n�f atlama i�lemi s�ras�nda bir hata olu�tu.",
                        variant: "destructive"
                    });
                }
                setConfirmDialog({ ...confirmDialog, open: false });
            }
        });
    };

    const handleBackup = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        try {
            const res = await fetch(`${API_BASE_URL}/schools/${user.schoolId}/backup`, {
                method: "POST",
            });
            const data = await res.json();
            toast({
                title: "Ba�ar�l�",
                description: data.message || "Yedek ba�ar�yla olu�turuldu.",
            });
            fetchBackups();
        } catch (error) {
            console.error(error);
            toast({
                title: "Hata",
                description: "Yedekleme s�ras�nda bir hata olu�tu.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (backupId: string) => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        try {
            const res = await fetch(`${API_BASE_URL}/schools/${user.schoolId}/backups/${backupId}/download`, {
            });
            const backup = await res.json();

            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = backup.filename;
            a.click();
            
            toast({
                title: "Ba�ar�l�",
                description: "Yedek dosyas� indiriliyor.",
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Hata",
                description: "Yedek indirilemedi.",
                variant: "destructive"
            });
        }
    };

    const handleRestore = async (backupId: string) => {
        setConfirmDialog({
            open: true,
            title: "Geri Y�kleme Onayla",
            description: "Bu yede�i geri y�klemek istedi�inize emin misiniz? Mevcut verilerin �zerine yaz�labilir.",
            onConfirm: async () => {
                const token = localStorage.getItem("token");
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                try {
                    const res = await fetch(`${API_BASE_URL}/schools/${user.schoolId}/restore`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ backupId }),
                    });
                    const data = await res.json();
                    toast({
                        title: "Ba�ar�l�",
                        description: data.message || "Geri y�kleme i�lemi ba�lat�ld�.",
                    });
                } catch (error) {
                    console.error(error);
                    toast({
                        title: "Hata",
                        description: "Geri y�kleme s�ras�nda bir hata olu�tu.",
                        variant: "destructive"
                    });
                }
                setConfirmDialog({ ...confirmDialog, open: false });
            }
        });
    };

    const handleDeleteBackup = async (backupId: string) => {
        setConfirmDialog({
            open: true,
            title: "Yede�i Sil",
            description: "Bu yede�i silmek istedi�inize emin misiniz?",
            onConfirm: async () => {
                const token = localStorage.getItem("token");
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                try {
                    const res = await fetch(`${API_BASE_URL}/schools/${user.schoolId}/backups/${backupId}`, {
                        method: "DELETE",
                    });
                    const data = await res.json();
                    toast({
                        title: "Ba�ar�l�",
                        description: data.message || "Yedek ba�ar�yla silindi.",
                    });
                    fetchBackups();
                } catch (error) {
                    console.error(error);
                    toast({
                        title: "Hata",
                        description: "Yedek silinemedi.",
                        variant: "destructive"
                    });
                }
                setConfirmDialog({ ...confirmDialog, open: false });
            }
        });
    };

    const handleRestoreFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file type
        if (!file.name.endsWith('.json')) {
            toast({
                title: "Hata",
                description: "L�tfen bir JSON yedek dosyas� se�in.",
                variant: "destructive"
            });
            return;
        }

        setConfirmDialog({
            open: true,
            title: "Dosyadan Geri Y�kleme Onayla",
            description: "Bu yedek dosyas�n� geri y�klemek istedi�inize emin misiniz? Mevcut verilerin �zerine yaz�labilir.",
            onConfirm: async () => {
                setLoading(true);
                const token = localStorage.getItem("token");
                const user = JSON.parse(localStorage.getItem("user") || "{}");

                try {
                    // Read file content
                    const fileContent = await file.text();
                    const backupData = JSON.parse(fileContent);

                    const res = await fetch(`${API_BASE_URL}/schools/${user.schoolId}/restore-from-file`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ backupData }),
                    });

                    if (!res.ok) {
                        throw new Error('Geri y�kleme ba�ar�s�z');
                    }

                    const data = await res.json();
                    toast({
                        title: "Ba�ar�l�",
                        description: data.message || "Dosyadan geri y�kleme i�lemi ba�lat�ld�.",
                    });

                    // Reset file input
                    e.target.value = '';
                } catch (error) {
                    console.error(error);
                    toast({
                        title: "Hata",
                        description: error instanceof Error ? error.message : "Dosya y�klenirken bir hata olu�tu.",
                        variant: "destructive"
                    });
                    e.target.value = '';
                } finally {
                    setLoading(false);
                }
                setConfirmDialog({ ...confirmDialog, open: false });
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <SettingsIcon className="h-8 w-8 text-indigo-600" />
                        Okul Ayarlar�
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Okul bilgilerini ve sistem parametrelerini buradan y�netin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sol Taraf: Okul Ayarlar� */}
                <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                        <CardTitle className="text-lg font-semibold">Okul Bilgileri</CardTitle>
                        <CardDescription>Okul bilgilerini ve giri� ayarlar�n� d�zenleyin</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <form onSubmit={handleSave} className="space-y-6">
                            {/* Logo Y�kleme */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Okul Logosu</Label>
                                <div className="flex items-center gap-6">
                                    <div className="relative h-24 w-24 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
                                        {uploadingLogo ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                        ) : school?.logoUrl ? (
                                            <img src={school.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain p-2" />
                                        ) : (
                                            <ImageIcon className="h-10 w-10 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Logo y�kleyin (PNG, JPG, max 2MB)</p>
                                        <label className="inline-block">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                disabled={uploadingLogo}
                                                className="hidden"
                                                id="logo-upload"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={uploadingLogo}
                                                onClick={() => document.getElementById('logo-upload')?.click()}
                                                className="gap-2"
                                            >
                                                <Upload className="h-4 w-4" />
                                                Logo Y�kle
                                            </Button>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="school-name" className="font-bold text-slate-900 dark:text-slate-100">Okul Ad�:</Label>
                                    <Input
                                        id="school-name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="h-11 border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-[#17a2b8]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="school-website" className="font-bold text-slate-900 dark:text-slate-100">Okul �nternet Sitesi Adresi:</Label>
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
                                    <Label className="font-bold text-slate-700 dark:text-slate-300 min-w-[100px]">Veli Giri�i</Label>
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
                                    <Label className="font-bold text-slate-700 dark:text-slate-300 min-w-[100px]">��renci Giri� Se�enekleri</Label>
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

                            <div className="flex justify-end pt-4">
                                <Button disabled={loading} type="submit" className="px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg h-11 shadow-md gap-2">
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Kaydediliyor...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Ayarlar� Kaydet
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Sa� Taraf: Sistem ��lemleri */}
                <div className="space-y-6">
                    {/* S�n�f Atlatma */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                            <CardTitle className="text-base font-semibold">S�n�f Atlatma</CardTitle>
                            <CardDescription className="text-xs">T�m ��rencileri bir �st s�n�fa ta��</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium h-11 rounded-lg gap-2 shadow-sm" onClick={handlePromote} disabled>
                                <ArrowUpCircle className="h-5 w-5" />
                                S�n�f Atlama ��lemi
                            </Button>
                            <p className="text-xs text-slate-500 mt-2 text-center">Yak�nda aktif olacak</p>
                        </CardContent>
                    </Card>

                    {/* Veri Yedekleme */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                            <CardTitle className="text-base font-semibold">Veri Yedekleme</CardTitle>
                            <CardDescription className="text-xs">Sistem verilerini yedekle ve geri y�kle</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <Button 
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium h-11 rounded-lg gap-2 shadow-sm" 
                                onClick={handleBackup} 
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Yedekleniyor...
                                    </>
                                ) : (
                                    <>
                                        <Database className="h-4 w-4" />
                                        Yedek Olu�tur
                                    </>
                                )}
                            </Button>

                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleRestoreFromFile}
                                    disabled={loading}
                                    className="hidden"
                                    id="restore-file-upload"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={loading}
                                    onClick={() => document.getElementById('restore-file-upload')?.click()}
                                    className="w-full h-11 gap-2 border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                                >
                                    <FileUp className="h-4 w-4" />
                                    Dosyadan Geri Y�kle
                                </Button>
                            </div>

                            <div className="pt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Al�nan Yedekler</Label>
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
                                                    <th className="px-3 py-2 text-right font-bold text-slate-600 dark:text-slate-400">��lem</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {backups.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={2} className="px-3 py-8 text-center text-slate-400">
                                                            Hen�z yedek bulunmuyor.
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
                                                                        title="�ndir"
                                                                        onClick={() => handleDownload(b.id)}
                                                                    >
                                                                        <Download className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                                        title="Geri Y�kle"
                                                                        onClick={() => handleRestore(b.id)}
                                                                    >
                                                                        <RotateCcw className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                        title="Sil"
                                                                        onClick={() => handleDeleteBackup(b.id)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
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

            {/* Confirmation Dialog */}
            <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmDialog.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
                            �ptal
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDialog.onConfirm}>
                            Onayla
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

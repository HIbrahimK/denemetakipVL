"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { API_BASE_URL } from '@/lib/auth';

export function ImportStudentsModal({ open, onOpenChange, onSuccess }: any) {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [results, setResults] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${API_BASE_URL}/students/import`, {
                method: "POST",
                headers: {
                },
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setResults(data);
                if (data.success > 0) onSuccess();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setFile(null);
        setResults(null);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Excel'den Toplu Öğrenci Yükle</DialogTitle>
                </DialogHeader>

                {!results ? (
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl">
                            <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4" />
                                Önemli Not
                            </h4>
                            <p className="text-xs text-amber-700 dark:text-amber-500 leading-normal">
                                Lütfen size verilen şablonu kullanın. Sütunların sırası: Adı, Soyadı, Okul No, Sınıf, Şube, Şifre şeklinde olmalıdır.
                            </p>
                            <a
                                href="/dosyalar/OgrenciSablon.xlsx"
                                download
                                className="inline-flex mt-3 text-xs font-semibold text-amber-900 dark:text-amber-300 underline underline-offset-2"
                            >
                                Öğrenci Şablonunu İndir
                            </a>
                        </div>

                        <div className="space-y-4">
                            <Label htmlFor="file" className="text-center block p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                                        <Upload className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <span className="font-medium">{file ? file.name : "Dosya Seçin"}</span>
                                    <span className="text-xs text-slate-400">Excel dosyası (.xlsx, .xls)</span>
                                </div>
                                <Input
                                    id="file"
                                    type="file"
                                    accept=".xlsx, .xls"
                                    className="hidden"
                                    disabled={loading}
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                            </Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleClose}>İptal</Button>
                            <Button type="submit" disabled={!file || loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                {loading ? "Yükleniyor..." : "Yüklemeyi Başlat"}
                            </Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <div className="py-6 space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                            <div>
                                <h4 className="font-bold text-emerald-800 dark:text-emerald-400">Yükleme Tamamlandı</h4>
                                <p className="text-sm text-emerald-700 dark:text-emerald-500">
                                    {results.success} öğrenci başarıyla eklendi.
                                </p>
                            </div>
                        </div>

                        {results.failed > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-red-600 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    Hatalar ({results.failed})
                                </h4>
                                <div className="max-h-40 overflow-y-auto rounded-lg border border-red-100 bg-red-50/50 p-2 text-xs text-red-700 space-y-1">
                                    {results.errors.map((err: string, idx: number) => (
                                        <div key={idx}>{err}</div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button onClick={handleClose} className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
                                Kapat
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

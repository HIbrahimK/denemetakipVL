"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, FileSpreadsheet, Info, Loader2, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function ImportWizard() {
    const searchParams = useSearchParams();
    const examId = searchParams.get("examId");
    const [exam, setExam] = useState<any>(null);
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [importData, setImportData] = useState<any[]>([]);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (examId) {
            fetch(`http://localhost:3001/exams/${examId}`)
                .then(res => res.json())
                .then(data => setExam(data))
                .catch(err => console.error("Failed to fetch exam", err));
        }
    }, [examId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null); // Reset error when new file is selected
        }
    };

    const startUpload = async () => {
        if (!file || !examId) return;

        setUploading(true);
        setIsValidating(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("examId", examId);
        formData.append("examType", exam?.type || "TYT");

        try {
            const response = await fetch(`http://localhost:3001/import/validate?schoolId=clxxxx`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                // Add selected property based on validity
                setImportData(data.map((r: any) => ({
                    ...r,
                    selected: r.isValid
                })));
                setStep(2);
                setError(null);
            } else {
                // Extract error message from response
                const errorData = await response.json().catch(() => ({ message: 'Bilinmeyen hata' }));
                const errorMessage = errorData.message || errorData.error || `Doğrulama başarısız (HTTP ${response.status})`;
                console.error("Validation failed:", errorMessage);
                setError(errorMessage);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Bağlantı hatası';
            console.error("Upload error:", errorMessage, error);
            setError(`Upload hatası: ${errorMessage}`);
        } finally {
            setUploading(false);
            setIsValidating(false);
        }
    };

    const handleConfirm = async () => {
        if (!importData.length || !examId) return;

        setUploading(true);
        try {
            const response = await fetch(`http://localhost:3001/import/confirm?schoolId=clxxxx`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data: importData,
                    examId,
                    examType: exam?.type
                }),
            });

            if (response.ok) {
                setStep(3);
            }
        } catch (error) {
            console.error("Confirm error:", error);
        } finally {
            setUploading(false);
        }
    };

    const updateStudentNumber = (index: number, value: string) => {
        const newData = [...importData];
        newData[index].studentNumber = value;
        newData[index].isValid = value && value !== '0' && value !== '*';
        setImportData(newData);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto border-none shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between mb-2">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                            </div>
                            {s < 3 && <div className={`h-1 w-12 mx-2 ${step > s ? 'bg-indigo-600' : 'bg-slate-100'}`} />}
                        </div>
                    ))}
                </div>
                <CardTitle>
                    {step === 1 && "Excel Dosyası Yükle"}
                    {step === 2 && "Veri Önizleme"}
                    {step === 3 && "İşlem Tamamlandı"}
                </CardTitle>
                <CardDescription>
                    {step === 1 && (exam ? `${exam.title} (${exam.type}) için veri yükleyin.` : "Desteklenen formatlar: TYT, AYT, LGS (XLSX)")}
                    {step === 2 && "Yüklenen veriler kontrol ediliyor, lütfen onaylayın."}
                    {step === 3 && "Veriler kuyruğa alındı ve işleniyor."}
                </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[200px] flex flex-col justify-center">
                {exam && (
                    <div className="mb-6 rounded-lg bg-indigo-50 p-4 flex items-center gap-3 text-indigo-700 border border-indigo-100">
                        <Info className="h-5 w-5" />
                        <div>
                            <p className="text-sm font-semibold">{exam.title}</p>
                            <p className="text-xs">{exam.publisher && `${exam.publisher} | `}{exam.type} Sınavı</p>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div
                        className="border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center gap-4 hover:border-indigo-400 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        <div className="bg-indigo-50 p-4 rounded-full">
                            <Upload className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-slate-700">Dosyayı buraya sürükleyin veya seçin</p>
                            <p className="text-sm text-slate-400">Maksimum dosya boyutu: 10MB</p>
                        </div>
                        <Input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept=".xlsx"
                            onChange={handleFileChange}
                        />
                        {file && (
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 mt-2">
                                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                                <span className="text-sm font-medium text-slate-600">{file.name}</span>
                            </div>
                        )}
                    </div>
                )}

                {uploading && (
                    <div className="space-y-4">
                        <p className="text-sm text-center font-medium text-slate-600">Dosya yükleniyor... %{progress}</p>
                        <Progress value={progress} className="h-2" />
                    </div>
                )}

                {step === 2 && (
                    <div className="flex flex-col gap-4">
                        <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead className="bg-slate-50 sticky top-0 z-10">
                                    <tr className="border-b border-slate-200">
                                        <th className="p-2 text-center w-10">
                                            <input
                                                type="checkbox"
                                                checked={importData.every(r => r.selected)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setImportData(importData.map(r => ({
                                                        ...r,
                                                        selected: checked
                                                    })));
                                                }}
                                            />
                                        </th>
                                        <th className="p-2 text-left font-semibold text-slate-600">No</th>
                                        <th className="p-2 text-left font-semibold text-slate-600">TC No</th>
                                        <th className="p-2 text-left font-semibold text-slate-600">Ad Soyad</th>
                                        <th className="p-2 text-left font-semibold text-slate-600">Sınıf/Şube</th>
                                        <th className="p-2 text-left font-semibold text-slate-600">Durum</th>
                                        <th className="p-2 text-center w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {importData.map((row, idx) => {
                                        const isRowInvalid = !row.isValid;
                                        return (
                                            <tr key={idx} className={`border-b border-slate-100 ${!row.selected ? 'opacity-50 grayscale' : isRowInvalid ? 'bg-red-50' : 'hover:bg-slate-50'}`}>
                                                <td className="p-2 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={row.selected}
                                                        onChange={(e) => {
                                                            const newData = [...importData];
                                                            newData[idx].selected = e.target.checked;
                                                            setImportData(newData);
                                                        }}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        value={row.studentNumber || ''}
                                                        onChange={(e) => updateStudentNumber(idx, e.target.value)}
                                                        className={`h-8 w-20 text-xs ${isRowInvalid && !row.studentNumber ? 'border-red-300 focus-visible:ring-red-500' : ''}`}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        value={row.tcNo || ''}
                                                        onChange={(e) => {
                                                            const newData = [...importData];
                                                            newData[idx].tcNo = e.target.value;
                                                            setImportData(newData);
                                                        }}
                                                        placeholder="Opsiyonel"
                                                        className="h-8 w-24 text-xs"
                                                    />
                                                </td>
                                                <td className="p-2 text-slate-700 text-xs font-medium">
                                                    {row.name}
                                                </td>
                                                <td className="p-2 text-slate-500 text-xs">
                                                    {row.class}
                                                </td>
                                                <td className="p-2">
                                                    {isRowInvalid ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase">
                                                            <AlertCircle className="h-3 w-3" /> {row.errorReason?.join(', ')}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                                                            <CheckCircle2 className="h-3 w-3" /> Hazır
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-2 text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-slate-400 hover:text-red-600"
                                                        onClick={() => {
                                                            setImportData(importData.filter((_, i) => i !== idx));
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 flex gap-3 text-amber-800">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p className="text-xs leading-relaxed">
                                <strong>Bilgi:</strong> Kırmızı satırlar hatalı verileri gösterir. Öğrenci numaralarını düzeltebilirsiniz.
                                Numarası sistemde kayıtlı olmayan öğrenciler için varsayılan olarak <strong>1234</strong> şifresi atanacaktır.
                            </p>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
                        <div className="bg-emerald-50 p-6 rounded-full">
                            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">İşlem Başarılı</h3>
                            <p className="text-slate-500 max-w-sm">Veriler arka planda işlenmeye başladı. Tamamlandığında bildirim alacaksınız.</p>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between border-t border-slate-50 pt-6">
                {step < 3 ? (
                    <>
                        <Button variant="ghost" onClick={() => step > 1 && setStep(step - 1)} disabled={step === 1 || uploading}>
                            Geri
                        </Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700"
                            disabled={!file || uploading || (step === 2 && (importData.length === 0 || !importData.some(r => r.selected) || importData.some(r => r.selected && !r.isValid)))}
                            onClick={step === 1 ? startUpload : handleConfirm}
                        >
                            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {step === 1 ? "Yüklemeyi Başlat" : "Verileri Kaydet ve Bitir"}
                        </Button>
                    </>
                ) : (
                    <div className="w-full space-y-3">
                        <Button className="w-full bg-slate-900 hover:bg-slate-800" asChild>
                            <Link href="/">Anasayfaya Dön</Link>
                        </Button>
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" className="w-full" onClick={() => { setStep(1); setFile(null); }}>
                                Yeni Yükleme Yap
                            </Button>
                            <Button variant="outline" className="w-full border-indigo-200 text-indigo-600 hover:bg-indigo-50" asChild>
                                <Link href={`/exams/${examId}/results`}>Sınav İstatistikleri</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}

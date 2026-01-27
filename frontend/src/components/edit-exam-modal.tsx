"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Download, Upload } from "lucide-react";

interface EditExamModalProps {
    exam: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditExamModal({ exam, open, onOpenChange, onSuccess }: EditExamModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);

    useEffect(() => {
        if (exam) {
            setFormData({
                title: exam.title || "",
                publisher: exam.publisher || "",
                date: exam.date ? new Date(exam.date).toISOString().split('T')[0] : "",
                type: exam.type || "TYT",
                gradeLevel: exam.gradeLevel || "",
                generalParticipantCount: exam.generalParticipantCount || 0,
                cityParticipantCount: exam.cityParticipantCount || 0,
                districtParticipantCount: exam.districtParticipantCount || 0,
                generalInfo: exam.generalInfo || "",
            });
        }
    }, [exam]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const data = {
            ...formData,
            gradeLevel: parseInt(formData.gradeLevel) || 0,
            generalParticipantCount: parseInt(formData.generalParticipantCount) || 0,
            cityParticipantCount: parseInt(formData.cityParticipantCount) || 0,
            districtParticipantCount: parseInt(formData.districtParticipantCount) || 0,
        };

        try {
            const response = await fetch(`http://localhost:3001/exams/${exam.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                // Upload answer key if provided
                if (answerKeyFile) {
                    const fileFormData = new FormData();
                    fileFormData.append('file', answerKeyFile);
                    
                    await fetch(`http://localhost:3001/exams/${exam.id}/upload-answer-key`, {
                        method: "POST",
                        body: fileFormData,
                    });
                }
                
                onOpenChange(false);
                setAnswerKeyFile(null);
                onSuccess();
            }
        } catch (error) {
            console.error("Failed to update exam:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!exam) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] dark:bg-slate-900 dark:border-slate-800">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Sınavı Düzenle</DialogTitle>
                        <DialogDescription>
                            Sınav bilgilerini güncelleyin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-title text-slate-900 dark:text-slate-200">Sınav Adı</Label>
                                <Input id="edit-title" name="title" value={formData.title} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-publisher text-slate-900 dark:text-slate-200">Yayıncı</Label>
                                <Input id="edit-publisher" name="publisher" value={formData.publisher} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-date text-slate-900 dark:text-slate-200">Sınav Tarihi</Label>
                                <Input id="edit-date" name="date" type="date" value={formData.date} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-type text-slate-900 dark:text-slate-200">Sınav Türü</Label>
                                <select
                                    id="edit-type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                >
                                    <option value="TYT">TYT</option>
                                    <option value="AYT">AYT</option>
                                    <option value="LGS">LGS</option>
                                    <option value="OZEL">Özel</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-gradeLevel text-slate-900 dark:text-slate-200">Sınıf Seviyesi</Label>
                                <select
                                    id="edit-gradeLevel"
                                    name="gradeLevel"
                                    value={formData.gradeLevel}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                >
                                    <option value="">Seçiniz</option>
                                    <option value="5">5. Sınıf</option>
                                    <option value="6">6. Sınıf</option>
                                    <option value="7">7. Sınıf</option>
                                    <option value="8">8. Sınıf</option>
                                    <option value="9">9. Sınıf</option>
                                    <option value="10">10. Sınıf</option>
                                    <option value="11">11. Sınıf</option>
                                    <option value="12">12. Sınıf</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-generalParticipantCount text-slate-900 dark:text-slate-200">Genel Katılım Sayısı</Label>
                                <Input id="edit-generalParticipantCount" name="generalParticipantCount" type="number" value={formData.generalParticipantCount} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-cityParticipantCount text-slate-900 dark:text-slate-200">İl Katılım Sayısı</Label>
                                <Input id="edit-cityParticipantCount" name="cityParticipantCount" type="number" value={formData.cityParticipantCount} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-districtParticipantCount text-slate-900 dark:text-slate-200">İlçe Katılım Sayısı</Label>
                                <Input id="edit-districtParticipantCount" name="districtParticipantCount" type="number" value={formData.districtParticipantCount} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-generalInfo text-slate-900 dark:text-slate-200">Genel Bilgiler</Label>
                            <Input id="edit-generalInfo" name="generalInfo" value={formData.generalInfo} onChange={handleChange} />
                        </div>
                        
                        {/* Answer Key Section */}
                        <div className="space-y-2">
                            <Label>Cevap Anahtarı</Label>
                            {exam.answerKeyUrl ? (
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => window.open(`http://localhost:3001${exam.answerKeyUrl}`, '_blank')}
                                    >
                                        <Download className="h-4 w-4" />
                                        Mevcut Cevap Anahtarını İndir
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">Cevap anahtarı yüklenmemiş.</p>
                            )}
                            <div className="flex items-center gap-2">
                                <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
                                    onChange={(e) => setAnswerKeyFile(e.target.files?.[0] || null)}
                                    className="cursor-pointer"
                                />
                                {answerKeyFile && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setAnswerKeyFile(null)}
                                    >
                                        Temizle
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-slate-500">
                                Yeni cevap anahtarı yüklemek için dosya seçin.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
                        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Güncelle
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

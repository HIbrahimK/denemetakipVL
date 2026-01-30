"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreateExamModalProps {
    onSuccess?: () => void;
}

export function CreateExamModal({ onSuccess }: CreateExamModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const schoolId = user?.schoolId || "";

        const data = {
            title: formData.get("title"),
            publisher: formData.get("publisher"),
            date: formData.get("date"),
            type: formData.get("type"),
            gradeLevel: parseInt(formData.get("gradeLevel") as string),
            generalParticipantCount: parseInt(formData.get("generalParticipantCount") as string) || 0,
            cityParticipantCount: parseInt(formData.get("cityParticipantCount") as string) || 0,
            districtParticipantCount: parseInt(formData.get("districtParticipantCount") as string) || 0,
            generalInfo: formData.get("generalInfo"),
            schoolId: schoolId,
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch("http://localhost:3001/exams", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const exam = await response.json();
                
                // Upload answer key if provided
                if (answerKeyFile) {
                    const fileFormData = new FormData();
                    fileFormData.append('file', answerKeyFile);
                    
                    await fetch(`http://localhost:3001/exams/${exam.id}/upload-answer-key`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        },
                        body: fileFormData,
                    });
                }
                
                setOpen(false);
                setAnswerKeyFile(null);
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push(`/import?examId=${exam.id}`);
                }
            }
        } catch (error) {
            console.error("Failed to create exam:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Sınav Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Yeni Sınav Oluştur</DialogTitle>
                        <DialogDescription>
                            Sınav bilgilerini girin. Excel ile veri yükleme bu adımdan sonra yapılacaktır.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Sınav Adı</Label>
                                <Input id="title" name="title" placeholder="Örn: Özdebir TG-3" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="publisher">Yayıncı</Label>
                                <Input id="publisher" name="publisher" placeholder="Örn: Özdebir" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Sınav Tarihi</Label>
                                <Input id="date" name="date" type="date" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Sınav Türü</Label>
                                <select id="type" name="type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" required>
                                    <option value="TYT">TYT</option>
                                    <option value="AYT">AYT</option>
                                    <option value="LGS">LGS</option>
                                    <option value="OZEL">Özel</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="gradeLevel">Sınıf Seviyesi</Label>
                                <select id="gradeLevel" name="gradeLevel" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" required>
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
                                <Label htmlFor="generalParticipantCount">Genel Katılım Sayısı</Label>
                                <Input id="generalParticipantCount" name="generalParticipantCount" type="number" placeholder="Örn: 50000" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cityParticipantCount">İl Katılım Sayısı</Label>
                                <Input id="cityParticipantCount" name="cityParticipantCount" type="number" placeholder="Örn: 5000" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="districtParticipantCount">İlçe Katılım Sayısı</Label>
                                <Input id="districtParticipantCount" name="districtParticipantCount" type="number" placeholder="Örn: 1000" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="generalInfo">Genel Bilgiler</Label>
                            <Input id="generalInfo" name="generalInfo" placeholder="Sınav hakkında ek notlar..." />
                        </div>
                        
                        {/* Answer Key Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="answerKey">Cevap Anahtarı (İsteğe Bağlı)</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="answerKey"
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
                                PDF, JPG, JPEG, PNG veya Excel formatında dosya yükleyebilirsiniz.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>İptal</Button>
                        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sınavı Oluştur ve Veri Yükle
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

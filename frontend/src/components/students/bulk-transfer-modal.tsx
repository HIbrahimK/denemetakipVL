"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, ArrowRight } from "lucide-react";

interface BulkTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    selectedCount: number;
    studentIds: string[];
}

export function BulkTransferModal({ isOpen, onClose, onSuccess, selectedCount, studentIds }: BulkTransferModalProps) {
    const [filters, setFilters] = useState<any[]>([]);
    const [selectedGrade, setSelectedGrade] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [customGrade, setCustomGrade] = useState("");
    const [customClass, setCustomClass] = useState("");
    const [useCustom, setUseCustom] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchFilters();
        }
    }, [isOpen]);

    const fetchFilters = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:3001/students/filters", {
            });
            const data = await res.json();
            setFilters(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Determine which values to use
        const gradeName = useCustom ? customGrade : filters.find((g) => g.id === selectedGrade)?.name;
        const className = useCustom ? customClass : filters.find((g) => g.id === selectedGrade)?.classes.find((c: any) => c.id === selectedClass)?.name;

        if (!gradeName || !className) {
            setError("Lütfen sınıf ve şube bilgilerini girin");
            return;
        }

        setLoading(true);
        const token = localStorage.getItem("token");

        try {
            const res = await fetch("http://localhost:3001/students/bulk-transfer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    studentIds,
                    gradeName,
                    className,
                }),
            });

            if (res.ok) {
                onSuccess();
                onClose();
                setSelectedGrade("");
                setSelectedClass("");
                setCustomGrade("");
                setCustomClass("");
                setUseCustom(false);
            } else {
                const data = await res.json();
                setError(data.message || "Aktarım başarısız!");
            }
        } catch (error) {
            setError("Bir hata oluştu!");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const classesList = filters.find((g) => g.id === selectedGrade)?.classes || [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-600" />
                        Toplu Sınıf Aktarımı
                    </DialogTitle>
                    <DialogDescription>
                        {selectedCount} öğrenciyi yeni sınıfa aktarın
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Toggle between dropdown and custom input */}
                        <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <Checkbox
                                id="useCustom"
                                checked={useCustom}
                                onCheckedChange={(checked) => setUseCustom(checked as boolean)}
                            />
                            <Label htmlFor="useCustom" className="cursor-pointer">
                                Yeni sınıf/şube oluştur (elle yaz)
                            </Label>
                        </div>

                        {!useCustom ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="grade">Sınıf Seviyesi</Label>
                                    <select
                                        id="grade"
                                        value={selectedGrade}
                                        onChange={(e) => {
                                            setSelectedGrade(e.target.value);
                                            setSelectedClass("");
                                        }}
                                        className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">Sınıf seçin...</option>
                                        {filters.map((grade) => (
                                            <option key={grade.id} value={grade.id}>
                                                {grade.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="class">Şube</Label>
                                    <select
                                        id="class"
                                        value={selectedClass}
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                        disabled={!selectedGrade}
                                        className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                        required
                                    >
                                        <option value="">Şube seçin...</option>
                                        {classesList.map((cls: any) => (
                                            <option key={cls.id} value={cls.id}>
                                                {cls.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="customGrade">Sınıf Seviyesi</Label>
                                    <Input
                                        id="customGrade"
                                        placeholder="Örn: 8. Sınıf, 11. Sınıf"
                                        value={customGrade}
                                        onChange={(e) => setCustomGrade(e.target.value)}
                                        className="h-10"
                                        required
                                    />
                                    <p className="text-xs text-slate-500">Yoksa otomatik oluşturulacak</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="customClass">Şube</Label>
                                    <Input
                                        id="customClass"
                                        placeholder="Örn: A, B, C, Fen"
                                        value={customClass}
                                        onChange={(e) => setCustomClass(e.target.value)}
                                        className="h-10"
                                        required
                                    />
                                    <p className="text-xs text-slate-500">Yoksa otomatik oluşturulacak</p>
                                </div>
                            </>
                        )}

                        {((selectedGrade && selectedClass) || (customGrade && customClass)) && (
                            <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-sm">
                                <span className="font-medium text-slate-600 dark:text-slate-400">
                                    {selectedCount} öğrenci
                                </span>
                                <ArrowRight className="h-4 w-4 text-indigo-600" />
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                    {useCustom 
                                        ? `${customGrade} ${customClass}`
                                        : `${filters.find((g) => g.id === selectedGrade)?.name} ${classesList.find((c: any) => c.id === selectedClass)?.name}`
                                    }
                                </span>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            disabled={loading || (useCustom ? (!customGrade || !customClass) : (!selectedGrade || !selectedClass))}
                        >
                            {loading ? "Aktarılıyor..." : "Aktar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

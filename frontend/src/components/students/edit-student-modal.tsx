"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EditStudentModal({ student, open, onOpenChange, onSuccess }: any) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        studentNumber: "",
        tcNo: "",
        gradeName: "",
        className: "",
    });

    useEffect(() => {
        if (student) {
            setFormData({
                firstName: student.user.firstName,
                lastName: student.user.lastName,
                studentNumber: student.studentNumber || "",
                tcNo: student.tcNo || "",
                gradeName: student.class.grade.name,
                className: student.class.name,
            });
        }
    }, [student]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${API_BASE_URL}/students/${student.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                onSuccess();
                onOpenChange(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Öğrenci Düzenle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Adı</Label>
                            <Input
                                id="firstName"
                                required
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Soyadı</Label>
                            <Input
                                id="lastName"
                                required
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="studentNumber">Öğrenci No</Label>
                            <Input
                                id="studentNumber"
                                value={formData.studentNumber}
                                onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tcNo">TC Kimlik No</Label>
                            <Input
                                id="tcNo"
                                maxLength={11}
                                value={formData.tcNo}
                                onChange={(e) => setFormData({ ...formData, tcNo: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="gradeName">Sınıf</Label>
                            <Input
                                id="gradeName"
                                placeholder="Örn: 9"
                                required
                                value={formData.gradeName}
                                onChange={(e) => setFormData({ ...formData, gradeName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="className">Şube</Label>
                            <Input
                                id="className"
                                placeholder="Örn: A"
                                required
                                value={formData.className}
                                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
                        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            {loading ? "Güncelleniyor..." : "Güncelle"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

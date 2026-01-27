"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangeParentPasswordModal({ student, open, onOpenChange }: any) {
    const [loading, setLoading] = useState(false);
    const [newPassword, setNewPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) return;

        setLoading(true);
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`http://localhost:3001/students/${student.id}/change-parent-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword }),
            });

            if (res.ok) {
                onOpenChange(false);
                setNewPassword("");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Veli Şifresi Değiştir</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <p className="text-sm text-slate-500">
                        <span className="font-semibold text-slate-900 dark:text-white">{student?.user.firstName} {student?.user.lastName}</span> isimli öğrencinin velisi için yeni şifre belirleyin.
                    </p>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">Yeni Veli Şifresi</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <p className="text-xs text-slate-500">
                            Bu şifre, veli giriş sayfasında kullanılacaktır.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
                        <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                            {loading ? "Kaydediliyor..." : "Veli Şifresini Güncelle"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

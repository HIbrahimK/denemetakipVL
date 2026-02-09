"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UserChangePasswordModal({ user, open, onOpenChange }: any) {
    const [loading, setLoading] = useState(false);
    const [newPassword, setNewPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) return;

        setLoading(true);
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${API_BASE_URL}/users/${user.id}/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
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
                    <DialogTitle>Şifre Değiştir</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <p className="text-sm text-slate-500">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{user?.firstName} {user?.lastName}</span> için yeni şifre belirleyin.
                    </p>
                    <div className="space-y-2">
                        <Label htmlFor="user-newPassword">Yeni Şifre</Label>
                        <Input
                            id="user-newPassword"
                            type="password"
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
                        <Button type="submit" disabled={loading || newPassword.length < 6} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            {loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

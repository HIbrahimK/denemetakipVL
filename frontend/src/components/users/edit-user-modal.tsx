"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export function EditUserModal({ user, open, onOpenChange, onSuccess }: any) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        role: "",
        branch: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                branch: user.branch || "",
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`http://localhost:3001/users/${user.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                onSuccess();
                onOpenChange(false);
                toast({
                    title: "Başarılı",
                    description: "Kullanıcı bilgileri güncellendi",
                });
            } else {
                toast({
                    title: "Hata",
                    description: "Kullanıcı güncellenirken hata oluştu",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Hata",
                description: "Bir hata oluştu",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Kullanıcı Düzenle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-firstName">Adı</Label>
                            <Input
                                id="edit-firstName"
                                required
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-lastName">Soyadı</Label>
                            <Input
                                id="edit-lastName"
                                required
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-email">E-posta</Label>
                        <Input
                            id="edit-email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-role">Yetki / Rol</Label>
                        <Select
                            value={formData.role}
                            onValueChange={(value) => setFormData({ ...formData, role: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Yetki seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TEACHER">Öğretmen</SelectItem>
                                <SelectItem value="SCHOOL_ADMIN">Okul Yöneticisi</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {formData.role === "TEACHER" && (
                        <div className="space-y-2">
                            <Label htmlFor="edit-branch">Branş</Label>
                            <Input
                                id="edit-branch"
                                placeholder="Örn: Matematik, Türkçe, Fizik"
                                value={formData.branch}
                                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                            />
                        </div>
                    )}
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

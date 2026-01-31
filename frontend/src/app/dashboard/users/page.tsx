"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Users as UsersIcon,
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Key,
    ShieldCheck,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddUserModal } from "@/components/users/add-user-modal";
import { EditUserModal } from "@/components/users/edit-user-modal";
import { UserChangePasswordModal } from "@/components/users/change-password-modal";
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

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedRole, setSelectedRole] = useState("all");

    // Modals
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editUser, setEditUser] = useState<any>(null);
    const [passwordUser, setPasswordUser] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");

        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (selectedRole && selectedRole !== "all") params.append("role", selectedRole);

            const res = await fetch(`http://localhost:3001/users?${params.toString()}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [search, selectedRole]);

    const handleDelete = async () => {
        if (!deleteId) return;
        const token = localStorage.getItem("token");
        try {
            await fetch(`http://localhost:3001/users/${deleteId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setDeleteId(null);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "SCHOOL_ADMIN":
                return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800">Yönetici</Badge>;
            case "TEACHER":
                return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800">Öğretmen</Badge>;
            case "SUPER_ADMIN":
                return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800">Süper Admin</Badge>;
            default:
                return <Badge variant="outline">{role}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <UsersIcon className="h-8 w-8 text-indigo-600" />
                        Kullanıcı Yönetimi
                    </h2>
                    <p className="text-slate-500">Okul yöneticilerini ve öğretmenleri buradan yönetebilirsiniz.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-600/20" onClick={() => setIsAddOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Yeni Kullanıcı
                </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="relative col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="İsim veya e-posta ile ara..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select
                        value={selectedRole}
                        onValueChange={(value) => setSelectedRole(value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Tüm Yetkiler" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tüm Yetkiler</SelectItem>
                            <SelectItem value="SCHOOL_ADMIN">Yöneticiler</SelectItem>
                            <SelectItem value="TEACHER">Öğretmenler</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                            <TableRow>
                                <TableHead className="w-[80px] text-slate-600 dark:text-slate-400 font-semibold">Profil</TableHead>
                                <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Ad Soyad / E-posta</TableHead>
                                <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Yetki</TableHead>
                                <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Kayıt Tarihi</TableHead>
                                <TableHead className="text-right text-slate-600 dark:text-slate-400 font-semibold">İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                                        Yükleniyor...
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                                        Kullanıcı bulunamadı.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <TableCell>
                                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                                                {user.firstName[0]}{user.lastName[0]}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-semibold text-slate-900 dark:text-slate-100">{user.firstName} {user.lastName}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            {getRoleBadge(user.role)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                                {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => setEditUser(user)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Düzenle
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setPasswordUser(user)}>
                                                        <Key className="mr-2 h-4 w-4" /> Şifre Değiştir
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(user.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Sil
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Modals */}
            <AddUserModal
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                onSuccess={fetchData}
            />
            {editUser && (
                <EditUserModal
                    user={editUser}
                    open={!!editUser}
                    onOpenChange={(open: boolean) => !open && setEditUser(null)}
                    onSuccess={fetchData}
                />
            )}
            {passwordUser && (
                <UserChangePasswordModal
                    user={passwordUser}
                    open={!!passwordUser}
                    onOpenChange={(open: boolean) => !open && setPasswordUser(null)}
                />
            )}

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu kullanıcıyı sistemden silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white border-none" onClick={handleDelete}>
                            Evet, Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Trash2,
  Shield,
  Loader2,
  RefreshCw,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { adminApi } from "@/lib/api";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  schoolId: string | null;
  createdAt: string;
  school?: { id: string; name: string } | null;
}

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminApi.getUsers({ role: "SUPER_ADMIN" });
      const userList = Array.isArray(result) ? result : result.data || [];
      setUsers(userList);
    } catch (err: any) {
      setError(err.message || "Veriler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu süper admin kullanıcısını silmek istediğinize emin misiniz?")) return;
    try {
      await adminApi.deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err: any) {
      alert(err.message || "Silme başarısız");
    }
  };

  const handleAddUser = async () => {
    setModalError(null);
    if (!newUser.firstName.trim() || !newUser.lastName.trim()) {
      setModalError("Ad ve soyad zorunludur");
      return;
    }
    if (!newUser.email.trim()) {
      setModalError("Email zorunludur");
      return;
    }
    if (newUser.password.length < 4) {
      setModalError("Şifre en az 4 karakter olmalıdır");
      return;
    }

    try {
      setSubmitting(true);
      await adminApi.createUser({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
        role: "SUPER_ADMIN",
        schoolId: "",
      });
      setShowAddModal(false);
      setNewUser({ firstName: "", lastName: "", email: "", password: "" });
      fetchData();
    } catch (err: any) {
      setModalError(err.message || "Kullanıcı oluşturulurken hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      !searchQuery ||
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Süper Admin Yönetimi</h1>
          <p className="text-muted-foreground">
            Sistem yöneticilerini ekleyin ve yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Süper Admin
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Kullanıcı ara..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Yükleniyor...</span>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && (
        <>
          <div className="text-sm text-muted-foreground">
            {filteredUsers.length} süper admin kullanıcısı
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium">Kullanıcı</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Rol</th>
                      <th className="px-6 py-4 text-left text-sm font-medium hidden sm:table-cell">Kayıt Tarihi</th>
                      <th className="px-6 py-4 text-right text-sm font-medium">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            <Shield className="h-3 w-3 mr-1" />
                            Süper Admin
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground hidden sm:table-cell">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString("tr-TR")
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Süper admin kullanıcısı bulunamadı.</p>
            </div>
          )}
        </>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Yeni Süper Admin Ekle</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowAddModal(false);
                  setModalError(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {modalError && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                  {modalError}
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-sm">
                <Shield className="h-4 w-4 inline mr-1" />
                Bu kullanıcı tüm sisteme tam erişim yetkisine sahip olacaktır.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Ad *</label>
                  <Input
                    placeholder="Ad"
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Soyad *</label>
                  <Input
                    placeholder="Soyad"
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  placeholder="admin@denemetakip.net"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Şifre *</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="En az 4 karakter"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowAddModal(false);
                    setModalError(null);
                  }}
                >
                  İptal
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAddUser}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Ekle
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Shield,
  User,
} from "lucide-react";

const mockUsers = [
  {
    id: "1",
    name: "Ahmet Yılmaz",
    email: "ahmet.yilmaz@email.com",
    phone: "0532 123 45 67",
    role: "super_admin",
    school: "Tüm Okullar",
    status: "active",
    lastLogin: "2024-01-15 10:30",
  },
  {
    id: "2",
    name: "Mehmet Kaya",
    email: "mehmet.kaya@ataturk.edu.tr",
    phone: "0533 987 65 43",
    role: "school_admin",
    school: "Ankara Atatürk Lisesi",
    status: "active",
    lastLogin: "2024-01-15 09:15",
  },
  {
    id: "3",
    name: "Ayşe Demir",
    email: "ayse.demir@email.com",
    phone: "0534 555 12 34",
    role: "content_manager",
    school: "-",
    status: "active",
    lastLogin: "2024-01-14 16:45",
  },
  {
    id: "4",
    name: "Fatma Şahin",
    email: "fatma.sahin@email.com",
    phone: "0535 777 88 99",
    role: "support",
    school: "-",
    status: "inactive",
    lastLogin: "2024-01-10 11:20",
  },
];

const roleLabels: Record<string, string> = {
  super_admin: "Süper Admin",
  school_admin: "Okul Yöneticisi",
  content_manager: "İçerik Yöneticisi",
  support: "Destek Ekibi",
};

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState(mockUsers);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) {
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1>
          <p className="text-muted-foreground">
            Sistem kullanıcılarını yönetin
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Kullanıcı
        </Button>
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

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-muted border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Kullanıcı
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Rol
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Okul
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Durum
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Son Giriş
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      <Shield className="h-3 w-3" />
                      {roleLabels[user.role]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm">{user.school}</td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={user.status === "active" ? "default" : "secondary"}
                    >
                      {user.status === "active" ? "Aktif" : "Pasif"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
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
        </CardContent>
      </Card>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Kullanıcı bulunamadı.</p>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Yeni Kullanıcı Ekle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Ad Soyad *</label>
                <Input placeholder="Ad Soyad" />
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input type="email" placeholder="email@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium">Telefon</label>
                <Input placeholder="05XX XXX XX XX" />
              </div>
              <div>
                <label className="text-sm font-medium">Rol *</label>
                <select className="w-full mt-1 px-3 py-2 border rounded-md">
                  <option value="school_admin">Okul Yöneticisi</option>
                  <option value="content_manager">İçerik Yöneticisi</option>
                  <option value="support">Destek Ekibi</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Şifre *</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddModal(false)}
                >
                  İptal
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setShowAddModal(false)}
                >
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

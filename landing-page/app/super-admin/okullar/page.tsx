"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Users,
  FileText,
} from "lucide-react";

const schools = [
  {
    id: "1",
    name: "Ankara Atatürk Lisesi",
    code: "AAL",
    subdomain: "aal.denemetakip.net",
    students: 500,
    exams: 45,
    plan: "Profesyonel",
    status: "active",
    expiresAt: "2025-03-15",
  },
  {
    id: "2",
    name: "İstanbul Fen Lisesi",
    code: "IFL",
    subdomain: "ifl.denemetakip.net",
    students: 450,
    exams: 38,
    plan: "Profesyonel",
    status: "active",
    expiresAt: "2025-04-20",
  },
  {
    id: "3",
    name: "İzmir Anadolu Lisesi",
    code: "IZAL",
    subdomain: "izal.denemetakip.net",
    students: 400,
    exams: 32,
    plan: "Başlangıç",
    status: "active",
    expiresAt: "2025-02-28",
  },
  {
    id: "4",
    name: "Bursa İmam Hatip Lisesi",
    code: "BIHL",
    subdomain: "bihl.denemetakip.net",
    students: 350,
    exams: 28,
    plan: "Başlangıç",
    status: "pending",
    expiresAt: "2025-05-10",
  },
];

export default function SchoolsManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Okul Yönetimi</h1>
          <p className="text-muted-foreground">Tüm okulları yönetin ve izleyin</p>
        </div>
        <Link href="/super-admin/okullar/yeni">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Okul Ekle
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Okul ara..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="px-4 py-2 border rounded-md">
              <option>Tüm Planlar</option>
              <option>Başlangıç</option>
              <option>Profesyonel</option>
              <option>Kurumsal</option>
            </select>
            <select className="px-4 py-2 border rounded-md">
              <option>Tüm Durumlar</option>
              <option>Aktif</option>
              <option>Beklemede</option>
              <option>Pasif</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Schools Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Okul</th>
                  <th className="text-left py-3 px-4 font-medium">Subdomain</th>
                  <th className="text-left py-3 px-4 font-medium">İstatistikler</th>
                  <th className="text-left py-3 px-4 font-medium">Plan</th>
                  <th className="text-left py-3 px-4 font-medium">Durum</th>
                  <th className="text-left py-3 px-4 font-medium">Bitiş</th>
                  <th className="text-left py-3 px-4 font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school) => (
                  <tr key={school.id} className="border-b">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold">{school.name}</p>
                        <p className="text-sm text-muted-foreground">{school.code}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={`https://${school.subdomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {school.subdomain}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {school.students}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {school.exams}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          school.plan === "Profesyonel"
                            ? "bg-blue-100 text-blue-700"
                            : school.plan === "Kurumsal"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {school.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          school.status === "active"
                            ? "bg-green-100 text-green-700"
                            : school.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {school.status === "active"
                          ? "Aktif"
                          : school.status === "pending"
                          ? "Beklemede"
                          : "Pasif"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{school.expiresAt}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
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

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" disabled>
          Önceki
        </Button>
        <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
          1
        </Button>
        <Button variant="outline" size="sm">2</Button>
        <Button variant="outline" size="sm">3</Button>
        <Button variant="outline" size="sm">
          Sonraki
        </Button>
      </div>
    </div>
  );
}

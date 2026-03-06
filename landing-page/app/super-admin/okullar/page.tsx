"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Users,
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { adminApi, ApiError } from "@/lib/api";

interface SchoolItem {
  id: string;
  name: string;
  code: string;
  subdomainAlias?: string;
  domain?: string;
  studentCount: number;
  userCount: number;
  examCount: number;
  createdAt: string;
  license?: {
    planName: string;
    status: string;
    endDate: string;
  } | null;
}

interface SchoolsResponse {
  schools: SchoolItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function SchoolsManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [data, setData] = useState<SchoolsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await adminApi.getSchools({
        page: String(page),
        limit: "20",
        search: searchTerm || undefined,
        status: statusFilter || undefined,
      });
      setData(result as SchoolsResponse);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Okullar yüklenirken bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  // Debounced search
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" okulunu silmek istediğinize emin misiniz?`)) return;
    setDeleting(id);
    try {
      await adminApi.deleteSchool(id);
      fetchSchools();
    } catch {
      alert("Okul silinirken bir hata oluştu.");
    } finally {
      setDeleting(null);
    }
  };

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "2eh.net";

  const getSubdomain = (school: SchoolItem) => {
    if (school.domain) return school.domain;
    if (school.subdomainAlias) return `${school.subdomainAlias}.${rootDomain}`;
    return `${school.code.toLowerCase()}.${rootDomain}`;
  };

  const getLicenseStatusLabel = (status?: string) => {
    switch (status) {
      case "ACTIVE": return "Aktif";
      case "GRACE": return "Ödemede";
      case "EXPIRED": return "Süresi Doldu";
      case "SUSPENDED": return "Askıda";
      default: return "Lisanssız";
    }
  };

  const getLicenseStatusClass = (status?: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-700";
      case "GRACE": return "bg-yellow-100 text-yellow-700";
      case "EXPIRED": return "bg-red-100 text-red-700";
      case "SUSPENDED": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  const getPlanClass = (planName?: string) => {
    if (!planName) return "bg-gray-100 text-gray-700";
    const lower = planName.toLowerCase();
    if (lower.includes("profesyonel") || lower.includes("pro"))
      return "bg-blue-100 text-blue-700";
    if (lower.includes("kurumsal") || lower.includes("enterprise"))
      return "bg-purple-100 text-purple-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Okul Yönetimi</h1>
          <p className="text-muted-foreground">
            Tüm okulları yönetin ve izleyin
            {data && ` (${data.total} okul)`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchSchools} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Link href="/super-admin/okullar/yeni">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Okul Ekle
            </Button>
          </Link>
        </div>
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
            <select
              className="px-4 py-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tüm Durumlar</option>
              <option value="ACTIVE">Aktif</option>
              <option value="GRACE">Ödemede</option>
              <option value="EXPIRED">Süresi Doldu</option>
              <option value="SUSPENDED">Askıda</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && !data && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Schools Table */}
      {data && (
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
                  {data.schools.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        {searchTerm ? "Arama sonucu bulunamadı." : "Henüz okul eklenmemiş."}
                      </td>
                    </tr>
                  ) : (
                    data.schools.map((school) => (
                      <tr key={school.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold">{school.name}</p>
                            <p className="text-sm text-muted-foreground">{school.code}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <a
                            href={`https://${getSubdomain(school)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {getSubdomain(school)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-3 text-sm">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {school.studentCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {school.examCount}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${getPlanClass(school.license?.planName)}`}>
                            {school.license?.planName || "—"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${getLicenseStatusClass(school.license?.status)}`}>
                            {getLicenseStatusLabel(school.license?.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {school.license?.endDate
                            ? new Date(school.license.endDate).toLocaleDateString("tr-TR")
                            : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Link href={`/super-admin/okullar/${school.id}`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(school.id, school.name)}
                              disabled={deleting === school.id}
                            >
                              {deleting === school.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-red-500" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Önceki
          </Button>
          {Array.from({ length: data.totalPages }, (_, i) => i + 1)
            .filter((p) => {
              // Show first, last, current, and neighbors
              return p === 1 || p === data.totalPages || Math.abs(p - page) <= 1;
            })
            .map((p, idx, arr) => {
              const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
              return (
                <span key={p} className="flex items-center">
                  {showEllipsis && (
                    <span className="px-2 text-muted-foreground">...</span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className={p === page ? "bg-primary text-primary-foreground" : ""}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                </span>
              );
            })}
          <Button
            variant="outline"
            size="sm"
            disabled={page >= (data?.totalPages || 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Sonraki
          </Button>
        </div>
      )}
    </div>
  );
}

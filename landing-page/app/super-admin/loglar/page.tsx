"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, Clock3, Loader2, RefreshCw, Search, School, User } from "lucide-react";

type AccessLogItem = {
  id: string;
  method: string;
  path: string;
  route?: string | null;
  area?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  statusCode: number;
  createdAt: string;
  school: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    role: string;
  };
};

type AccessLogResponse = {
  items: AccessLogItem[];
  total: number;
  page: number;
  totalPages: number;
};

type AccessLogStats = {
  totalToday: number;
  activeUsersToday: number;
  activeSchoolsToday: number;
  topRoutes: Array<{ path: string; count: number }>;
};

export default function AccessLogsPage() {
  const [data, setData] = useState<AccessLogResponse | null>(null);
  const [stats, setStats] = useState<AccessLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [logs, accessStats] = await Promise.all([
        adminApi.getAccessLogs({
          page: "1",
          limit: "100",
          search: search || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        }) as Promise<AccessLogResponse>,
        adminApi.getAccessLogStats() as Promise<AccessLogStats>,
      ]);

      setData(logs);
      setStats(accessStats);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Kullanım logları yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(value)
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kullanım Logları</h1>
          <p className="text-muted-foreground">
            Okul kullanıcılarının erişim geçmişini IP, rota ve zaman bazında izleyin.
          </p>
        </div>
        <Button variant="outline" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Yenile
        </Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Bugünkü Toplam" value={String(stats.totalToday)} icon={Activity} />
          <StatCard title="Aktif Kullanıcı" value={String(stats.activeUsersToday)} icon={User} />
          <StatCard title="Aktif Okul" value={String(stats.activeSchoolsToday)} icon={School} />
          <StatCard title="Popüler Rota" value={stats.topRoutes[0]?.path || "-"} icon={Clock3} compact />
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_180px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Kullanıcı, okul, rota veya alan ara"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
            <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          </div>
        </CardContent>
      </Card>

      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {loading && !data ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Son Erişimler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px]">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Zaman</th>
                    <th className="px-4 py-3 font-medium">Kullanıcı</th>
                    <th className="px-4 py-3 font-medium">Okul</th>
                    <th className="px-4 py-3 font-medium">Rota</th>
                    <th className="px-4 py-3 font-medium">Alan</th>
                    <th className="px-4 py-3 font-medium">IP</th>
                    <th className="px-4 py-3 font-medium">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.length ? (
                    data.items.map((item) => (
                      <tr key={item.id} className="border-b align-top">
                        <td className="px-4 py-3 text-sm">{formatDate(item.createdAt)}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="font-medium">
                            {item.user.firstName} {item.user.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.user.role}
                            {item.user.email ? ` • ${item.user.email}` : ""}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{item.school.name}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="font-medium">{item.method} {item.path}</div>
                          <div className="text-xs text-muted-foreground">{item.route || "-"}</div>
                        </td>
                        <td className="px-4 py-3 text-sm">{item.area || "-"}</td>
                        <td className="px-4 py-3 text-sm">{item.ipAddress || "-"}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            {item.statusCode}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                        Log kaydı bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  compact = false,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  compact?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`mt-2 font-bold ${compact ? 'truncate text-lg' : 'text-3xl'}`}>{value}</p>
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
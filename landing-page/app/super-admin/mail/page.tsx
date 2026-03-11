"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Filter,
  Inbox,
  Loader2,
  Mail,
  RefreshCw,
  ShieldAlert,
  Wrench,
} from "lucide-react";

type MailItem = {
  id: string;
  itemType: "CONTACT" | "DEMO" | "LICENSE";
  fromName: string;
  fromEmail: string | null;
  subject: string;
  body: string;
  status: string;
  category: string;
  targetInbox: string;
  sourceChannel: string;
  sourcePage: string | null;
  createdAt: string;
  updatedAt: string;
  schoolName?: string;
  remainingDays?: number;
  licenseEndDate?: string;
  planName?: string;
};

type MailResponse = {
  items: MailItem[];
  total: number;
  page: number;
  totalPages: number;
};

type MailStats = {
  inboxes: Record<string, number>;
  categories: Record<string, number>;
  expiringLicenses: number;
};

const itemTypeOptions = [
  { value: "", label: "Tüm kayıtlar" },
  { value: "CONTACT", label: "İletişim" },
  { value: "DEMO", label: "Demo" },
  { value: "LICENSE", label: "Lisans uyarıları" },
];

const inboxOptions = [
  { value: "", label: "Tüm kutular" },
  { value: "info@denemetakip.net", label: "info@denemetakip.net" },
  { value: "kvkk@denemetakip.net", label: "kvkk@denemetakip.net" },
  { value: "admin@denemetakip.net", label: "admin@denemetakip.net" },
  { value: "admin@2eh.net", label: "admin@2eh.net" },
];

export default function MailCenterPage() {
  const [data, setData] = useState<MailResponse | null>(null);
  const [stats, setStats] = useState<MailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [itemType, setItemType] = useState("");
  const [targetInbox, setTargetInbox] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [mailCenter, mailStats] = await Promise.all([
        adminApi.getMailCenter({
          page: "1",
          limit: "50",
          itemType: itemType || undefined,
          targetInbox: targetInbox || undefined,
        }) as Promise<MailResponse>,
        adminApi.getMailCenterStats() as Promise<MailStats>,
      ]);

      setData(mailCenter);
      setStats(mailStats);
      setSelectedId((current) => current || mailCenter.items[0]?.id || "");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Mail merkezi yüklenemedi.");
      }
    } finally {
      setLoading(false);
    }
  }, [itemType, targetInbox]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedItem = useMemo(
    () => data?.items.find((item) => item.id === selectedId) || data?.items[0],
    [data, selectedId]
  );

  const handleStatusUpdate = async (item: MailItem, status: string) => {
    setActionLoading(item.id);
    try {
      if (item.itemType === "CONTACT") {
        await adminApi.updateContactStatus(item.id, status);
      }
      if (item.itemType === "DEMO") {
        await adminApi.updateDemoRequestStatus(item.id, status);
      }
      await fetchData();
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : "Durum güncellenemedi.";
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      GENERAL_INFO: "Genel Bilgi",
      KVKK_ALERT: "KVKK Uyarısı",
      SYSTEM_ADMIN: "Sistem Yönetimi",
      DEMO_REQUEST: "Demo",
      TECHNICAL_SUPPORT: "Teknik Destek",
      CAREER: "Kariyer",
      LICENSE_ALERT: "Lisans Uyarısı",
    };
    return labels[category] || category;
  };

  const getItemIcon = (item: MailItem) => {
    if (item.category === "KVKK_ALERT") return ShieldAlert;
    if (item.category === "LICENSE_ALERT") return AlertTriangle;
    if (item.category === "SYSTEM_ADMIN") return Wrench;
    return Mail;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mail Merkezi</h1>
          <p className="text-muted-foreground">
            İletişim, demo ve lisans uyarılarını tek ekrandan takip edin.
          </p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Yenile
        </Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <SummaryCard title="Toplam Kayıt" value={String(data?.total || 0)} icon={Inbox} />
          <SummaryCard
            title="KVKK Uyarıları"
            value={String(stats.categories.KVKK_ALERT || 0)}
            icon={ShieldAlert}
          />
          <SummaryCard
            title="Sistem Yönetimi"
            value={String(stats.categories.SYSTEM_ADMIN || 0)}
            icon={Wrench}
          />
          <SummaryCard
            title="Yaklaşan Lisans"
            value={String(stats.expiringLicenses || 0)}
            icon={AlertTriangle}
          />
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Kayıt tipi</label>
              <select
                className="w-full rounded-md border px-3 py-2"
                value={itemType}
                onChange={(event) => setItemType(event.target.value)}
              >
                {itemTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Hedef kutu</label>
              <select
                className="w-full rounded-md border px-3 py-2"
                value={targetInbox}
                onChange={(event) => setTargetInbox(event.target.value)}
              >
                {inboxOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <div className="flex w-full items-center gap-2 rounded-md border bg-slate-50 px-3 py-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                Gelen kayıtlar hedef adrese ve kaynağa göre kategorilenir.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {loading && !data ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Gelen Kayıtlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data?.items.length ? (
                data.items.map((item) => {
                  const Icon = getItemIcon(item);
                  return (
                    <button
                      key={`${item.itemType}-${item.id}`}
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        selectedItem?.id === item.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary" />
                          <span className="font-medium">{item.subject}</span>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                          {getCategoryLabel(item.category)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>{item.fromName}</p>
                        <p>{item.targetInbox}</p>
                        <p>{formatDate(item.createdAt)}</p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
                  Filtrelere uygun kayıt bulunamadı.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            {selectedItem ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <CardTitle>{selectedItem.subject}</CardTitle>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <p>{selectedItem.fromName}{selectedItem.fromEmail ? ` • ${selectedItem.fromEmail}` : ""}</p>
                        <p>{selectedItem.targetInbox} • {getCategoryLabel(selectedItem.category)}</p>
                        <p>{formatDate(selectedItem.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.itemType === "CONTACT" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actionLoading === selectedItem.id}
                            onClick={() => handleStatusUpdate(selectedItem, "READ")}
                          >
                            Okundu
                          </Button>
                          <Button
                            size="sm"
                            disabled={actionLoading === selectedItem.id}
                            onClick={() => handleStatusUpdate(selectedItem, "REPLIED")}
                          >
                            Yanıtlandı
                          </Button>
                        </>
                      )}
                      {selectedItem.itemType === "DEMO" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actionLoading === selectedItem.id}
                            onClick={() => handleStatusUpdate(selectedItem, "CONTACTED")}
                          >
                            İletişime Geçildi
                          </Button>
                          <Button
                            size="sm"
                            disabled={actionLoading === selectedItem.id}
                            onClick={() => handleStatusUpdate(selectedItem, "APPROVED")}
                          >
                            Onayla
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="rounded-xl border bg-slate-50 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {selectedItem.body}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <MetaCard label="Kayıt tipi" value={selectedItem.itemType} />
                    <MetaCard label="Durum" value={selectedItem.status} />
                    <MetaCard label="Kaynak kanal" value={selectedItem.sourceChannel} />
                    <MetaCard label="Kaynak sayfa" value={selectedItem.sourcePage || "-"} />
                    {selectedItem.schoolName && (
                      <MetaCard label="Okul" value={selectedItem.schoolName} />
                    )}
                    {typeof selectedItem.remainingDays === "number" && (
                      <MetaCard
                        label="Kalan süre"
                        value={`${selectedItem.remainingDays} gün`}
                      />
                    )}
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="p-12 text-center text-muted-foreground">
                Bir kayıt seçin.
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium text-slate-800">{value}</p>
    </div>
  );
}
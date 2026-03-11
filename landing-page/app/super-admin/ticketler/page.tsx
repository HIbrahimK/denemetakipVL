"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  Clock,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Ticket,
} from "lucide-react";

type TicketReply = {
  id: string;
  message: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    email?: string;
  };
};

type SupportTicket = {
  id: string;
  subject: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "ANSWERED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  school: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  replies: TicketReply[];
};

const statusOptions = [
  { value: "", label: "Tüm durumlar" },
  { value: "OPEN", label: "Açık" },
  { value: "IN_PROGRESS", label: "İşlemde" },
  { value: "ANSWERED", label: "Yanıtlandı" },
  { value: "CLOSED", label: "Kapalı" },
];

export default function TicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = (await adminApi.getAdminSupportTickets({
        status: statusFilter || undefined,
      })) as SupportTicket[];
      setTickets(result);
      setSelectedId((current) => current || result[0]?.id || "");
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Ticketler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const filteredTickets = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();
    if (!lowerSearch) {
      return tickets;
    }

    return tickets.filter((ticket) =>
      [ticket.subject, ticket.school.name, ticket.createdBy.firstName, ticket.createdBy.lastName]
        .join(" ")
        .toLowerCase()
        .includes(lowerSearch)
    );
  }, [searchTerm, tickets]);

  const selectedTicket = useMemo(
    () => filteredTickets.find((ticket) => ticket.id === selectedId) || filteredTickets[0],
    [filteredTickets, selectedId]
  );

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    setSubmitting(true);
    try {
      await adminApi.replySupportTicket(selectedTicket.id, replyMessage.trim());
      setReplyMessage("");
      await fetchTickets();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Yanıt gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (status: SupportTicket["status"]) => {
    if (!selectedTicket) return;
    setSubmitting(true);
    try {
      await adminApi.updateSupportTicketStatus(selectedTicket.id, status);
      await fetchTickets();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Ticket durumu güncellenemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(value)
    );

  const getPriorityLabel = (priority: SupportTicket["priority"]) => {
    const labels: Record<SupportTicket["priority"], string> = {
      LOW: "Düşük",
      MEDIUM: "Orta",
      HIGH: "Yüksek",
      URGENT: "Acil",
    };
    return labels[priority];
  };

  const getStatusLabel = (status: SupportTicket["status"]) => {
    const labels: Record<SupportTicket["status"], string> = {
      OPEN: "Açık",
      IN_PROGRESS: "İşlemde",
      ANSWERED: "Yanıtlandı",
      CLOSED: "Kapalı",
    };
    return labels[status];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ticket Yönetimi</h1>
          <p className="text-muted-foreground">
            Okullardan gelen destek taleplerini görüntüleyin ve yanıtlayın.
          </p>
        </div>
        <Button variant="outline" onClick={fetchTickets} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Yenile
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Toplam" value={String(tickets.length)} />
        <StatCard title="Açık" value={String(tickets.filter((ticket) => ticket.status === "OPEN").length)} />
        <StatCard title="Yanıtlandı" value={String(tickets.filter((ticket) => ticket.status === "ANSWERED").length)} />
        <StatCard title="Kapalı" value={String(tickets.filter((ticket) => ticket.status === "CLOSED").length)} />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Konu, okul veya yetkili adına göre ara"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <select
              className="rounded-md border px-3 py-2"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {loading && !tickets.length ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Destek Talepleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredTickets.length ? (
                filteredTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedId(ticket.id)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selectedTicket?.id === ticket.id ? "border-primary bg-primary/5" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="font-medium">{ticket.subject}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        {getStatusLabel(ticket.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{ticket.school.name}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{getPriorityLabel(ticket.priority)}</span>
                      <span>{formatDate(ticket.updatedAt)}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
                  Ticket bulunamadı.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            {selectedTicket ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <CardTitle>{selectedTicket.subject}</CardTitle>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <p>{selectedTicket.school.name}</p>
                        <p>
                          {selectedTicket.createdBy.firstName} {selectedTicket.createdBy.lastName} • {selectedTicket.createdBy.email}
                        </p>
                        <p>{formatDate(selectedTicket.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={submitting}
                        onClick={() => handleStatusChange("IN_PROGRESS")}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        İşleme Al
                      </Button>
                      <Button size="sm" disabled={submitting} onClick={() => handleStatusChange("CLOSED")}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Kapat
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="rounded-xl border bg-slate-50 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {selectedTicket.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="font-semibold">Yazışma Geçmişi</h2>
                    <div className="space-y-4">
                      <ReplyBubble
                        title={`${selectedTicket.createdBy.firstName} ${selectedTicket.createdBy.lastName}`}
                        subtitle={`${selectedTicket.createdBy.email} • ${formatDate(selectedTicket.createdAt)}`}
                        message={selectedTicket.description}
                        isAdmin={false}
                      />
                      {selectedTicket.replies.map((reply) => (
                        <ReplyBubble
                          key={reply.id}
                          title={`${reply.sender.firstName} ${reply.sender.lastName}`}
                          subtitle={`${reply.sender.role} • ${formatDate(reply.createdAt)}`}
                          message={reply.message}
                          isAdmin={reply.sender.role === "SUPER_ADMIN"}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <label className="mb-2 block text-sm font-medium">Yanıtınız</label>
                    <textarea
                      className="min-h-[120px] w-full rounded-md border px-3 py-2"
                      placeholder="Okula gönderilecek yanıtı yazın"
                      value={replyMessage}
                      onChange={(event) => setReplyMessage(event.target.value)}
                    />
                    <div className="mt-3 flex justify-end">
                      <Button onClick={handleReply} disabled={submitting || !replyMessage.trim()}>
                        {submitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        Yanıt Gönder
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="p-12 text-center text-muted-foreground">
                <Ticket className="mx-auto mb-4 h-10 w-10" />
                Bir ticket seçin.
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-2 text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function ReplyBubble({
  title,
  subtitle,
  message,
  isAdmin,
}: {
  title: string;
  subtitle: string;
  message: string;
  isAdmin: boolean;
}) {
  return (
    <div className="flex gap-4 rounded-xl border p-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          isAdmin ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-700"
        }`}
      >
        <MessageSquare className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-medium">{title}</span>
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        </div>
        <p className="whitespace-pre-wrap text-sm text-slate-700">{message}</p>
      </div>
    </div>
  );
}
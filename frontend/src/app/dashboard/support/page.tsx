"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Loader2,
  MessageSquare,
  PlayCircle,
  Send,
  ShieldCheck,
} from "lucide-react";
import { API_BASE_URL, getUserData } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SupportTicketReply = {
  id: string;
  message: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
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
  replies: SupportTicketReply[];
};

const guides = [
  {
    title: "İlk kurulumu tamamlayın",
    description: "Sınıf, öğrenci ve öğretmen yapılarını oluşturarak sistemin temel iskeletini kurun.",
    bullets: ["Okul ayarlarını kontrol edin", "Sınıf ve şube tanımlarını girin", "Kullanıcı hesaplarını doğrulayın"],
    icon: ShieldCheck,
  },
  {
    title: "Sınav ve çalışma planı akışı",
    description: "Deneme sınavları, mentor grupları ve çalışma planı atamalarını aynı takvimden yönetin.",
    bullets: ["Sınav takvimini yayınlayın", "Çalışma planı hedeflerini sınıf bazında atayın", "Öğrenci görev takibini kontrol edin"],
    icon: BookOpen,
  },
  {
    title: "Mesaj ve bildirim yönetimi",
    description: "Toplu mesajlar, onay akışları ve bildirim teslim durumlarını takip edin.",
    bullets: ["Mesaj şablonlarını kullanın", "Onay bekleyen mesajları inceleyin", "Bildirim teslim sorunlarını kontrol edin"],
    icon: MessageSquare,
  },
];

const videos = [
  {
    title: "Dashboard genel tur",
    description: "Ana panel, sınav takvimi ve rapor kartlarının kısa özeti.",
    screenshot: "/screenshots/dashboard.png",
  },
  {
    title: "Mobil görünüm ve günlük takip",
    description: "Mobilde görev tamamlama ve sonuç ekranlarının hızlı kullanımı.",
    screenshot: "/screenshots/mobile.png",
  },
];

export default function DashboardSupportPage() {
  const [userRole, setUserRole] = useState("");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketPriority, setTicketPriority] = useState<SupportTicket["priority"]>("MEDIUM");
  const [replyMessage, setReplyMessage] = useState("");
  const [selectedId, setSelectedId] = useState("");

  const isSchoolAdmin = userRole === "SCHOOL_ADMIN";

  const fetchTickets = useCallback(async () => {
    if (!isSchoolAdmin) return;
    setLoadingTickets(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/support/tickets/my-school`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Destek talepleri yüklenemedi.");
      }

      const result = (await response.json()) as SupportTicket[];
      setTickets(result);
      setSelectedId((current) => current || result[0]?.id || "");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Destek talepleri yüklenemedi.");
    } finally {
      setLoadingTickets(false);
    }
  }, [isSchoolAdmin]);

  useEffect(() => {
    const user = getUserData();
    setUserRole(user?.role || "");
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedId) || tickets[0],
    [tickets, selectedId]
  );

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(value)
    );

  const submitTicket = async () => {
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/support/tickets`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: ticketSubject.trim(),
          description: ticketDescription.trim(),
          priority: ticketPriority,
        }),
      });

      if (!response.ok) {
        throw new Error("Destek talebi oluşturulamadı.");
      }

      setTicketSubject("");
      setTicketDescription("");
      setTicketPriority("MEDIUM");
      await fetchTickets();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Destek talebi oluşturulamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/support/tickets/${selectedTicket.id}/replies`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage.trim() }),
      });

      if (!response.ok) {
        throw new Error("Yanıt gönderilemedi.");
      }

      setReplyMessage("");
      await fetchTickets();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Yanıt gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (status: SupportTicket["status"]) => {
    if (!selectedTicket) return;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/support/tickets/${selectedTicket.id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Ticket durumu güncellenemedi.");
      }

      await fetchTickets();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ticket durumu güncellenemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Yardım ve Destek</h1>
        <p className="mt-2 text-sm text-slate-400">
          Kullanım rehberlerini inceleyin, gerekirse okul yöneticisi olarak destek talebi açın.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="border-white/10 bg-[#26263a] text-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-cyan-300" />
              Yazılı Kullanım Rehberi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {guides.map((guide) => (
              <div key={guide.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-full bg-cyan-400/10 p-2">
                    <guide.icon className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div>
                    <h2 className="font-semibold">{guide.title}</h2>
                    <p className="text-sm text-slate-400">{guide.description}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  {guide.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-300" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#26263a] text-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-amber-300" />
              Görsel Rehber
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {videos.map((video) => (
              <div key={video.title} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <img src={video.screenshot} alt={video.title} className="h-56 w-full object-cover" />
                <div className="space-y-2 p-4">
                  <div className="flex items-center gap-2 text-amber-300">
                    <PlayCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Görsel anlatım</span>
                  </div>
                  <h2 className="font-semibold">{video.title}</h2>
                  <p className="text-sm text-slate-400">{video.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="border-white/10 bg-[#26263a] text-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-indigo-300" />
            Destek Merkezi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSchoolAdmin ? (
            <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h2 className="mb-4 font-semibold">Yeni Destek Talebi</h2>
                  <div className="space-y-3">
                    <Input
                      value={ticketSubject}
                      onChange={(event) => setTicketSubject(event.target.value)}
                      placeholder="Kısa konu başlığı"
                      className="border-white/10 bg-slate-950/40 text-slate-100"
                    />
                    <select
                      value={ticketPriority}
                      onChange={(event) => setTicketPriority(event.target.value as SupportTicket["priority"])}
                      className="w-full rounded-md border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
                    >
                      <option value="LOW">Düşük</option>
                      <option value="MEDIUM">Orta</option>
                      <option value="HIGH">Yüksek</option>
                      <option value="URGENT">Acil</option>
                    </select>
                    <textarea
                      value={ticketDescription}
                      onChange={(event) => setTicketDescription(event.target.value)}
                      placeholder="Sorunu, beklenen davranışı ve gerekiyorsa adımları yazın"
                      className="min-h-[140px] w-full rounded-md border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
                    />
                    <Button onClick={submitTicket} disabled={submitting || !ticketSubject.trim() || !ticketDescription.trim()}>
                      {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      Ticket Oluştur
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {loadingTickets ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-cyan-300" />
                    </div>
                  ) : tickets.length ? (
                    tickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => setSelectedId(ticket.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          selectedTicket?.id === ticket.id
                            ? "border-indigo-400 bg-indigo-500/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium">{ticket.subject}</span>
                          <span className="rounded-full bg-slate-900/80 px-2 py-1 text-xs text-slate-300">
                            {ticket.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-400">{formatDate(ticket.updatedAt)}</p>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
                      Henüz destek talebi oluşturulmamış.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                {selectedTicket ? (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">{selectedTicket.subject}</h2>
                        <p className="mt-2 text-sm text-slate-400">
                          {selectedTicket.school.name} • {formatDate(selectedTicket.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => updateStatus("OPEN")} disabled={submitting}>
                          Yeniden Aç
                        </Button>
                        <Button onClick={() => updateStatus("CLOSED")} disabled={submitting}>
                          Kapat
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
                      {selectedTicket.description}
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Yanıtlar</h3>
                      {selectedTicket.replies.length ? (
                        selectedTicket.replies.map((reply) => (
                          <div key={reply.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                            <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                              <span className="font-medium">
                                {reply.sender.firstName} {reply.sender.lastName}
                              </span>
                              <span className="text-slate-400">{formatDate(reply.createdAt)}</span>
                            </div>
                            <p className="text-sm text-slate-300">{reply.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
                          Henüz yanıt bulunmuyor.
                        </div>
                      )}
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <label className="mb-2 block text-sm font-medium">Yeni mesaj</label>
                      <textarea
                        value={replyMessage}
                        onChange={(event) => setReplyMessage(event.target.value)}
                        placeholder="Gelen cevaba yanıt yazın"
                        className="min-h-[120px] w-full rounded-md border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
                      />
                      <div className="mt-3 flex justify-end">
                        <Button onClick={submitReply} disabled={submitting || !replyMessage.trim()}>
                          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                          Yanıt Gönder
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-center text-slate-400">
                    <AlertCircle className="h-10 w-10" />
                    <p>Bir destek talebi seçin.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-300">
              Destek talebi açma, yanıtlama ve kapatma işlemleri yalnızca okul yöneticisi rolüne açıktır.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL, getUserData } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  CheckCircle,
  Clock,
  HelpCircle,
  LifeBuoy,
  Loader2,
  MessageSquare,
  PlayCircle,
  RefreshCw,
  Send,
  Shield,
} from "lucide-react";

type SupportReply = {
  id: string;
  message: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
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
  replies: SupportReply[];
};

const guides = [
  {
    title: "Sınav oluşturma ve yayınlama",
    description:
      "Yeni deneme tanımlama, cevap anahtarı ekleme ve öğrenci erişimini kontrol etme adımlarını takip edin.",
    icon: BookOpen,
  },
  {
    title: "Çalışma planı atama",
    description:
      "Sınıf, grup ve bireysel öğrenci bazında çalışma planı atayıp görev takibini yönetin.",
    icon: CheckCircle,
  },
  {
    title: "Mesaj ve bildirim yönetimi",
    description:
      "Okul içi mesajlaşma, onaylı gönderimler ve bildirim tercihlerini tek yerden düzenleyin.",
    icon: MessageSquare,
  },
];

const videos = [
  {
    title: "Dashboard hızlı tur",
    description: "Ana ekran, menüler ve günlük operasyon alanlarının görsel özeti.",
    image: "/screenshots/dashboard.png",
  },
  {
    title: "Mobil kullanım görünümü",
    description: "Mobil cihazlarda sonuç, görev ve bildirim akışının görsel örneği.",
    image: "/screenshots/mobile.png",
  },
];

export default function DashboardSupportPage() {
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<SupportTicket["priority"]>("MEDIUM");
  const [replyMessage, setReplyMessage] = useState("");

  const isSchoolAdmin = user?.role === "SCHOOL_ADMIN";

  const fetchTickets = useCallback(async () => {
    if (!isSchoolAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/support/tickets/my-school`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Destek talepleri yüklenemedi.");
      }

      const result = (await response.json()) as SupportTicket[];
      setTickets(result);
      setSelectedId((current) => current || result[0]?.id || "");
    } catch (fetchError: any) {
      setError(fetchError.message || "Destek talepleri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [isSchoolAdmin]);

  useEffect(() => {
    setUser(getUserData());
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedId) || tickets[0],
    [selectedId, tickets]
  );

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(value)
    );

  const createTicket = async () => {
    if (!subject.trim() || !description.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/support/tickets`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject.trim(),
          description: description.trim(),
          priority,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Destek talebi oluşturulamadı.");
      }

      setSubject("");
      setDescription("");
      setPriority("MEDIUM");
      await fetchTickets();
    } catch (createError: any) {
      setError(createError.message || "Destek talebi oluşturulamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  const addReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/support/tickets/${selectedTicket.id}/replies`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: replyMessage.trim() }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Yanıt gönderilemedi.");
      }

      setReplyMessage("");
      await fetchTickets();
    } catch (replyError: any) {
      setError(replyError.message || "Yanıt gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (status: SupportTicket["status"]) => {
    if (!selectedTicket) return;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/support/tickets/${selectedTicket.id}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Ticket durumu güncellenemedi.");
      }

      await fetchTickets();
    } catch (statusError: any) {
      setError(statusError.message || "Ticket durumu güncellenemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Yardım ve Destek Merkezi</h1>
          <p className="mt-2 text-sm text-slate-400">
            Yazılı rehberler, görsel anlatımlar ve okul yöneticisi destek talepleri tek ekranda.
          </p>
        </div>
        {isSchoolAdmin && (
          <Button variant="outline" onClick={fetchTickets} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Ticketleri yenile
          </Button>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <Card className="border-slate-800 bg-[#111827] text-slate-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-cyan-400" />
                Yazılı Kullanım Rehberi
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {guides.map((guide) => (
                <div key={guide.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                  <guide.icon className="mb-3 h-6 w-6 text-cyan-400" />
                  <h2 className="font-semibold">{guide.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{guide.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-[#111827] text-slate-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-amber-400" />
                Görsel Anlatımlar
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {videos.map((video) => (
                <div key={video.title} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                  <img src={video.image} alt={video.title} className="h-48 w-full object-cover" />
                  <div className="p-4">
                    <h2 className="font-semibold">{video.title}</h2>
                    <p className="mt-2 text-sm text-slate-400">{video.description}</p>
                    <div className="mt-3 inline-flex items-center gap-2 text-xs text-amber-300">
                      <PlayCircle className="h-4 w-4" />
                      Görsel rehber kartı
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-800 bg-[#111827] text-slate-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                Destek Politikası
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-300">
              <p>Destek taleplerini yalnızca okul yöneticileri oluşturabilir ve kapatabilir.</p>
              <p>Superadmin yanıtları bu sayfada aynı ticket akışı içinde görünür.</p>
              <p>Öğretmen, öğrenci ve veli kullanıcıları bu ekrandan rehber içeriklerini görebilir.</p>
            </CardContent>
          </Card>

          {isSchoolAdmin ? (
            <>
              <Card className="border-slate-800 bg-[#111827] text-slate-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LifeBuoy className="h-5 w-5 text-cyan-400" />
                    Yeni Ticket Oluştur
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Konu</label>
                    <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Örn: Excel import hatası" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Öncelik</label>
                    <select
                      className="w-full rounded-md border bg-slate-950 px-3 py-2 text-sm"
                      value={priority}
                      onChange={(event) => setPriority(event.target.value as SupportTicket["priority"])}
                    >
                      <option value="LOW">Düşük</option>
                      <option value="MEDIUM">Orta</option>
                      <option value="HIGH">Yüksek</option>
                      <option value="URGENT">Acil</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Açıklama</label>
                    <textarea
                      className="min-h-[120px] w-full rounded-md border bg-slate-950 px-3 py-2 text-sm"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Sorunu, etkilenen ekranı ve mümkünse tekrar üretim adımlarını yazın."
                    />
                  </div>
                  <Button onClick={createTicket} disabled={submitting || !subject.trim() || !description.trim()}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LifeBuoy className="mr-2 h-4 w-4" />}
                    Ticket Oluştur
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-[#111827] text-slate-100">
                <CardHeader>
                  <CardTitle>Mevcut Talepler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                    </div>
                  ) : tickets.length ? (
                    tickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => setSelectedId(ticket.id)}
                        className={`w-full rounded-xl border p-4 text-left transition ${
                          selectedTicket?.id === ticket.id
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-slate-800 bg-slate-900 hover:bg-slate-800/80"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{ticket.subject}</span>
                          <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-200">
                            {ticket.status}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-400">{formatDate(ticket.updatedAt)}</p>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
                      Henüz destek talebi açılmadı.
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedTicket && (
                <Card className="border-slate-800 bg-[#111827] text-slate-100">
                  <CardHeader>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <CardTitle>{selectedTicket.subject}</CardTitle>
                        <p className="mt-2 text-sm text-slate-400">{selectedTicket.school.name}</p>
                        <p className="text-xs text-slate-500">{formatDate(selectedTicket.createdAt)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={submitting} onClick={() => updateStatus("OPEN")}>
                          <Clock className="mr-2 h-4 w-4" />
                          Açık
                        </Button>
                        <Button size="sm" disabled={submitting} onClick={() => updateStatus("CLOSED")}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Kapat
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
                      {selectedTicket.description}
                    </div>
                    {selectedTicket.replies.map((reply) => (
                      <div key={reply.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                        <div className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-500">
                          <span>
                            {reply.sender.firstName} {reply.sender.lastName} • {reply.sender.role}
                          </span>
                          <span>{formatDate(reply.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-300">{reply.message}</p>
                      </div>
                    ))}
                    <div className="border-t border-slate-800 pt-4">
                      <label className="mb-1 block text-sm font-medium">Yanıtınız</label>
                      <textarea
                        className="min-h-[110px] w-full rounded-md border bg-slate-950 px-3 py-2 text-sm"
                        value={replyMessage}
                        onChange={(event) => setReplyMessage(event.target.value)}
                        placeholder="Superadmin ekibine veya mevcut ticket akışına not ekleyin."
                      />
                      <div className="mt-3 flex justify-end">
                        <Button onClick={addReply} disabled={submitting || !replyMessage.trim()}>
                          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                          Yanıt Ekle
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="border-slate-800 bg-[#111827] text-slate-100">
              <CardHeader>
                <CardTitle>Ticket Yetkisi</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-slate-300">
                Ticket oluşturma, yanıtları görüntüleme ve kapatma işlemleri yalnızca okul yöneticilerinde açıktır.
              </CardContent>
            </Card>
          )}

          {error && <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}
        </div>
      </div>
    </div>
  );
}
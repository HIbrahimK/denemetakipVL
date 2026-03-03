"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Send,
  Trash2,
} from "lucide-react";

const tickets = [
  {
    id: "#1245",
    subject: "Giriş yapamıyorum",
    description: "Öğretmen hesabımla giriş yapmaya çalışıyorum ama hata alıyorum.",
    school: "Ankara Atatürk Lisesi",
    from: "Ahmet Yılmaz",
    email: "ahmet@okul.edu.tr",
    priority: "high",
    status: "open",
    createdAt: "2024-03-15 10:30",
    replies: [],
  },
  {
    id: "#1244",
    subject: "Excel import hatası",
    description: "Öğrenci listesini yüklerken 'Format hatası' alıyorum.",
    school: "İstanbul Fen Lisesi",
    from: "Ayşe Kaya",
    email: "ayse@okul.edu.tr",
    priority: "medium",
    status: "open",
    createdAt: "2024-03-15 09:15",
    replies: [
      { from: "admin", message: "Dosyanızı kontrol ediyorum.", time: "09:30" },
    ],
  },
  {
    id: "#1243",
    subject: "Lisans yenileme",
    description: "Lisansımızın bitiş tarihi yaklaşıyor, yenileme yapmak istiyoruz.",
    school: "Bursa İmam Hatip",
    from: "Mehmet Demir",
    email: "mehmet@okul.edu.tr",
    priority: "low",
    status: "closed",
    createdAt: "2024-03-14 14:00",
    replies: [
      { from: "admin", message: "Yenileme işlemi tamamlandı.", time: "14:30" },
    ],
  },
];

export default function TicketsPage() {
  const [selectedTicket, setSelectedTicket] = useState(tickets[0]);
  const [replyMessage, setReplyMessage] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Ticket Yönetimi</h1>
        <p className="text-muted-foreground">
          Gelen destek taleplerini görüntüleyin ve yanıtlayın
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Ticketler</CardTitle>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  2 Açık
                </span>
              </div>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Ara..." className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full p-4 text-left hover:bg-muted transition-colors ${
                    selectedTicket?.id === ticket.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-medium">{ticket.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        ticket.status === "open"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {ticket.status === "open" ? "Açık" : "Kapalı"}
                    </span>
                  </div>
                  <p className="font-medium text-sm mb-1 truncate">
                    {ticket.subject}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {ticket.school}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        ticket.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : ticket.priority === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {ticket.priority === "high"
                        ? "Yüksek"
                        : ticket.priority === "medium"
                        ? "Orta"
                        : "Düşük"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {ticket.createdAt}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ticket Detail */}
        <Card className="lg:col-span-2">
          {selectedTicket ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">
                        {selectedTicket.subject}
                      </CardTitle>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          selectedTicket.status === "open"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {selectedTicket.status === "open" ? "Açık" : "Kapalı"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedTicket.school} • {selectedTicket.from} •{" "}
                      {selectedTicket.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedTicket.status === "open" ? (
                      <Button variant="outline" size="sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Kapat
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">
                        <Clock className="h-4 w-4 mr-2" />
                        Yeniden Aç
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Original Message */}
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{selectedTicket.from}</span>
                        <span className="text-sm text-muted-foreground">
                          {selectedTicket.createdAt}
                        </span>
                      </div>
                      <p className="text-muted-foreground">
                        {selectedTicket.description}
                      </p>
                    </div>
                  </div>

                  {/* Replies */}
                  {selectedTicket.replies.map((reply, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <span className="font-semibold text-green-700">A</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Admin</span>
                          <span className="text-sm text-muted-foreground">
                            {reply.time}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{reply.message}</p>
                      </div>
                    </div>
                  ))}

                  {/* Reply Input */}
                  {selectedTicket.status === "open" && (
                    <div className="border-t pt-6">
                      <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <span className="font-semibold text-green-700">A</span>
                        </div>
                        <div className="flex-1 space-y-3">
                          <textarea
                            className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                            placeholder="Yanıtınızı yazın..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                          />
                          <div className="flex justify-end">
                            <Button>
                              <Send className="h-4 w-4 mr-2" />
                              Yanıt Gönder
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Bir ticket seçin</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

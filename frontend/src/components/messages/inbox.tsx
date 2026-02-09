"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  MailOpen,
  Clock,
  AlertCircle,
  BookOpen,
  MessageSquare,
  Trash2,
  Paperclip,
  ArrowLeft,
  Star,
  Search,
  Filter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface MessageInboxProps {
  userId: string;
  schoolId: string;
}

export default function MessageInbox({ userId, schoolId }: MessageInboxProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [favoriteFilter, setFavoriteFilter] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/messages/inbox", {
        headers: {
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (messageId: string, recipientId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/messages/${messageId}`,
        {
          method: "DELETE",
          headers: {
          },
        }
      );

      if (response.ok) {
        setMessages(messages.filter((m) => m.id !== recipientId));
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const toggleFavorite = async (messageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/messages/${messageId}/favorite`,
        {
          method: "PATCH",
          headers: {
          },
        }
      );

      if (response.ok) {
        const updated = await response.json();
        setMessages(messages.map((m) => 
          m.id === updated.id ? { ...m, isFavorite: updated.isFavorite } : m
        ));
        toast({
          title: updated.isFavorite ? "Favorilere Eklendi" : "Favorilerden Çıkarıldı",
          description: updated.isFavorite 
            ? "Mesaj favorilerinize eklendi" 
            : "Mesaj favorilerinizden çıkarıldı",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Hata",
        description: "Favori durumu değiştirilemedi",
        variant: "destructive",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "EXAM":
        return <BookOpen className="h-4 w-4" />;
      case "URGENT":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "EXAM":
        return "bg-blue-100 text-blue-800";
      case "URGENT":
        return "bg-red-100 text-red-800";
      case "ANNOUNCEMENT":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "EXAM":
        return "Sınav";
      case "URGENT":
        return "Acil";
      case "ANNOUNCEMENT":
        return "Duyuru";
      case "GENERAL":
        return "Genel";
      default:
        return category;
    }
  };

  const filteredMessages = messages.filter((msg) => {
    // Read/Unread filter
    if (filter === "unread" && msg.isRead) return false;
    if (filter === "read" && !msg.isRead) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSubject = msg.message.subject.toLowerCase().includes(query);
      const matchesBody = msg.message.body.toLowerCase().includes(query);
      const matchesSender = `${msg.message.sender.firstName} ${msg.message.sender.lastName}`.toLowerCase().includes(query);
      if (!matchesSubject && !matchesBody && !matchesSender) return false;
    }

    // Category filter
    if (categoryFilter !== "all" && msg.message.category !== categoryFilter) {
      return false;
    }

    // Favorite filter
    if (favoriteFilter && !msg.isFavorite) {
      return false;
    }

    // Date filter
    if (dateFilter !== "all") {
      const messageDate = new Date(msg.message.sentAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dateFilter === "today" && daysDiff > 0) return false;
      if (dateFilter === "week" && daysDiff > 7) return false;
      if (dateFilter === "month" && daysDiff > 30) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/dashboard")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Ana Sayfa
      </Button>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Mesaj ara (başlık, içerik, gönderen)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Kategoriler</SelectItem>
            <SelectItem value="GENERAL">Genel</SelectItem>
            <SelectItem value="EXAM">Sınav</SelectItem>
            <SelectItem value="URGENT">Acil</SelectItem>
            <SelectItem value="ANNOUNCEMENT">Duyuru</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Tarih" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Zamanlar</SelectItem>
            <SelectItem value="today">Bugün</SelectItem>
            <SelectItem value="week">Son 7 Gün</SelectItem>
            <SelectItem value="month">Son 30 Gün</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={favoriteFilter ? "default" : "outline"}
          onClick={() => setFavoriteFilter(!favoriteFilter)}
          className="w-full md:w-auto"
        >
          <Star className={`h-4 w-4 mr-2 ${favoriteFilter ? "fill-current" : ""}`} />
          Favoriler
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          Tümü ({messages.length})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          onClick={() => setFilter("unread")}
        >
          Okunmamış ({messages.filter((m) => !m.isRead).length})
        </Button>
        <Button
          variant={filter === "read" ? "default" : "outline"}
          onClick={() => setFilter("read")}
        >
          Okunmuş ({messages.filter((m) => m.isRead).length})
        </Button>
      </div>

      {filteredMessages.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Henüz mesajınız yok</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredMessages.map((recipient) => (
            <Card
              key={recipient.id}
              className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                !recipient.isRead ? "bg-blue-50 dark:bg-blue-950 dark:border-blue-800" : ""
              }`}
              onClick={() =>
                router.push(`/dashboard/messages/${recipient.message.id}`)
              }
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {recipient.isRead ? (
                    <MailOpen className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getCategoryColor(recipient.message.category)}>
                      <span className="flex items-center gap-1">
                        {getCategoryIcon(recipient.message.category)}
                        {getCategoryLabel(recipient.message.category)}
                      </span>
                    </Badge>
                    {!recipient.isRead && (
                      <Badge variant="default" className="bg-blue-600">
                        Yeni
                      </Badge>
                    )}
                  </div>

                  <h3
                    className={`text-lg mb-1 ${
                      !recipient.isRead ? "font-bold" : "font-medium"
                    }`}
                  >
                    {recipient.message.subject}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Gönderen: {recipient.message.sender.firstName}{" "}
                    {recipient.message.sender.lastName}
                  </p>

                  <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2">
                    {recipient.message.body}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(recipient.message.sentAt), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </span>
                    {recipient.message._count.replies > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {recipient.message._count.replies} yanıt
                      </span>
                    )}
                    {recipient.message._count.attachments > 0 && (
                      <span className="flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        {recipient.message._count.attachments} ek
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => toggleFavorite(recipient.id, e)}
                    className="hover:bg-transparent"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        recipient.isFavorite
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-400 hover:text-yellow-400"
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(recipient.message.id, recipient.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

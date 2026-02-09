"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Mail,
  Clock,
  User,
  Reply,
  Trash2,
  Edit,
  CheckCircle2,
  Users,
  Download,
  Paperclip,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { tr } from "date-fns/locale";

import { API_BASE_URL } from "@/lib/auth";

interface MessageDetailProps {
  messageId: string;
  userId: string;
  userRole: string;
}

export default function MessageDetail({
  messageId,
  userId,
  userRole,
}: MessageDetailProps) {
  const [message, setMessage] = useState<any>(null);
  const [isRecipient, setIsRecipient] = useState(false);
  const [isSender, setIsSender] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [showReply, setShowReply] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchMessage();
  }, [messageId]);

  const fetchMessage = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/messages/${messageId}`,
        {
          headers: {
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        setIsRecipient(data.isRecipient);
        setIsSender(data.isSender);
        setIsAdmin(data.isAdmin);
      } else {
        toast({
          title: "Hata",
          description: "Mesaj yüklenemedi",
          variant: "destructive",
        });
        router.push("/dashboard/messages");
      }
    } catch (error) {
      console.error("Error fetching message:", error);
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast({
        title: "Hata",
        description: "Yanıt boş olamaz",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/messages/${messageId}/replies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: replyText }),
        }
      );

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Yanıt gönderildi",
        });
        setReplyText("");
        setShowReply(false);
        fetchMessage();
      } else {
        toast({
          title: "Hata",
          description: "Yanıt gönderilemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/messages/${messageId}`,
        {
          method: "DELETE",
          headers: {
          },
        }
      );

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Mesaj başarıyla silindi",
        });
        setTimeout(() => {
          router.push("/dashboard/messages");
        }, 1000);
      } else {
        toast({
          title: "Hata",
          description: "Mesaj silinemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const downloadDeliveryReport = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/messages/${messageId}/delivery-report`,
        {
          headers: {
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Convert to CSV
        const headers = ["Alıcı", "E-posta", "Rol", "Teslim Tarihi", "Okundu", "Okunma Tarihi"];
        const rows = data.map((r: any) => [
          r.recipientName,
          r.recipientEmail,
          r.recipientRole,
          format(new Date(r.deliveredAt), "dd.MM.yyyy HH:mm"),
          r.isRead ? "Evet" : "Hayır",
          r.readAt ? format(new Date(r.readAt), "dd.MM.yyyy HH:mm") : "-",
        ]);

        const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mesaj-raporu-${messageId}.csv`;
        a.click();

        toast({
          title: "Başarılı",
          description: "Rapor indirildi",
        });
      }
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        title: "Hata",
        description: "Rapor indirilemedi",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!message) {
    return null;
  }

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

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/dashboard/messages")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Geri
      </Button>

      {/* Message Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Badge className={getCategoryColor(message.category)}>
              {getCategoryLabel(message.category)}
            </Badge>
            <h1 className="text-2xl font-bold mt-2">{message.subject}</h1>
          </div>
          
          <div className="flex gap-2">
            {(isSender || isAdmin) && (
              <Button
                variant="outline"
                size="sm"
                onClick={downloadDeliveryReport}
              >
                <Download className="h-4 w-4 mr-2" />
                Rapor
              </Button>
            )}
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/dashboard/messages/${messageId}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Mesajı Silmek İstediğinizden Emin misiniz?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bu işlem geri alınamaz. Mesaj kalıcı olarak silinecektir.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>İptal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Sil
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {message.sender.firstName} {message.sender.lastName}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {format(new Date(message.sentAt), "dd MMMM yyyy HH:mm", { locale: tr })}
          </span>
          {message.type === "BROADCAST" && (
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {message._count?.recipients || 0} alıcı
            </span>
          )}
        </div>

        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap">{message.body}</p>
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Ekler ({message.attachments.length})
            </h3>
            <div className="space-y-2">
              {message.attachments.map((attachment: any) => (
                <a
                  key={attachment.id}
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{attachment.filename}</p>
                    <p className="text-xs text-gray-500">
                      {attachment.mimeType} • {Math.round(attachment.fileSize / 1024)} KB
                    </p>
                  </div>
                  <Download className="h-4 w-4 text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Read Receipts for Sender/Admin */}
        {(isSender || isAdmin) && message.recipients && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-3">Okunma Bilgisi</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>
                  {message.recipients.filter((r: any) => r.isRead).length} okudu
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-600" />
                <span>
                  {message.recipients.filter((r: any) => !r.isRead).length} okumadı
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span>{message.recipients.length} toplam</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Replies */}
      {message.replies && message.replies.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Yanıtlar ({message.replies.length})</h3>
          <div className="space-y-4">
            {message.replies.map((reply: any) => (
              <div key={reply.id} className="border-l-2 border-blue-500 pl-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">
                    {reply.sender.firstName} {reply.sender.lastName}
                  </span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(reply.createdAt), {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{reply.body}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Reply Section */}
      {isRecipient && message.allowReplies && (
        <Card className="p-6">
          {!showReply ? (
            <Button onClick={() => setShowReply(true)}>
              <Reply className="h-4 w-4 mr-2" />
              Yanıtla
            </Button>
          ) : (
            <div className="space-y-4">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Yanıtınızı yazın..."
                rows={4}
              />
              <div className="flex gap-2">
                <Button onClick={handleReply}>
                  <Reply className="h-4 w-4 mr-2" />
                  Gönder
                </Button>
                <Button variant="outline" onClick={() => setShowReply(false)}>
                  İptal
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

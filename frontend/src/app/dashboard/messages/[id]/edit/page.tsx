"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

export default function EditMessagePage() {
  const params = useParams();
  const messageId = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    fetchMessage();
  }, [messageId]);

  const fetchMessage = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/messages/${messageId}`,
        {
          headers: {
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubject(data.message.subject);
        setBody(data.message.body);
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

  const handleSave = async () => {
    if (!subject.trim() || !body.trim()) {
      toast({
        title: "Hata",
        description: "Konu ve içerik boş olamaz",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/messages/${messageId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subject, body }),
        }
      );

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Mesaj güncellendi",
        });
        setTimeout(() => {
          router.push(`/dashboard/messages/${messageId}`);
        }, 1000);
      } else {
        const error = await response.json();
        toast({
          title: "Hata",
          description: error.message || "Mesaj güncellenemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating message:", error);
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button
        variant="ghost"
        onClick={() => router.push(`/dashboard/messages/${messageId}`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Geri
      </Button>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Mesajı Düzenle</h1>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="subject">Konu</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Mesaj konusu"
              maxLength={200}
            />
          </div>

          <div>
            <Label htmlFor="body">İçerik</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Mesaj içeriği"
              rows={10}
              maxLength={1000}
            />
            <p className="text-sm text-gray-500 mt-1">
              {body.length} / 1000 karakter
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/messages/${messageId}`)}
            >
              İptal
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

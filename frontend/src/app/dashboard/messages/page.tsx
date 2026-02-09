"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MessageInbox from "@/components/messages/inbox";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Send, Inbox, Settings } from "lucide-react";

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const canSendMessages = ["SCHOOL_ADMIN", "TEACHER"].includes(user.role);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Mesajlar</h1>
        <div className="flex gap-2">
          {user?.role === "SCHOOL_ADMIN" && (
            <Button variant="outline" onClick={() => router.push("/dashboard/messages/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              Mesaj Ayarlarý
            </Button>
          )}
          {canSendMessages && (
            <Button onClick={() => router.push("/dashboard/messages/compose")}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Yeni Mesaj
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="inbox">
            <Inbox className="h-4 w-4 mr-2" />
            Gelen Kutusu
          </TabsTrigger>
          {canSendMessages && (
            <TabsTrigger value="sent">
              <Send className="h-4 w-4 mr-2" />
              Gönderilmiþ
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="inbox">
          <MessageInbox userId={user.userId} schoolId={user.schoolId} />
        </TabsContent>

        {canSendMessages && (
          <TabsContent value="sent">
            <SentMessages userId={user.userId} schoolId={user.schoolId} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function SentMessages({ userId, schoolId }: { userId: string; schoolId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSentMessages();
  }, []);

  const fetchSentMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("`${API_BASE_URL}/messages/sent", {
        headers: {
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching sent messages:", error);
    } finally {
      setLoading(false);
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
    <div className="space-y-2">
      {messages.map((message) => (
        <Card
          key={message.id}
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(`/dashboard/messages/${message.id}`)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium">{message.subject}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {message._count.recipients} alýcý •{" "}
                {message.recipients.filter((r: any) => r.isRead).length} okudu
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(message.sentAt).toLocaleString("tr-TR")}
              </p>
            </div>
          </div>
        </Card>
      ))}
      {messages.length === 0 && (
        <Card className="p-8 text-center text-gray-500">
          <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Henüz mesaj göndermediniz</p>
        </Card>
      )}
    </div>
  );
}

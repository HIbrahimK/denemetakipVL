"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MessageDetail from "@/components/messages/message-detail";

export default function MessageDetailPage() {
  const params = useParams();
  const messageId = params?.id as string;
  const [user, setUser] = useState<any>(null);

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

  return (
    <div className="p-6">
      <MessageDetail
        messageId={messageId}
        userId={user.userId}
        userRole={user.role}
      />
    </div>
  );
}

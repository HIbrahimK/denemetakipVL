"use client";

import { useEffect, useState } from "react";
import MessageComposer from "@/components/messages/message-composer";

export default function ComposeMessagePage() {
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
      <h1 className="text-3xl font-bold mb-6">Yeni Mesaj</h1>
      <MessageComposer userRole={user.role} schoolId={user.schoolId} />
    </div>
  );
}

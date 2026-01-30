"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Send, Save, Calendar, ArrowLeft } from "lucide-react";

interface MessageComposerProps {
  userRole: string;
  schoolId: string;
}

export default function MessageComposer({ userRole, schoolId }: MessageComposerProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [messageType, setMessageType] = useState<"DIRECT" | "BROADCAST">("DIRECT");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [targetGrade, setTargetGrade] = useState("");
  const [targetClass, setTargetClass] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [scheduledFor, setScheduledFor] = useState("");
  const [allowReplies, setAllowReplies] = useState(true);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [charCount, setCharCount] = useState(0);
  const [maxChars, setMaxChars] = useState(1000);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
    fetchGrades();
    fetchTemplates();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (targetGrade) {
      fetchClasses(targetGrade);
    } else {
      setClasses([]);
      setTargetClass("");
      setSelectedClasses([]);
    }
  }, [targetGrade]);

  useEffect(() => {
    setCharCount(body.length);
  }, [body]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/messages/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const settings = await response.json();
        setMaxChars(settings.maxCharacterLimit);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/users?schoolId=${schoolId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/schools/${schoolId}/grades`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGrades(data);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  const fetchClasses = async (gradeId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/schools/${schoolId}/grades/${gradeId}/classes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/messages/templates", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
      setCategory(template.category);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Hata",
        description: "Dosya boyutu 10MB'dan küçük olmalıdır",
        variant: "destructive",
      });
      return;
    }

    // Dosya tipi kontrolü
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Hata",
        description: "Sadece PDF, JPG, JPEG ve PNG dosyaları yüklenebilir",
        variant: "destructive",
      });
      return;
    }

    setUploadingFile(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:3001/messages/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAttachments([...attachments, {
          filename: data.filename,
          fileUrl: `http://localhost:3001${data.path}`,
          fileSize: data.size,
          mimeType: data.mimetype,
          originalname: data.originalname,
        }]);
        toast({
          title: "Başarılı",
          description: "Dosya yüklendi",
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Hata",
        description: "Dosya yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
      // Input'u temizle
      e.target.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (isDraft = false) => {
    if (!subject.trim() || !body.trim()) {
      toast({
        title: "Hata",
        description: "Konu ve mesaj içeriği boş olamaz",
        variant: "destructive",
      });
      return;
    }

    if (body.length > maxChars) {
      toast({
        title: "Hata",
        description: `Mesaj ${maxChars} karakteri aşamaz`,
        variant: "destructive",
      });
      return;
    }

    if (messageType === "DIRECT" && selectedRecipients.length === 0) {
      toast({
        title: "Hata",
        description: "Lütfen en az bir alıcı seçin",
        variant: "destructive",
      });
      return;
    }

    if (messageType === "BROADCAST" && !targetGrade && selectedClasses.length === 0 && targetRoles.length === 0) {
      toast({
        title: "Hata",
        description: "Lütfen hedef sınıf, şube veya rol seçin",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const endpoint = isDraft
        ? "http://localhost:3001/messages/drafts"
        : "http://localhost:3001/messages";

      const payload: any = {
        subject,
        body,
        category,
        type: messageType,
      };

      if (messageType === "DIRECT") {
        payload.recipientIds = selectedRecipients;
      } else {
        payload.targetRoles = targetRoles.length > 0 ? targetRoles : undefined;
        payload.targetGradeId = targetGrade || undefined;
        // Çoklu şube seçimi varsa onları kullan, yoksa tek şube
        if (selectedClasses.length > 0) {
          payload.targetClassIds = selectedClasses;
        } else if (targetClass) {
          payload.targetClassId = targetClass;
        }
      }

      if (attachments.length > 0) {
        payload.attachments = attachments;
      }

      if (scheduledFor) {
        payload.scheduledFor = new Date(scheduledFor).toISOString();
      }

      payload.allowReplies = allowReplies;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: isDraft
            ? "Mesaj taslak olarak kaydedildi"
            : scheduledFor
            ? "Mesaj zamanlandı"
            : "Mesaj başarıyla gönderildi",
        });
        
        setLoading(false);
        
        // Toast mesajının görünmesi için kısa bir bekleme
        setTimeout(() => {
          router.push("/dashboard/messages");
        }, 1500);
      } else {
        const error = await response.json();
        toast({
          title: "Hata",
          description: error.message || "Mesaj gönderilemedi",
          variant: "destructive",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
      setLoading(false);
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

      <Card className="p-6">
        <div className="space-y-6">
          {/* Template Selection */}
          {templates.length > 0 && (
            <div>
              <Label>Şablon Seç (Opsiyonel)</Label>
              <Select onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Şablon seçin" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Message Type */}
        <div>
          <Label>Mesaj Tipi</Label>
          <Select value={messageType} onValueChange={(val: any) => setMessageType(val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DIRECT">Direkt Mesaj</SelectItem>
              <SelectItem value="BROADCAST">Toplu Mesaj</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div>
          <Label>Kategori</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GENERAL">Genel</SelectItem>
              <SelectItem value="EXAM">Sınav</SelectItem>
              <SelectItem value="URGENT">Acil</SelectItem>
              <SelectItem value="ANNOUNCEMENT">Duyuru</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Recipients for Direct Messages */}
        {messageType === "DIRECT" && (
          <div>
            <Label>Alıcılar</Label>
            <Select
              onValueChange={(val) => {
                if (!selectedRecipients.includes(val)) {
                  setSelectedRecipients([...selectedRecipients, val]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Alıcı seçin" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedRecipients.map((recipientId) => {
                const user = users.find((u) => u.id === recipientId);
                return user ? (
                  <span
                    key={recipientId}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                  >
                    {user.firstName} {user.lastName}
                    <button
                      onClick={() =>
                        setSelectedRecipients(
                          selectedRecipients.filter((id) => id !== recipientId)
                        )
                      }
                      className="ml-1"
                    >
                      ×
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Broadcast Options */}
        {messageType === "BROADCAST" && (
          <>
            <div>
              <Label>Hedef Roller</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={targetRoles.includes("STUDENT")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setTargetRoles([...targetRoles, "STUDENT"]);
                      } else {
                        setTargetRoles(targetRoles.filter((r) => r !== "STUDENT"));
                      }
                    }}
                  />
                  <label>Öğrenciler</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={targetRoles.includes("PARENT")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setTargetRoles([...targetRoles, "PARENT"]);
                      } else {
                        setTargetRoles(targetRoles.filter((r) => r !== "PARENT"));
                      }
                    }}
                  />
                  <label>Veliler</label>
                </div>
              </div>
            </div>

            <div>
              <Label>Sınıf Seviyesi (Opsiyonel)</Label>
              <Select value={targetGrade} onValueChange={(val) => setTargetGrade(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm sınıflar seçilecek" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {targetGrade && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTargetGrade("")}
                  className="mt-1 text-xs"
                >
                  Sınıf seçimini temizle
                </Button>
              )}
            </div>

            {targetGrade && (
              <div>
                <Label>Şube Seçimi (Opsiyonel - Çoklu Seçim Yapabilirsiniz)</Label>
                <div className="space-y-2 mt-2 border rounded-md p-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedClasses.length === classes.length && classes.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedClasses(classes.map(c => c.id));
                        } else {
                          setSelectedClasses([]);
                        }
                      }}
                    />
                    <label className="font-semibold">Tüm Şubeler</label>
                  </div>
                  {classes.map((cls) => (
                    <div key={cls.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedClasses.includes(cls.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedClasses([...selectedClasses, cls.id]);
                          } else {
                            setSelectedClasses(selectedClasses.filter(id => id !== cls.id));
                          }
                        }}
                      />
                      <label>{cls.name} ({cls._count?.students || 0} öğrenci)</label>
                    </div>
                  ))}
                </div>
                {selectedClasses.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedClasses([])}
                    className="mt-1 text-xs"
                  >
                    Şube seçimini temizle ({selectedClasses.length} şube seçili)
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {/* Subject */}
        <div>
          <Label>Konu</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Mesaj konusu"
            maxLength={200}
          />
        </div>

        {/* Attachments */}
        <div>
          <Label>Dosya Eki (Opsiyonel)</Label>
          <div className="mt-2">
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={uploadingFile}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              PDF, JPG, JPEG veya PNG formatında, maksimum 10MB
            </p>
          </div>

          {attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              <Label className="text-sm">Yüklenmiş Dosyalar:</Label>
              {attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded border dark:border-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm dark:text-gray-200">
                      {attachment.originalname}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({Math.round(attachment.fileSize / 1024)} KB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                    className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div>
          <Label>Mesaj</Label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Mesaj içeriği"
            rows={8}
            maxLength={maxChars}
          />
          <div className="text-sm text-gray-500 mt-1">
            {charCount} / {maxChars} karakter
          </div>
        </div>

        {/* Schedule */}
        {userRole === "SCHOOL_ADMIN" && (
          <div>
            <Label>Zamanlama (Opsiyonel)</Label>
            <Input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
            />
          </div>
        )}

        {/* Allow Replies */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="allowReplies"
            checked={allowReplies}
            onCheckedChange={(checked) => setAllowReplies(checked as boolean)}
          />
          <Label htmlFor="allowReplies" className="cursor-pointer">
            Yanıtlanabilir mesaj (İşaretlenirse alıcılar yanıt yazabilir)
          </Label>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={() => handleSubmit(false)} disabled={loading}>
            <Send className="h-4 w-4 mr-2" />
            {scheduledFor ? "Zamanla" : "Gönder"}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit(true)}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Taslak Kaydet
          </Button>
          <Button variant="ghost" onClick={() => router.back()} disabled={loading}>
            İptal
          </Button>
        </div>
      </div>
    </Card>
    </div>
  );
}

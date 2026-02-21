"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, Trash2 } from "lucide-react";

type NotificationType =
  | "NEW_MESSAGE"
  | "EXAM_REMINDER"
  | "GROUP_POST"
  | "ACHIEVEMENT_UNLOCKED"
  | "STUDY_PLAN_ASSIGNED"
  | "CUSTOM";
type NotificationTargetType = "ALL" | "ROLE" | "USERS" | "GRADE" | "CLASS" | "GROUP";

const TYPE_OPTIONS: Array<{ value: NotificationType; label: string }> = [
  { value: "CUSTOM", label: "Ozel Bildirim" },
  { value: "NEW_MESSAGE", label: "Yeni Mesaj" },
  { value: "EXAM_REMINDER", label: "Deneme Hatirlatma" },
  { value: "GROUP_POST", label: "Mentor Grup Paylasimi" },
  { value: "ACHIEVEMENT_UNLOCKED", label: "Rozet Kazanimi" },
  { value: "STUDY_PLAN_ASSIGNED", label: "Calisma Plani Atamasi" },
];

const TARGET_OPTIONS: Array<{ value: NotificationTargetType; label: string }> = [
  { value: "ALL", label: "Tum Kullanici" },
  { value: "ROLE", label: "Role Gore" },
  { value: "USERS", label: "Belirli Kullanici" },
  { value: "GRADE", label: "Sinif Seviyesi" },
  { value: "CLASS", label: "Sube" },
  { value: "GROUP", label: "Mentor Grubu" },
];

const ROLE_OPTIONS = [
  { value: "SCHOOL_ADMIN", label: "Okul Yonetimi" },
  { value: "TEACHER", label: "Ogretmen" },
  { value: "STUDENT", label: "Ogrenci" },
  { value: "PARENT", label: "Veli" },
];

function base64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [permission, setPermission] = useState("default");
  const [subscriptionEndpoint, setSubscriptionEndpoint] = useState("");
  const [busy, setBusy] = useState(false);
  const [settingsBusy, setSettingsBusy] = useState(false);

  const [mySettings, setMySettings] = useState({
    enabled: true,
    newMessage: true,
    examReminder: true,
    groupPost: true,
    achievementUnlocked: true,
    studyPlanAssigned: true,
    customNotification: true,
  });
  const [myDeliveries, setMyDeliveries] = useState<any[]>([]);

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [campaignDeliveries, setCampaignDeliveries] = useState<any[]>([]);
  const [formState, setFormState] = useState({
    id: "",
    title: "",
    body: "",
    type: "CUSTOM" as NotificationType,
    targetType: "ALL" as NotificationTargetType,
    targetRoles: [] as string[],
    targetIdsText: "",
    deeplink: "/dashboard/notifications",
    scheduledFor: "",
    sendNow: false,
  });

  const canManageCampaigns =
    user?.role === "SCHOOL_ADMIN" || user?.role === "SUPER_ADMIN";
  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === selectedCampaignId) || null,
    [campaigns, selectedCampaignId],
  );

  const api = async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.message || "Islem basarisiz");
    return payload as T;
  };

  const loadMine = async () => {
    const [settings, deliveries] = await Promise.all([
      api<any>("/notifications/my-settings"),
      api<any[]>("/notifications/my-deliveries"),
    ]);
    setMySettings(settings);
    setMyDeliveries(Array.isArray(deliveries) ? deliveries : []);
  };

  const loadCampaigns = async () => {
    if (!canManageCampaigns) return;
    const data = await api<any[]>("/notifications/campaigns");
    setCampaigns(Array.isArray(data) ? data : []);
  };

  const loadCampaignDeliveries = async (campaignId: string) => {
    if (!campaignId) {
      setCampaignDeliveries([]);
      return;
    }
    const data = await api<any[]>(`/notifications/campaigns/${campaignId}/deliveries`);
    setCampaignDeliveries(Array.isArray(data) ? data : []);
  };

  const syncSubscription = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSubscriptionEndpoint("");
      return;
    }
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();
    setSubscriptionEndpoint(sub?.endpoint || "");
  };

  const initialize = async () => {
    const localUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!["SCHOOL_ADMIN", "SUPER_ADMIN"].includes(localUser?.role)) {
      router.replace("/dashboard");
      return;
    }
    setUser(localUser);
    setPermission(typeof Notification !== "undefined" ? Notification.permission : "unsupported");
    await loadMine();
    await loadCampaigns();
    await syncSubscription();
  };

  useEffect(() => {
    initialize()
      .catch((error: any) => {
        toast({
          title: "Hata",
          description: error?.message || "Bildirim verileri alinamadi",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCampaignId) return;
    loadCampaignDeliveries(selectedCampaignId).catch(() => undefined);
  }, [selectedCampaignId]);

  const saveMySetting = async (patch: Record<string, boolean>) => {
    setSettingsBusy(true);
    try {
      const updated = await api<any>("/notifications/my-settings", {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setMySettings(updated);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error?.message || "Bildirim ayari guncellenemedi",
        variant: "destructive",
      });
    } finally {
      setSettingsBusy(false);
    }
  };

  const subscribeToPush = async () => {
    setBusy(true);
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || typeof Notification === "undefined") {
        throw new Error("Bu cihaz push bildirim desteklemiyor");
      }

      let granted = Notification.permission;
      if (granted !== "granted") granted = await Notification.requestPermission();
      setPermission(granted);
      if (granted !== "granted") throw new Error("Bildirim izni verilmedi");

      const keyData = await api<{ publicKey: string }>("/notifications/public-key");
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64ToUint8Array(keyData.publicKey),
        }));

      const json = subscription.toJSON();
      await api("/notifications/subscribe", {
        method: "POST",
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
          userAgent: navigator.userAgent,
        }),
      });
      setSubscriptionEndpoint(subscription.endpoint);
      toast({ title: "Basarili", description: "Push aboneligi acildi" });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error?.message || "Push aboneligi acilamadi",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscriptionEndpoint) return;
    setBusy(true);
    try {
      await api("/notifications/unsubscribe", {
        method: "POST",
        body: JSON.stringify({ endpoint: subscriptionEndpoint }),
      });
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
      }
      setSubscriptionEndpoint("");
      toast({ title: "Basarili", description: "Push aboneligi kapatildi" });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error?.message || "Push aboneligi kapatilamadi",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const resetForm = () => {
    setFormState({
      id: "",
      title: "",
      body: "",
      type: "CUSTOM",
      targetType: "ALL",
      targetRoles: [],
      targetIdsText: "",
      deeplink: "/dashboard/notifications",
      scheduledFor: "",
      sendNow: false,
    });
  };

  const saveCampaign = async () => {
    if (!formState.title.trim() || !formState.body.trim()) {
      toast({ title: "Uyari", description: "Baslik ve icerik zorunlu", variant: "destructive" });
      return;
    }

    setBusy(true);
    try {
      const payload = {
        type: formState.type,
        targetType: formState.targetType,
        targetRoles: formState.targetRoles,
        targetIds: formState.targetIdsText
          .split(/[\n,]/)
          .map((item) => item.trim())
          .filter(Boolean),
        title: formState.title.trim(),
        body: formState.body.trim(),
        deeplink: formState.deeplink.trim() || undefined,
        scheduledFor: formState.scheduledFor
          ? new Date(formState.scheduledFor).toISOString()
          : undefined,
        sendNow: formState.sendNow,
      };

      if (formState.id) {
        await api(`/notifications/campaigns/${formState.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/notifications/campaigns", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      resetForm();
      await loadCampaigns();
      toast({ title: "Basarili", description: "Kampanya kaydedildi" });
    } catch (error: any) {
      toast({ title: "Hata", description: error?.message || "Kampanya kaydedilemedi", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const editCampaign = (campaign: any) => {
    setFormState({
      id: campaign.id,
      title: campaign.title || "",
      body: campaign.body || "",
      type: campaign.type || "CUSTOM",
      targetType: campaign.targetType || "ALL",
      targetRoles: campaign.targetRoles || [],
      targetIdsText: (campaign.targetIds || []).join(", "),
      deeplink: campaign.deeplink || "/dashboard/notifications",
      scheduledFor: campaign.scheduledFor
        ? new Date(campaign.scheduledFor).toISOString().slice(0, 16)
        : "",
      sendNow: false,
    });
  };

  const doCampaignAction = async (path: string, successMessage: string) => {
    setBusy(true);
    try {
      await api(path, { method: path.includes("/send-now") || path.includes("/cancel") ? "POST" : "DELETE" });
      await loadCampaigns();
      if (selectedCampaignId) await loadCampaignDeliveries(selectedCampaignId);
      toast({ title: "Basarili", description: successMessage });
    } catch (error: any) {
      toast({ title: "Hata", description: error?.message || "Islem basarisiz", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!canManageCampaigns) {
    return null;
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold">Bildirim Merkezi</h1>
        <p className="text-sm text-muted-foreground">Push ayarlari, bildirim gonderimi ve log arsivi</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cihaz Push Durumu</CardTitle>
            <CardDescription>Windows/mobil bildirim kaydi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant={permission === "granted" ? "default" : "secondary"}>Izin: {permission}</Badge>
              <Badge variant={subscriptionEndpoint ? "default" : "secondary"}>
                {subscriptionEndpoint ? "Abone" : "Abone Degil"}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground break-all">
              {subscriptionEndpoint || "Bu cihaz icin kayitli push aboneligi yok."}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={subscribeToPush} disabled={busy} className="w-full sm:w-auto">Push Ac</Button>
              <Button variant="outline" onClick={unsubscribeFromPush} disabled={busy || !subscriptionEndpoint} className="w-full sm:w-auto">
                Push Kapat
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kisisel Bildirim Ayarlari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              { key: "enabled", label: "Bildirimler genel olarak acik" },
              { key: "newMessage", label: "Yeni mesaj" },
              { key: "examReminder", label: "Yaklasan deneme" },
              { key: "groupPost", label: "Mentor grup paylasimi" },
              { key: "achievementUnlocked", label: "Rozet kazanimi" },
              { key: "studyPlanAssigned", label: "Calisma plani atamasi" },
              { key: "customNotification", label: "Ozel duyuru" },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-2">
                <Checkbox
                  checked={Boolean((mySettings as any)[item.key])}
                  disabled={settingsBusy}
                  onCheckedChange={(checked: boolean) => saveMySetting({ [item.key]: checked })}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      </div>

      {canManageCampaigns && (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{formState.id ? "Kampanya Duzenle" : "Yeni Bildirim Gonder"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label>Baslik</Label>
                <Input value={formState.title} onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Icerik</Label>
                <Textarea value={formState.body} rows={4} onChange={(e) => setFormState((prev) => ({ ...prev, body: e.target.value }))} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Tip</Label>
                  <Select value={formState.type} onValueChange={(value: NotificationType) => setFormState((prev) => ({ ...prev, type: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPE_OPTIONS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Hedef</Label>
                  <Select value={formState.targetType} onValueChange={(value: NotificationTargetType) => setFormState((prev) => ({ ...prev, targetType: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TARGET_OPTIONS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {formState.targetType !== "ALL" && (
                <div className="space-y-1">
                  <Label>Hedef ID</Label>
                  <Textarea value={formState.targetIdsText} rows={2} onChange={(e) => setFormState((prev) => ({ ...prev, targetIdsText: e.target.value }))} placeholder="Virgul/yeni satir ile ID girin" />
                </div>
              )}

              {(formState.targetType === "ROLE" || formState.targetType === "GROUP" || formState.targetType === "GRADE" || formState.targetType === "CLASS") && (
                <div className="space-y-2">
                  <Label>Roller</Label>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {ROLE_OPTIONS.map((role) => (
                      <label key={role.value} className="flex items-center gap-2">
                        <Checkbox
                          checked={formState.targetRoles.includes(role.value)}
                          onCheckedChange={(checked: boolean) =>
                            setFormState((prev) => ({
                              ...prev,
                              targetRoles: checked
                                ? [...new Set([...prev.targetRoles, role.value])]
                                : prev.targetRoles.filter((item) => item !== role.value),
                            }))
                          }
                        />
                        <span>{role.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Yonlendirme</Label>
                  <Input value={formState.deeplink} onChange={(e) => setFormState((prev) => ({ ...prev, deeplink: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Zamanla</Label>
                  <Input type="datetime-local" value={formState.scheduledFor} onChange={(e) => setFormState((prev) => ({ ...prev, scheduledFor: e.target.value }))} />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={formState.sendNow} onCheckedChange={(checked: boolean) => setFormState((prev) => ({ ...prev, sendNow: checked }))} />
                <span>Kaydeder kaydetmez gonder</span>
              </label>

              <div className="flex flex-wrap gap-2">
                <Button onClick={saveCampaign} disabled={busy} className="w-full sm:w-auto">
                  {formState.id ? "Guncelle" : "Kampanya Olustur"}
                </Button>
                {formState.id && (
                  <Button variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                    Formu Temizle
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gonderim Arsivi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {campaigns.length === 0 ? (
                <p className="text-sm text-muted-foreground">Henuz kampanya yok.</p>
              ) : (
                campaigns.map((campaign) => (
                  <div key={campaign.id} className="rounded-lg border p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{campaign.title}</h3>
                      <Badge variant="outline">{campaign.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{campaign.body}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedCampaignId(campaign.id)}>Loglar</Button>
                      {campaign.status !== "SENT" && campaign.status !== "CANCELLED" && (
                        <Button size="sm" onClick={() => doCampaignAction(`/notifications/campaigns/${campaign.id}/send-now`, "Kampanya gonderildi")}>
                          <Send className="mr-1 h-4 w-4" />Simdi Gonder
                        </Button>
                      )}
                      {campaign.status !== "SENT" && campaign.status !== "CANCELLED" && (
                        <Button size="sm" variant="outline" onClick={() => editCampaign(campaign)}>Duzenle</Button>
                      )}
                      {campaign.status !== "SENT" && campaign.status !== "CANCELLED" && (
                        <Button size="sm" variant="outline" onClick={() => doCampaignAction(`/notifications/campaigns/${campaign.id}/cancel`, "Kampanya iptal edildi")}>Iptal</Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => doCampaignAction(`/notifications/campaigns/${campaign.id}`, "Kampanya silindi")}>
                        <Trash2 className="mr-1 h-4 w-4" />Sil
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {canManageCampaigns && selectedCampaign && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedCampaign.title} - Teslimat Loglari</CardTitle>
          </CardHeader>
          <CardContent>
            {campaignDeliveries.length === 0 ? (
              <p className="text-sm text-muted-foreground">Log bulunamadi.</p>
            ) : (
              <div className="space-y-2">
                {campaignDeliveries.map((item) => (
                  <div key={item.id} className="rounded-md border p-2 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{item.status}</Badge>
                      <span>{item.user?.firstName || "-"} {item.user?.lastName || ""}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString("tr-TR")}
                      {item.errorMessage ? ` | Hata: ${item.errorMessage}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Kisisel Bildirim Arsivi</CardTitle>
        </CardHeader>
        <CardContent>
          {myDeliveries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henuz bildirim kaydi yok.</p>
          ) : (
            <div className="space-y-2">
              {myDeliveries.map((item) => (
                <div key={item.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold">{item.campaign?.title}</h4>
                    <Badge variant="outline">{item.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.campaign?.body}</p>
                  <div className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("tr-TR")}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

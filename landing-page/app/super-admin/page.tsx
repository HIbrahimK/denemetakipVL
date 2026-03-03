import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  School,
  Users,
  FileText,
  Ticket,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const stats = [
  {
    title: "Toplam Okul",
    value: "52",
    change: "+3",
    changeType: "positive",
    icon: School,
  },
  {
    title: "Toplam Öğrenci",
    value: "12,450",
    change: "+850",
    changeType: "positive",
    icon: Users,
  },
  {
    title: "Toplam Deneme",
    value: "145,230",
    change: "+12,400",
    changeType: "positive",
    icon: FileText,
  },
  {
    title: "Açık Ticket",
    value: "8",
    change: "-2",
    changeType: "positive",
    icon: Ticket,
  },
];

const recentSchools = [
  { name: "Ankara Atatürk Lisesi", date: "Bugün", students: 500, status: "active" },
  { name: "İstanbul Fen Lisesi", date: "Dün", students: 450, status: "active" },
  { name: "İzmir Anadolu Lisesi", date: "2 gün önce", students: 400, status: "active" },
];

const recentTickets = [
  { id: "#1245", subject: "Giriş yapamıyorum", school: "Ankara Atatürk Lisesi", priority: "high", status: "open" },
  { id: "#1244", subject: "Excel import hatası", school: "İstanbul Fen Lisesi", priority: "medium", status: "open" },
  { id: "#1243", subject: "Lisans yenileme", school: "Bursa İmam Hatip", priority: "low", status: "closed" },
];

const alerts = [
  { type: "warning", message: "3 okulun lisansı 7 gün içinde bitiyor" },
  { type: "error", message: "1 okul ödeme gecikmesi yaşıyor" },
  { type: "success", message: "2 yeni okul kaydı tamamlandı" },
];

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.changeType === "positive" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm ${
                        stat.changeType === "positive"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {stat.change} bu ay
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Schools */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Son Eklenen Okullar</CardTitle>
            <Button variant="outline" size="sm">
              Tümünü Gör
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSchools.map((school) => (
                <div
                  key={school.name}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                      {school.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{school.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {school.students} öğrenci • {school.date}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                    Aktif
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Sistem Uyarıları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    alert.type === "warning"
                      ? "bg-yellow-50"
                      : alert.type === "error"
                      ? "bg-red-50"
                      : "bg-green-50"
                  }`}
                >
                  {alert.type === "warning" ? (
                    <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />
                  ) : alert.type === "error" ? (
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  )}
                  <p
                    className={`text-sm ${
                      alert.type === "warning"
                        ? "text-yellow-700"
                        : alert.type === "error"
                        ? "text-red-700"
                        : "text-green-700"
                    }`}
                  >
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Son Ticketler</CardTitle>
          <Button variant="outline" size="sm">
            Tümünü Gör
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">ID</th>
                  <th className="text-left py-3 px-4 font-medium">Konu</th>
                  <th className="text-left py-3 px-4 font-medium">Okul</th>
                  <th className="text-left py-3 px-4 font-medium">Öncelik</th>
                  <th className="text-left py-3 px-4 font-medium">Durum</th>
                  <th className="text-left py-3 px-4 font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b">
                    <td className="py-3 px-4">{ticket.id}</td>
                    <td className="py-3 px-4">{ticket.subject}</td>
                    <td className="py-3 px-4">{ticket.school}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
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
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          ticket.status === "open"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {ticket.status === "open" ? "Açık" : "Kapalı"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm">
                        Görüntüle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

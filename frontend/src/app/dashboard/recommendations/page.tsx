import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  Target,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

export default function RecommendationsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI nerileri</h1>
        <p className="text-muted-foreground mt-1">
          Performans analizine dayal kiiselletirilmi neriler
        </p>
      </div>

      {/* Genel Durum */}
      <Card>
        <CardHeader>
          <CardTitle>Genel Performans Analizi</CardTitle>
          <CardDescription>Son 30 gnlk performansn zeti</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium">Gl Yanlar</span>
              </div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Matematik performans ykseliyor
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Dzenli alma alkanl
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Hedeflere ulama oran yksek
                </li>
              </ul>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Geliim Alanlar</span>
              </div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Fizik konularna odaklan
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  alma sresini artr
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Organik kimya eksiklikleri
                </li>
              </ul>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span className="font-medium">Acil Mdahale</span>
              </div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Trke netleri dyor
                </li>
                <li className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  3 gecikmi grev var
                </li>
                <li className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Haftalk hedef geride
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detayl neriler */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Matematik nerisi */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <CardTitle>Matematik - Devam Et!</CardTitle>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                ncelik: Orta
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Son 3 denemenin matematik net ortalamas <strong>%15 artt</strong>. Bu harika bir geliim!
              Momentum kaybetme, fonksiyonlar ve trev konularna devam et.
            </p>

            <div className="space-y-2">
              <div className="text-sm font-medium">nerilen Kaynaklar:</div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Limit Yaynlar - Fonksiyonlar Test Kitab
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Endemik Yaynlar - Trev Soru Bankas
                </li>
              </ul>
            </div>

            <Button className="w-full" variant="outline">
              <Target className="mr-2 h-4 w-4" />
              Matematik alma Plan Olutur
            </Button>
          </CardContent>
        </Card>

        {/* Fizik nerisi */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <CardTitle>Fizik - Odaklan</CardTitle>
              </div>
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                ncelik: Yksek
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Elektrik konusunda netlerini artrman gerekiyor. Son 2 denemede <strong>elektrik sorularnda %40 baar</strong> gsterdin.
              Bu konuya gnde en az 30 dakika ayr.
            </p>

            <div className="space-y-2">
              <div className="text-sm font-medium">nerilen alma Plan:</div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Elektrik akm - Temel kavramlar (2 gn)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Diren ve Ohm Kanunu (3 gn)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Karma problemler (2 gn)
                </li>
              </ul>
            </div>

            <Button className="w-full">
              <ArrowRight className="mr-2 h-4 w-4" />
              Fizik zel Plan Balat
            </Button>
          </CardContent>
        </Card>

        {/* Trke nerisi */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <CardTitle>Trke - Acil yiletir</CardTitle>
              </div>
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                ncelik: ok Yksek
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Son 3 denemede Trke netlerin <strong>%20 dt</strong>. zellikle szckte anlam ve paragraf konularnda
              zorluk yayorsun. Bu durumu tersine evirmeliyiz!
            </p>

            <div className="space-y-2">
              <div className="text-sm font-medium">Acil Aksiyonlar:</div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Gnde 20 paragraf soru z
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Szck almasna her gn 15 dakika ayr
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Haftada 2 deneme yap
                </li>
              </ul>
            </div>

            <Button className="w-full" variant="destructive">
              <ArrowRight className="mr-2 h-4 w-4" />
              Trke Younlatrlm Program Balat
            </Button>
          </CardContent>
        </Card>

        {/* Genel alma nerisi */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <CardTitle>alma Alkanlklar</CardTitle>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                ncelik: Orta
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              7 gnlk alma serine sahipsin, harika! Ancak gnlk ortalama alma sren <strong>2.5 saat</strong>.
              Hedefinize ulamak iin <strong>4 saate</strong> karman gerekiyor.
            </p>

            <div className="space-y-2">
              <div className="text-sm font-medium">neriler:</div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Pomodoro teknii kullan (25 dk al, 5 dk mola)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Sabah 07:00-09:00 aras verimli olduunu kefettik
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Grup almas motivasyonunu artryor
                </li>
              </ul>
            </div>

            <Button className="w-full" variant="outline">
              <Target className="mr-2 h-4 w-4" />
              alma Rutini Optimize Et
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

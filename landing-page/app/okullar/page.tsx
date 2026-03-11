"use client";

import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, ExternalLink, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface PublicSchool {
  id: string;
  name: string;
  appShortName: string;
  city: string | null;
  logoUrl: string | null;
  subdomainAlias: string | null;
  website: string | null;
  planName: string | null;
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<PublicSchool[]>([]);
  const [uniqueCities, setUniqueCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    api.getPublicSchoolList()
      .then((data) => {
        setSchools(data.schools);
        setUniqueCities(data.uniqueCities);
      })
      .catch(() => {
        // fallback: show empty state, no hardcoded data
        setSchools([]);
        setUniqueCities([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return schools.filter((s) => {
      const matchesSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.city && s.city.toLowerCase().includes(search.toLowerCase()));
      const matchesCity = !selectedCity || s.city === selectedCity;
      return matchesSearch && matchesCity;
    });
  }, [schools, search, selectedCity]);

  const cityCount = uniqueCities.length || 0;
  const schoolCount = schools.length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight font-heading sm:text-5xl">
                Bizi <span className="text-primary">Tercih Eden</span> Okullar
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                {schoolCount > 0
                  ? `${schoolCount}+ okul ve binlerce öğretmen bize güveniyor.`
                  : "Okullar bize güveniyor."}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-8">
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {schoolCount > 0 ? `${schoolCount}+` : "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">Okul</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">10K+</p>
                  <p className="text-sm text-muted-foreground">Öğrenci</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {cityCount > 0 ? cityCount : "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">Şehir</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Schools List */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-4xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Okul ara..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border rounded-md bg-background"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">Tüm Şehirler</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                {schools.length === 0
                  ? "Henüz kayıtlı okul bulunmuyor."
                  : "Aramanızla eşleşen okul bulunamadı."}
              </div>
            ) : (
              /* Schools Grid */
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {filtered.map((school) => {
                  const href =
                    school.website ||
                    (school.subdomainAlias
                      ? `https://${school.subdomainAlias}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "2eh.net"}`
                      : undefined);
                  return (
                    <Card key={school.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {school.logoUrl ? (
                            <img
                              src={school.logoUrl}
                              alt={school.name}
                              className="h-12 w-12 rounded-lg object-contain bg-muted shrink-0"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-lg font-bold text-primary">
                                {school.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{school.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              {school.city && (
                                <>
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  <span>{school.city}</span>
                                </>
                              )}
                              {school.planName && (
                                <>
                                  {school.city && <span>•</span>}
                                  <span className="truncate">{school.planName}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {href && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-4"
                            onClick={() => window.open(href, "_blank", "noopener,noreferrer")}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Siteyi Ziyaret Et
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Result count */}
            {!loading && filtered.length > 0 && (
              <p className="text-center text-sm text-muted-foreground mt-8">
                {filtered.length} okul gösteriliyor
                {selectedCity || search ? ` (${schools.length} okuldan)` : ""}
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

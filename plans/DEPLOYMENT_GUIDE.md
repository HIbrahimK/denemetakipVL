# Deneme Takip Sistemi — Deployment Rehberi

**Tarih:** 2026-03-05

---

## Bu Proje Paylaşımlı Hosting'te Çalışır mı?

**Hayır, standart paylaşımlı hosting'te çalışmaz.** Nedenleri:

| Gereksinim | Paylaşımlı Hosting | Bu Proje |
|---|---|---|
| Node.js runtime | Yok (sadece PHP) | NestJS + Next.js (Node.js zorunlu) |
| PostgreSQL | Genelde MySQL | PostgreSQL zorunlu (Prisma) |
| Redis | Yok | BullMQ kuyruk sistemi için gerekli |
| Port dinleme | Yasak | 3 ayrı port (3000, 3001, 3002) |
| Wildcard subdomain | Sınırlı | `*.2eh.net` Nginx ile yönlendirme |
| Persistent process | Yok | 3 sürekli çalışan servis |

---

## Hosting Gereksinimleri

### Minimum VPS/Cloud Özellikleri

| Özellik | Minimum | Önerilen |
|---|---|---|
| RAM | 2 GB | 4 GB |
| CPU | 1 vCPU | 2 vCPU |
| Disk | 20 GB SSD | 40 GB SSD |
| OS | Ubuntu 22.04+ | Ubuntu 24.04 |
| Node.js | v18+ | v20 LTS |
| Root/sudo erişimi | Evet | Evet |

### Yazılım Gereksinimleri

- **Node.js 20 LTS** (3 uygulama için)
- **PostgreSQL 16** (veritabanı)
- **Redis 7+** (BullMQ kuyrukları, cache)
- **Nginx** (reverse proxy + wildcard subdomain yönlendirme)
- **PM2** veya **Docker** (process management)
- **Certbot/Let's Encrypt** (SSL, wildcard sertifika)

---

## Önerilen Hosting Seçenekleri

| Platform | Fiyat/ay | Uygunluk | Not |
|---|---|---|---|
| **DigitalOcean Droplet** | $12-24 | ✅ En uygun | 2GB RAM droplet yeterli |
| **Hetzner Cloud** | €4-8 | ✅ Ucuz + güçlü | Avrupa DC, iyi performans |
| **Contabo VPS** | €5-10 | ✅ Ucuz | Daha yavaş disk I/O |
| **AWS Lightsail** | $10-20 | ✅ Kolay | Managed DB opsiyonu var |
| **Railway.app** | $5+ (kullanıma göre) | ⚠️ Pahalılaşabilir | PaaS, kolay deploy |
| **Vercel + Supabase** | $0-20 | ⚠️ Kısıtlı | Frontend için iyi, backend sınırlı |

---

## Veritabanı

**PostgreSQL 16** — değiştirilemez (Prisma schema PostgreSQL'e özgü özellikler kullanıyor: UUID, JSON, enum, index).

### Seçenekler

1. **Aynı VPS'te** PostgreSQL kurulumu (en ucuz, $0 ek maliyet)
2. **Managed PostgreSQL**: DigitalOcean ($15/ay), Supabase (free tier 500MB), Neon (free tier)
3. **Redis** de aynı VPS'te veya managed (Upstash free tier yeterli)

---

## Proje Mimarisi (Production)

```
2eh.net              → Nginx → Landing Page (:3002)
*.2eh.net            → Nginx → Frontend (:3000)
*/api/*              → Nginx → Backend (:3001)

┌─────────────────────────────────────────────┐
│                   Nginx                      │
│  (Reverse Proxy + SSL + Wildcard Subdomain) │
├──────────┬──────────┬───────────────────────┤
│ Landing  │ Frontend │ Backend API           │
│ :3002    │ :3000    │ :3001                 │
│ Next.js  │ Next.js  │ NestJS               │
└──────────┴──────────┴───────────┬───────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │ PostgreSQL 16  │ Redis 7+  │
                    │ :5432          │ :6379     │
                    └────────────────┴───────────┘
```

---

## En Ekonomik Production Setup

- **Hetzner/Contabo VPS** (€5-8/ay) + aynı sunucuda PostgreSQL + Redis + Nginx + Docker
- **Toplam maliyet: ~$6-10/ay**

---

## Domain Yapılandırması

### DNS Kayıtları (2eh.net için)

```
A     @           → VPS_IP_ADRESI
A     *           → VPS_IP_ADRESI    (wildcard subdomain)
CNAME www         → 2eh.net
```

### Nginx Konfigürasyonu

```nginx
# Ana domain → Landing Page
server {
    listen 80;
    server_name 2eh.net www.2eh.net;
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Wildcard subdomain → Frontend (Okul Uygulaması)
server {
    listen 80;
    server_name *.2eh.net;
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL (Let's Encrypt Wildcard)

```bash
sudo certbot certonly --dns-cloudflare \
  -d 2eh.net -d *.2eh.net \
  --dns-cloudflare-credentials /etc/cloudflare.ini
```

---

## Environment Variables (Production)

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:GUCLU_SIFRE@localhost:5432/denemetakip
REDIS_URL=redis://localhost:6379
JWT_SECRET=UZUN_RASTGELE_SECRET_KEY_DEGISTIR
CORS_ORIGINS=https://2eh.net,https://*.2eh.net
COOKIE_DOMAIN=.2eh.net
ROOT_DOMAIN=2eh.net
NODE_ENV=production
PORT=3001
```

### Frontend (.env)
```
NEXT_PUBLIC_API_URL=https://2eh.net/api
NEXT_PUBLIC_ROOT_DOMAIN=2eh.net
NODE_ENV=production
```

### Landing Page (.env)
```
NEXT_PUBLIC_API_URL=https://2eh.net/api
NEXT_PUBLIC_SITE_NAME=Deneme Takip Sistemi
NEXT_PUBLIC_SITE_DOMAIN=denemetakip.net
JWT_SECRET=AYNI_JWT_SECRET_BACKEND_ILE
NODE_ENV=production
```

---

## Hızlı Deploy Adımları (VPS + Docker)

```bash
# 1. VPS'e bağlan
ssh root@VPS_IP

# 2. Docker + Docker Compose kur
curl -fsSL https://get.docker.com | sh

# 3. Projeyi klonla
git clone https://github.com/HIbrahimK/denemetakipVL.git
cd denemetakipVL
git checkout feature/landing-page-superadmin

# 4. .env dosyalarını oluştur (yukarıdaki değerleri kullan)
nano backend/.env
nano frontend/.env
nano landing-page/.env

# 5. Docker Compose ile başlat
docker compose up -d --build

# 6. Veritabanı migration + seed
docker exec backend npx prisma migrate deploy
docker exec backend npx ts-node prisma/seed-license-plans.ts
docker exec backend npx ts-node prisma/seed-super-admin.ts

# 7. Nginx + SSL kur
sudo apt install nginx certbot python3-certbot-nginx
# nginx config dosyalarını kopyala, certbot çalıştır
```

---

## PM2 ile Deploy (Docker olmadan)

```bash
# Node.js 20 kur
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs

# PM2 kur
npm install -g pm2

# Backend
cd backend
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 start dist/main.js --name backend

# Frontend
cd ../frontend
npm ci
npm run build
pm2 start npm --name frontend -- start

# Landing Page
cd ../landing-page
npm ci
npm run build
pm2 start npm --name landing -- start

# PM2 otomatik başlatma
pm2 save
pm2 startup
```

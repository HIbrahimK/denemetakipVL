# DigitalOcean Canli Ortamda Push Anahtari Kurulumu

Bu dokuman, canli ortamda `VAPID` anahtarlarini tanimlamak icin hazirlanmistir.

## 1) VAPID anahtarlarini bir kere uret

Backend klasorunde calistir:

```bash
cd backend
npx web-push generate-vapid-keys
```

Asagidaki iki degeri not et:

- `Public Key`
- `Private Key`

## 2) Canli ortam degiskenlerini ekle

Zorunlu degiskenler:

- `VAPID_PUBLIC_KEY=BExLxyhH2me3Xm_ECkdxpLVQ2b0wJ1QRRuKoj4MeimJj7WrrKaeYPRs6HsI0d0Zo-osJuZENW80EsW6sQSs-Zw8`
- `VAPID_PRIVATE_KEY=VLQWYqeU9chPJtoSCL5XoGegcAKBV4VoI1IcvFsPuQk`
- `VAPID_SUBJECT=mailto:admin@denemetakip.net`

## 3A) DigitalOcean App Platform kullaniyorsan

1. `Apps > (uygulama) > Components > backend > Settings > Environment Variables`
2. Ustteki 3 degiskeni ekle.
3. `VAPID_PRIVATE_KEY` alanini `Secret/Encrypted` olarak kaydet.
4. `Save` ve `Deploy` ile yeniden yayinla.

## 3B) Droplet + Docker Compose kullaniyorsan

Sunucuda backend `.env` dosyasina ekle:

```env
VAPID_PUBLIC_KEY=BExLxyhH2me3Xm_ECkdxpLVQ2b0wJ1QRRuKoj4MeimJj7WrrKaeYPRs6HsI0d0Zo-osJuZENW80EsW6sQSs-Zw8
VAPID_PRIVATE_KEY=VLQWYqeU9chPJtoSCL5XoGegcAKBV4VoI1IcvFsPuQk
VAPID_SUBJECT=mailto:admin@denemetakip.net
```

Sonra backend container'i yeniden olustur:

```bash
docker compose up -d --force-recreate backend
```

## 3C) Droplet + PM2 veya systemd kullaniyorsan

1. Servis env tanimina ayni 3 degiskeni ekle.
2. Servisi restart et.

## 4) Kontrol listesi

- Backend logunda su uyari artik gorunmemeli:
  - `VAPID keys are missing`
- Uygulamada `Dashboard > Bildirimler` sayfasina git.
- `Push Ac` ile cihazi abone et.
- Test icin bir kampanya gonder.

## 5) Guvenlik notlari

- `VAPID_PRIVATE_KEY` kesinlikle frontend'e konulmaz.
- `.env` degeri repo'ya commit edilmez.
- Tek anahtar cifti tum okullar icin kullanilabilir.
- `CORS_ORIGINS` canli domainlerini kapsamalidir (exact match).

# Şifre Sıfırlama Sistemi - Sunucu Kurulum Rehberi

## 📋 Genel Bakış

DigitalOcean sunucusunda şifre sıfırlama özelliğinin çalışması için SMTP e-posta yapılandırması gereklidir.

---

## 1️⃣ Environment Değişkenlerini Ayarla

Sunucuda `backend/.env` dosyasını düzenle:

```bash
nano ~/denemetakipVL/backend/.env
```

Aşağıdaki satırları ekle/güncelle:

```env
# SMTP Email Ayarları
SMTP_HOST=smtp.gmail.com           # veya başka SMTP sunucusu
SMTP_PORT=587                       # veya 465 (SSL için)
SMTP_USER=your-email@gmail.com     # SMTP kullanıcı adı
SMTP_PASS=your-app-password        # SMTP şifresi (App Password)
SMTP_FROM="Deneme Takip <noreply@yourdomain.com>"

# Frontend URL (ÖNEMLİ!)
APP_URL=https://yourdomain.com     # Gerçek domain adresin (ör: https://denemetakip.com)
```

---

## 2️⃣ Gmail Kullanımı (Önerilen - Ücretsiz)

### Gmail App Password Oluşturma:

1. **Google Hesabına gir**: https://myaccount.google.com/
2. **Security** → **2-Step Verification** aktif et
3. **App passwords** bölümüne git
4. **Select app** → **Other (Custom name)** → "Deneme Takip" yaz
5. **Generate** butonuna tıkla
6. Oluşan **16 haneli şifreyi** kopyala

### Gmail için .env Ayarları:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourmail@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx    # 16 haneli app password (boşluklar olabilir)
SMTP_FROM="Deneme Takip Sistemi <noreply@gmail.com>"
```

---

## 3️⃣ Alternatif SMTP Servisleri

### SendGrid (Ücretsiz 100 email/gün)

1. SendGrid'e kaydol: https://sendgrid.com/
2. API Key oluştur
3. Ayarlar:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-api-key-here
SMTP_FROM="Deneme Takip <noreply@yourdomain.com>"
```

### Mailgun (Ücretsiz 5000 email/ay)

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@yourdomain.mailgun.org
SMTP_PASS=your-mailgun-smtp-password
SMTP_FROM="Deneme Takip <noreply@yourdomain.com>"
```

### AWS SES (Yüksek volume için)

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-smtp-username
SMTP_PASS=your-aws-smtp-password
SMTP_FROM="Deneme Takip <noreply@yourdomain.com>"
```

---

## 4️⃣ Veritabanı Migration Kontrolü

Sunucuda şu komutu çalıştır:

```bash
cd ~/denemetakipVL/backend
npx prisma migrate deploy
```

`PasswordResetToken` tablosunun oluşturulduğundan emin ol.

---

## 5️⃣ Firewall Ayarları

SMTP portlarını aç:

```bash
sudo ufw allow 587/tcp
sudo ufw allow 465/tcp
sudo ufw status
```

---

## 6️⃣ Backend'i Yeniden Başlat

PM2 ile çalışıyorsa:

```bash
pm2 restart denemetakip
# veya hepsini
pm2 restart all
```

Manuel çalışıyorsa:

```bash
cd ~/denemetakipVL/backend
npm run build
npm run start:prod
```

---

## 7️⃣ Sistem Testi

### Backend test endpoint'i:

```bash
curl -X POST http://localhost:3000/auth/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Gerçek şifre sıfırlama testi:

1. Frontend'den "Şifremi Unuttum" butonuna tıkla
2. E-posta adresini gir
3. E-postanı kontrol et (spam klasörüne de bak!)
4. Linke tıklayıp yeni şifre belirle

---

## 🐛 Hata Ayıklama

### Log'ları Kontrol Et:

```bash
# PM2 logs
pm2 logs denemetakip

# veya
tail -f ~/.pm2/logs/denemetakip-error.log
tail -f ~/.pm2/logs/denemetakip-out.log
```

### Yaygın Hatalar:

| Hata | Çözüm |
|------|-------|
| `ECONNREFUSED` | SMTP_HOST veya SMTP_PORT yanlış |
| `Invalid login` | SMTP_USER veya SMTP_PASS yanlış |
| `535 Authentication failed` | Gmail'de App Password kullan (normal şifre değil) |
| `Link çalışmıyor` | APP_URL'nin production domain'le eşleştiğinden emin ol |
| `E-posta gelmiyor` | Spam klasörünü kontrol et, SMTP_FROM doğru mu? |

### Debug Mode:

`email.service.ts` dosyasında geçici hata ayıklama:

```typescript
// constructor içine ekle:
console.log('SMTP Config:', {
    host: this.configService.get('SMTP_HOST'),
    port: this.configService.get('SMTP_PORT'),
    user: this.configService.get('SMTP_USER'),
    from: this.configService.get('SMTP_FROM'),
});
```

---

## ✅ Kontrol Listesi

- [ ] `.env` dosyasına SMTP ayarları eklendi
- [ ] Gmail App Password oluşturuldu (Gmail kullanılıyorsa)
- [ ] APP_URL production domain'e ayarlandı
- [ ] Firewall portları açıldı (587/465)
- [ ] Prisma migration çalıştırıldı
- [ ] Backend restart edildi
- [ ] Test e-postası gönderildi
- [ ] Gerçek şifre sıfırlama test edildi

---

## 📧 İletişim & Destek

Sorun yaşarsan log'ları kontrol et ve gerekirse:
- PM2 log dosyalarını incele
- Gmail'de "Less secure app access" kapalı olmalı (App Password kullan)
- SMTP servis sağlayıcısının dashboard'undan gönderim loglarını kontrol et

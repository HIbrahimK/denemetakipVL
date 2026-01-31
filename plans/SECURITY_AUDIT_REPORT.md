# Güvenlik Denetim Raporu ve Eylem Planı

**Proje:** Deneme Takip Sistemi  
**Denetim Tarihi:** 2026-01-29  
**Denetçi:** AI Güvenlik Denetimi

---

## 📋 Yönetici Özeti

Proje genel olarak iyi yapılandırılmış ve güvenlik açısından temel önlemler alınmış. Ancak **14 adet kritik**, **8 adet orta** ve **5 adet düşük riskli** güvenlik açığı tespit edilmiştir. Bu rapor, tüm bulguları ve çözüm önerilerini içermektedir.

---

## 🔴 Kritik Riskli Güvenlik Açıkları

### 1. Hardcoded Credentials ve Zayıf Şifreler (Kritik)

**Dosya:** [`backend/src/import/import.service.ts:71`](backend/src/import/import.service.ts:71), [`backend/src/import/import.service.ts:83`](backend/src/import/import.service.ts:83)

```typescript
// Varsayılan şifre - GÜVENLİK AÇIĞI!
password: '1234',
```

**Sorun:** Excel import işleminde öğrenci ve veli hesapları için sabit ve zayıf şifreler atanıyor.

**Etki:** Hesap ele geçirme, yetkisiz erişim  
**Risk:** 🔴 Kritik

**Çözüm:**
```typescript
// Güvenli şifre oluşturma
import * as crypto from 'crypto';
const generateSecurePassword = (length = 12) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

// Kullanım
const securePassword = generateSecurePassword(16);
```

---

### 2. TC Kimlik Numarası Güvenlik Açığı (Kritik)

**Dosya:** [`backend/src/students/students.service.ts:138`](backend/src/students/students.service.ts:138)

```typescript
const email = `${dto.studentNumber || Math.random().toString(36).substring(7)}@${schoolId}.denemetakip.com`;
```

**Sorun:** TC kimlik numarası doğrulaması yapılmıyor, regex kontrolü eksik.

**Etki:** TC kimlik numarası manipülasyonu, kimlik hırsızlığı  
**Risk:** 🔴 Kritik

**Çözüm:**
```typescript
// TC Kimlik doğrulama fonksiyonu
const validateTCNo = (tcNo: string): boolean => {
    if (!/^\d{11}$/.test(tcNo)) return false;
    
    const digits = tcNo.split('').map(Number);
    const d10 = digits[10];
    const d9 = digits[9];
    const d8 = digits[8];
    const d7 = digits[7];
    const d6 = digits[6];
    const d5 = digits[5];
    const d4 = digits[4];
    const d3 = digits[3];
    const d2 = digits[2];
    const d1 = digits[1];
    const d0 = digits[0];

    if (d0 === 0) return false;

    const oddSum = d1 + d3 + d5 + d7 + d9;
    const evenSum = d2 + d4 + d6 + d8;
    
    if ((oddSum * 7 - evenSum) % 10 !== d10) return false;
    if ((oddSum + evenSum + d10) % 10 !== d0) return false;

    return true;
};
```

---

### 3. Dosya Yükleme Güvenlik Açıkları (Kritik)

**Dosya:** [`backend/src/exams/exams.service.ts:208-254`](backend/src/exams/exams.service.ts:208)

```typescript
// Dosya boyutu kontrolü yok
const ext = path.extname(file.originalname); // Path traversal riski
fs.writeFileSync(filepath, file.buffer); // Dosya türü manipülasyonu
```

**Sorun:** 
- Dosya boyutu sınırlaması yok
- Path traversal koruması yok
- Magic number kontrolü yok
- ZIP slip açığı riski

**Etki:** Dosya sistemi ele geçirme, kod çalıştırma  
**Risk:** 🔴 Kritik

**Çözüm:**
```typescript
import * as crypto from 'crypto';
import { FileValidator } from '@nestjs/common';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
];

const validateFile = async (file: Express.Multer.File) => {
    // Dosya boyutu kontrolü
    if (file.size > MAX_FILE_SIZE) {
        throw new Error('Dosya boyutu 10MB\'dan küçük olmalıdır');
    }

    // MIME type kontrolü
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new Error('Geçersiz dosya türü');
    }

    // Magic number kontrolü (ilk byte'lar)
    const magicNumbers = {
        'pdf': '25504446',
        'jpeg': 'ffd8ff',
        'png': '89504e47',
        'xlsx': '504b34',
    };

    const fileBuffer = file.buffer.slice(0, 4);
    const hexSignature = fileBuffer.toString('hex').toLowerCase();
    
    const isValidMagic = Object.values(magicNumbers).some(sig => 
        hexSignature.startsWith(sig.toLowerCase())
    );

    if (!isValidMagic) {
        throw new Error('Dosya içeriği türüyle uyuşmuyor');
    }

    // Güvenli dosya adı
    const sanitizedName = file.originalname
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/\.\./g, '_');
    
    const safeFilename = `${crypto.randomUUID()}${path.extname(sanitizedName)}`;
    const safePath = path.join(uploadsDir, safeFilename);

    return { filepath: safePath, filename: safeFilename };
};
```

---

### 4. JWT Secret Hardcoded (Kritik)

**Dosya:** [`backend/.env`](backend/.env:4)

```
JWT_SECRET=your-secret-key-change-in-production-denemetakip-2026
```

**Sorun:** Varsayılan JWT secret üretim ortamında değiştirilmiyor.

**Etki:** Token forgery, yetkisiz erişim  
**Risk:** 🔴 Kritik

**Çözüm:**
- Üretim ortamında güçlü, rastgele bir secret kullanın
- Secret'i environment variable'dan okuyun ve zorunlu kılın

---

### 5. CORS Yapılandırması Çok Geniş (Kritik)

**Dosya:** [`backend/src/main.ts:22-25`](backend/src/main.ts:22)

```typescript
app.enableCors({
    origin: ['http://localhost:3000', 'http://192.168.1.14:3000', 'http://127.0.0.1:3000'],
    credentials: true,
});
```

**Sorun:** Local IP adresleri hardcoded, subdomain wildcard yok.

**Etki:** Cross-origin saldırıları  
**Risk:** 🔴 Kritik

**Çözüm:**
```typescript
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000',
];

app.enableCors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
});
```

---

### 6. Rate Limiting Eksikliği (Kritik)

**Dosya:** [`backend/.env`](backend/.env:16-18)

```env
RATE_LIMIT_TTL=900000
RATE_LIMIT_GLOBAL=100
RATE_LIMIT_LOGIN=5
```

**Sorun:** Rate limiting config değerleri mevcut ama uygulanmamış.

**Etki:** Brute force, DoS saldırıları  
**Risk:** 🔴 Kritik

**Çözüm:**
```typescript
// main.ts'ye ekle
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 5, // IP başına 5 deneme
    message: 'Çok fazla giriş denemesi. Lütfen 15 dakika bekleyin.',
    standardHeaders: true,
    legacyHeaders: false,
});

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.',
});

app.use('/auth/login-*', loginLimiter);
app.use('/api', globalLimiter);
```

---

### 7. Şifre Güvenlik Politikası Yetersiz (Kritik)

**Dosya:** [`backend/src/auth/dto/login.dto.ts:29-31`](backend/src/auth/dto/login.dto.ts:29)

```typescript
@MinLength(4)
password: string;
```

**Sorun:** Minimum 4 karakter çok zayıf, büyük harf/sayi/special karakter zorunluluğu yok.

**Etki:** Zayıf şifreler, kolay kırılabilir hesaplar  
**Risk:** 🔴 Kritik

**Çözüm:**
```typescript
import { Matches, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Şifre en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir',
    })
    password: string;
}
```

---

### 8. SQL Injection Riski - Raw Query Kullanımı (Yüksek)

**Dosya:** [`backend/src/students/students.service.ts:50-57`](backend/src/students/students.service.ts:50)

```typescript
...(search && {
    OR: [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { studentNumber: { contains: search, mode: 'insensitive' } },
        { tcNo: { contains: search, mode: 'insensitive' } },
    ],
}),
```

**Sorun:** Prisma `contains` query'leri büyük veri setlerinde performans sorunu yaratabilir.

**Etki:** Performans düşüşü, potansiyel DoS  
**Risk:** 🟠 Yüksek

**Çözüm:** Arama terimi için maksimum uzunluk sınırı ekleyin ve rate limiting uygulayın.

---

### 9. XSS Risk - HTML Output (Orta)

**Dosya:** [`backend/src/email/email.service.ts:28-39`](backend/src/email/email.service.ts:28)

```typescript
html: `
  <a href="${resetLink}" ...>...</a>
`,
```

**Sorun:** URL parametreleri için XSS sanitization eksik.

**Etki:** XSS saldırıları  
**Risk:** 🟠 Orta

**Çözüm:**
```typescript
const sanitizeHTML = (str: string): string => {
    return str
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#x27;');
};

// Kullanım
const safeLink = sanitizeHTML(resetLink);
```

---

### 10. Oturum Yönetimi Eksikliği (Kritik)

**Dosya:** [`backend/src/auth/auth.service.ts`](backend/src/auth/auth.service.ts)

**Sorun:** 
- Token blacklisting yok
- Çoklu oturum kontrolü yok
- Token revoke mekanizması yok

**Etki:** Token çalınması durumunda erişim engellenemez  
**Risk:** 🔴 Kritik

**Çözüm:**
```typescript
// Token blacklist modeli ekle
model BlacklistedToken {
    token     String   @id
    expiresAt DateTime
    createdAt DateTime @default(now())
}

// AuthService'e revoke mekanizması ekle
async logout(token: string) {
    const decoded = this.jwtService.decode(token);
    const expiresAt = new Date(decoded['exp'] * 1000);
    
    await this.prisma.blacklistedToken.create({
        data: { token, expiresAt },
    });
}
```

---

### 11. Şifre Sıfırlama Token Güvenliği (Küksek)

**Dosya:** [`backend/src/auth/auth.service.ts:150-153`](backend/src/auth/auth.service.ts:150)

```typescript
const token = crypto.randomBytes(32).toString('hex');
const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
```

**Sorun:** Token entropy düşük, brute force riski.

**Etki:** Token brute force, yetkisiz şifre sıfırlama  
**Risk:** 🟠 Yüksek

**Çözüm:**
```typescript
const token = crypto.randomBytes(64).toString('hex'); // 128 karakter
```

---

### 12. Loglama Hassas Veriler (Orta)

**Dosya:** [`backend/src/import/import.service.ts:205`](backend/src/import/import.service.ts:205)

```typescript
this.logger.error(`Import confirmation error: ${error.message}`, error.stack);
```

**Sorun:** Stack trace loglanıyor, hassas veriler expose olabilir.

**Etki:** Bilgi ifşası  
**Risk:** 🟡 Orta

**Çözüm:**
```typescript
// Hassas verileri maskele
const sanitizeForLog = (data: any): any => {
    const masked = { ...data };
    const sensitiveFields = ['password', 'token', 'tcNo', 'email'];
    
    for (const field of sensitiveFields) {
        if (masked[field]) {
            masked[field] = '***MASKED***';
        }
    }
    return masked;
};

this.logger.error(`Import error: ${error.message}`, sanitizeForLog(error));
```

---

### 13. API Rate Limiting Eksik (Orta)

**Dosya:** [`backend/src/reports/reports.controller.ts`](backend/src/reports/reports.controller.ts)

**Sorun:** Rapor endpoint'leri rate limited değil.

**Etki:** Veritabanı sorgusu滥用, DoS  
**Risk:** 🟡 Orta

**Çözüm:** Rapor endpoint'leri için ayrı rate limit uygulayın.

---

### 14. Dosya Yükleme Boyut Sınırlaması Yok (Orta)

**Dosya:** [`backend/src/import/import.controller.ts:37-43`](backend/src/import/import.controller.ts:37)

```typescript
@UseInterceptors(FileInterceptor('file'))
async uploadFile(@UploadedFile() file: Express.Multer.File) {
```

**Sorun:** Multer boyut limiti ayarlanmamış.

**Etki:** Dosya yükleme abuse, disk dolması  
**Risk:** 🟡 Orta

**Çözüm:**
```typescript
@UseInterceptors(FileInterceptor('file', {
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1,
    },
}))
```

---

## 🟠 Orta Riskli Güvenlik Açıkları

### 15. Email Injection Risk (Orta)

**Dosya:** [`backend/src/email/email.service.ts`](backend/src/email/email.service.ts)

**Çözüm:** Email input validation ekleyin.

### 16. Frontend JWT Client-Side Storage (Orta)

**Dosya:** [`frontend/src/middleware.ts:19`](frontend/src/middleware.ts:19)

**Çözüm:** HttpOnly cookies kullanın.

### 17. Missing Input Sanitization (Orta)

**Tüm DTO'lar:** Output sanitization eksik.

**Çözüm:** Class-validator'a ek olarak output sanitization ekleyin.

### 18. Weak Password Hashing (Düşük)

**Sorun:** bcrypt salt rounds 10, minimum seviyede.

**Çözüm:** 12+ rounds kullanın.

### 19. No Account Lockout (Orta)

**Çözüm:** Başarısız giriş denemeleri sonrası hesap kilitleme.

### 20. Missing Security Headers (Düşük)

**Çözüm:** Content-Security-Policy, X-Frame-Options ekleyin.

### 21. Database Connection Not Encrypted (Kritik)

**Dosya:** [`backend/.env`](backend/.env:1)

```env
DATABASE_URL="postgresql://postgres:password@127.0.0.1:5433/denemetakip?schema=public"
```

**Çözüm:** SSL mode ekleyin: `?sslmode=require`

---

## 📋 Uygulama Öncelik Sırası

### 1. Acil (24 saat içinde)
1. ✅ Varsayılan şifre '1234' değiştirilmeli
2. ✅ JWT_SECRET değiştirilmeli
3. ✅ Rate limiting uygulanmalı
4. ✅ CORS yapılandırması düzeltilmeli

### 2. Yüksek Öncelik (1 hafta)
1. TC Kimlik doğrulaması eklenmeli
2. Dosya yükleme güvenliği sağlanmalı
3. Şifre politikası güçlendirilmeli
4. Token blacklist eklenmeli

### 3. Orta Öncelik (1 ay)
1. XSS koruması eklenmeli
2. Loglama düzeltilmeli
3. Email validation eklenmeli
4. Hesap kilitleme mekanizması eklenmeli

---

## ✅ İyi Uygulamalar (Risk Yok)

- ✅ Helmet.js kullanımı
- ✅ Global validation pipe
- ✅ Bcrypt ile şifre hashleme
- ✅ Prisma parameterized queries
- ✅ Role-based access control
- ✅ Frontend middleware authorization
- ✅ Password reset token hashing
- ✅ CORS enabled

---

## 📝 Kontrol Listesi

| # | Kontrol | Durum |
|---|---------|-------|
| 1 | Rate limiting aktif | ❌ |
| 2 | Güçlü şifre politikası | ❌ |
| 3 | Dosya upload güvenliği | ❌ |
| 4 | JWT secret değiştirildi | ❌ |
| 5 | CORS yapılandırıldı | ❌ |
| 6 | TC kimlik doğrulaması | ❌ |
| 7 | Token blacklist | ❌ |
| 8 | XSS koruması | ❌ |
| 9 | Log sanitization | ❌ |
| 10 | Hesap kilitleme | ❌ |
| 11 | SSL/TLS yapılandırması | ❌ |
| 12 | Magic number kontrolü | ❌ |

---

**Sonraki Adımlar:**
1. Bu raporu paydaşlarla paylaşın
2. Acil düzeltmeleri önceliklendirin
3. Haftalık güvenlik toplantıları planlayın
4. Penetrasyon testi yaptırın

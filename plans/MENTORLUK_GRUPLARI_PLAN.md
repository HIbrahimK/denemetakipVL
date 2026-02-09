# Mentorluk Gruplari Detayli Plan

## Amaç
Mentorluk gruplarini; rol bazli yetkiler, hedef belirleme, grup ici paylasim panosu ve uye yonetimi ile tamamlanmis bir modül haline getirmek.

## Temel Ilkeler
- Ogrenci sadece dahil oldugu gruplari gorur, diger ogrenci detaylarina ulasamaz.
- Ogrenci uye ekleyemez, grup duzenleyemez, grup silemez, hedef olusturamaz.
- Ogretmen sadece kendi grubunu yonetebilir.
- Okul yoneticisi (SCHOOL_ADMIN/SUPER_ADMIN) tum gruplari gorebilir ve yonetebilir.
- Bir ogrenci ayni anda sadece 1 aktif mentor grubunda olabilir.
- Aktarim yapilabilir; eski uyelik leftAt ile kapatilir.

## Kapsam
- Grup listeleme, detay, olusturma, duzenleme, silme
- Uye ekleme, toplu ekleme, aktarim
- Hedef olusturma ve yonetimi (grup bazli)
- Grup ozel panosu (duyuru, dosya, hedef, calisma plani paylasimi)
- Rol bazli gorunum ve yetkilendirme

## Rol Bazli Yetkiler

### STUDENT
- /dashboard/groups: sadece uye oldugu gruplari gorur
- /dashboard/groups/[id]: grup detaylarini ve panoyu gorur
- Uye ekleme, duzenleme, silme, hedef olusturma butonlari gorunmez
- Baska ogrenci detay sayfasina link goremez

### TEACHER (Grubun ogretmeni)
- Kendi grubunu yonetebilir
- Uye ekleme / cikarabilme
- Hedef ekleme / duzenleme / silme
- Grup panosuna icerik ekleme

### SCHOOL_ADMIN / SUPER_ADMIN
- Tum gruplari gorebilir ve yonetebilir
- Grup olusturma, ogretmen atama, ogretmen degistirme
- Uye ekleme / cikarabilme / aktarim
- Hedefler ve pano yonetimi

## Ekran Akislari

### 1) Grup Listesi (/dashboard/groups)
- Ogrenci: sadece uye oldugu gruplar
- Ogretmen: sadece kendi gruplari
- Admin: tum gruplar + filtreler (ogretmen, sinif, aktiflik)

### 2) Yeni Grup (/dashboard/groups/new)
- Zorunlu alanlar: Grup adi, ogretmen, maxStudents, gradeIds
- Admin: ogretmen secimi yapabilir
- Ogretmen: ogretmen alanı otomatik kendisi

### 3) Grup Detay (/dashboard/groups/[id])
- Ogrenci: sadece goruntuleme modunda
- Ogretmen/Admin: Duzenle, Uye Ekle, Sil butonlari
- Uye listesinde ogrenci detay butonu sadece ogretmen/admin gorur

### 4) Grup Panosu (/dashboard/groups/[id]/board)
- Timeline formatinda paylasimlar
- Icerik turleri: Duyuru, Dosya, Hedef, Calisma Plani Linki
- Ogrenci: sadece goruntuleme
- Ogretmen/Admin: paylasim ekleyebilir

## Backend Gelistirmeleri

### Yetkilendirme
- groups.service.ts icinde tum yazma islemlerinde rol kontrolu
- Admin tum gruplar icin yetkili
- Ogretmen sadece kendi grubu icin yetkili
- Ogrenci sadece okuma

### Uye Tek Grup Kurali
- Yeni uye eklerken aktif uyelik kontrolu
- Aktarim endpointi ile eski uyelik leftAt set edilir

### Yeni Endpointler
- PATCH /groups/:id (duzenleme)
- DELETE /groups/:id (silme)
- POST /groups/:id/transfer (ogrenci aktarimi)
- POST /groups/:id/posts (pano icerigi ekle)
- GET /groups/:id/posts (pano icerigi liste)

## Frontend Gelistirmeleri

### Rol Bazli UI
- Ogrenci icin duzenle/uye ekle/sil butonlari gizli
- Uye detay butonu ogrenciye gosterilmez

### Grup Duzenleme Ekrani
- Ogretmen degistirme alanı (sadece admin)
- maxStudents guncellenebilir

### Grup Panosu
- Timeline UI
- Icerik kartlari: duyuru, dosya, hedef, calisma plani
- Dosya yuklemede boyut ve tip kontrolu

## Veri Modeli Notlari
- groupMembership leftAt ile gecmis uyelikler saklanir
- MentorGroup maxStudents sınırı aktif tutulur

## Asama Asama Uygulama Plani

### Asama 1: Yetki ve UI Temizlik
- Rol bazli buton gizleme
- Backend rol kontrolu

### Asama 2: Grup Duzenleme ve Silme
- Duzenleme sayfasi
- Silme islemi

### Asama 3: Uye Aktarim Mekanizmasi
- Tek grup kuralı
- Aktarim endpointi ve UI

### Asama 4: Hedef Yonetimi
- Hedef CRUD
- Hedef gosterimi

### Asama 5: Grup Panosu
- Pano tablosu ve endpointler
- Timeline UI

## Kabul Kriterleri
- Ogrenci yetkisiz butonlari gormez
- Ogretmen sadece kendi grubunu yonetir
- Admin tum gruplari yonetir
- Ogrenci sadece kendi grubundaki uyeleri gorur ama detay sayfasina gidemez
- Ayni ogrenci iki gruba ayni anda eklenemez
- Grup panosu ogrenciye gorunur, sadece yetkili kullanici icerik ekleyebilir

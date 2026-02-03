HATALAR: 
1- http://localhost:3000/dashboard/study-plans/settings sayfasında ayarları kaydetme düğmesine bastığımda Failed to load resource: the server responded with a status of 404 (Not Found) ::3001/schools/cml306eou0000ud34ddzx3z0q:1 hatası alıyorum. page.tsx:80 
 PATCH http://localhost:3001/schools/cml306eou0000ud34ddzx3z0q 404 (Not Found)
handleSave	@	page.tsx:80

2- Ders konu yönetimine her ders için Branş Denemesi eklensin (Matematik Branş Denemesi, Türkçe Branş Denemesi, vb.) Ayrıca matematik konu tekrar Türkçe konu tekrarı gibi eklemeler yapalım. Aktiviteler alanında MEBi DENEMESİ, TYT DENEMESİ, AYT DENEMESİ, MSÜ DENEMESİ gibi eklemeler yapalım. Bunları da ders konu yönetimine ekleyelim.

3- Plan Atama kısmında önce sınıflar listelensin, sınıf seçildiğinde o sınıftaki öğrenciler listelensin, öğrenci seçildiğinde o öğrenciye plan atansın. Sınıfa atama yaparken sınıf seviyeleri görüntülenmiyor. Sınıf seviyesi ve şube seçimi birlikte olsun. Şubedeki tüm öğrencilere plan atama seçeneği olsun. Sınıf seviyesindeki tüm öğrencilere plan atama seçeneği olsun. Atama modülünde önce sınıf seviyesi sonra şube sçimi sonra öğrenci seçimi olsun. Bireysel öğrenci arama ve atama kısmı Metörlük guruplarından sonra olsun. 

4- Görevleri öğretmende onaylayabilsin. veli onaylamadıysa öğretmende onaylayabilsin.  Öğretmen onaylarsa görev tamamlanmış sayılsın.

5- Plan kartında kimlere atandığı yazsın. (Sınıf (8. sınıflar, 12-A/B/C gibi), Tüm 11. sınıflar, A Grubu, Çok mentörlük gurubuysa (A Grubu, B Grubu, C Grubu gibi veya X sayıda Gurup gibi) Tek öğrenciyse ismi, Çok öğrenciyse X Sayıda Öğrenci)
6- haftalık planda hedef Soru, zaman , kitap ismi girildiyse yazsın. 
7- Öğretmen Dersten bağımsız plan kartı oluşturabilsin. Örneğin o kısma Güzel Bir Söz yazabilsin. 
8 - Şablondan Düzenlenemiyor. Yeni çalışma planı oluştur deyince sınıf seviyesi seçmeye gerek yok. Şablonu kopyalamadanda düzenleyebilim. Atanmış planlarıda düzenleyebilmek isterim. Atandıktan sonrada düzenlme olsun.
9. Atama yaparken belli bir tarih seçiyoruz. Şablonun başlama tarihi. (Şubat 2. hafta gibi) ancak herzaman 1 Ocak 1970 tarihinde başlıyor gözüküyor. Hafta Başlangıcı 01 Oca 1970 bu hatayıda giderelim. 
10. Öğrenci planı açtığında görevleri görüyor ancak öğretmen tarafından belirlenmiş görev hedeflerini göremiyor.  
11. yeni şablon oluştur düğmesi metnini yeni çalışma Planı hazırla yazamsı daha mantıklı.
12. plan oluşturma aşamasında ki ders seçilip konu seçilirken Konular Hiyerarşik olarak gelsin. (Örneğin Matematik -> Sayılar -> Rasyonel Sayılar gibi) Aynı Select içinde alt konulmar başında boşluklarla belirtilsin. (madde 7 deki gibi burada hiç bir ders veya konu seçimi yapmadan direk metin girişi yapabilsin.)
13. http://localhost:3000/dashboard/groups/7986a756-4507-40f6-92b7-320cfd5195d3 sayfasında mentör gurup detay penceresinde Üye Ekle düğmesi çalışmıyor.Üye ekleme işlemi sınıf şube seçimi sonrasında burada bulunan öğrenciler listelenecek. onlardan seçilecek.
14. http://localhost:3000/dashboard/groups/7986a756-4507-40f6-92b7-320cfd5195d3 sayfasında mentör gurup detay penceresinde Düzenle düğmesi çalışmıyor. hedef belirleme için düğme bile yok. Burayı inceleyip hedef belirleme işlemini daha mantıklı bir arayüzle düzenleyelim. veritabanında bu konu nasıl işleniyor bak. 
15. 
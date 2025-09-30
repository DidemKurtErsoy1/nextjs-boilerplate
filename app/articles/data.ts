export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;      // ISO
  body: string;      // düz metin/markdown-vari
  tags?: string[];
};

export const articles: Article[] = [
  {
    slug: "6-9-ay-ek-gida-baslangici",
    title: "🥣 6–9 Ay Ek Gıdaya Başlangıç",
    excerpt:
      "Kaşıkla tanıştırma, doku geçişleri ve alerji penceresi için kısa rehber.",
    date: "2025-09-30",
    body: `• Tek bileşenli ve pütürlü kıvamlarla başlayın; kaşıkla oturur pozisyonda.
• Her gün 1–2 yeni gıda deneyin; döküntü, kusma, nefes darlığı gibi alerji belirtilerini izleyin.
• Demirden zengin gıdalara öncelik verin (et/tavuk, yumurta, yoğurt).
• Süt yerine su teklif edin; bal 12 aydan önce verilmez.
• Bebeğin işaretlerini izleyin: ağzı kapatma, baş çevirme = doymuştur.`,
    tags: ["ek gıda", "6-9 ay"],
  },
  {
    slug: "bebeklerde-atesi-yonetmek",
    title: "🌡️ Bebeklerde Ateşi Yönetmek (Kısa Rehber)",
    excerpt: "Evde ne yapılır, ne zaman endişelenmeli, kırmızı bayraklar.",
    date: "2025-09-30",
    body: `• Ölçüm yöntemi tutarlı olsun (koltukaltı/kulak); aynı cihazı tercih edin.
• İnce giydirin, bol sıvı teklif edin, serin ve havadar ortam sağlayın.
• 3 aydan küçükte ≥38°C, 40°C+ ateş, morarma/nefes darlığı = ACİL değerlendirme.
• İlaç/doz için kendi doktorunuza danışın; burada doz verilmez.`,
    tags: ["ateş", "acil"],
  },
  {
    slug: "siddetli-oksuruk-ne-zaman-doktora",
    title: "🤧 Şiddetli Öksürük: Ne Zaman Doktora?",
    excerpt:
      "Gece artan öksürük, hırıltı, beslenememe ve nefes işaretleri için pratik kontrol listesi.",
    date: "2025-09-30",
    body: `• Oda nemini artırın; buhar cihazını güvenli mesafede kullanın.
• Burun tıkalıysa serum fizyolojik ile temizleyin, sık sık kısa süreli emzirme/sıvı verin.
• Hırıltı, göğüste çekilme, morarma, hızlı soluk alıp verme = derhal sağlık kuruluşu.
• 3 günden uzun süren, uykuyu/öğünü bozan öksürükte hekim görüşü alın.`,
    tags: ["solunum", "öksürük"],
  },
  {
    slug: "dis-cikarma-belirtileri",
    title: "🦷 Diş Çıkarma Belirtileri ve Rahatlatma",
    excerpt:
      "Salya artışı, elleri ısırma normal; ateş ve ishal başka neden olabilir.",
    date: "2025-09-30",
    body: `• Soğutulmuş (donmamış) diş kaşıyıcılar rahatlatabilir.
• Salya cildi tahriş ederse sıkça silip bariyer krem kullanın.
• 38°C üzeri ateş dişten çok enfeksiyon kaynaklı olabilir; tabloya göre değerlendirilmeli.
• Sert gıdalarla boğulma riski oluşturmayın.`,
    tags: ["diş", "konfor"],
  },
  {
    slug: "gaz-ve-kolik-yatistirma",
    title: "🌀 Gaz & Kolik: Yatıştırma Taktikleri",
    excerpt: "Saatli ağlamalar, karnı rahatlatma ve rutinlerle destek.",
    date: "2025-09-30",
    body: `• Kucağa alıp dik pozisyonda gezdirin; beyaz gürültü ve kundak (güvenli) işe yarayabilir.
• Karnı saat yönünde hafifçe ovma, bisiklet hareketleri rahatlatır.
• Emzirme tekniği/pozisyonu için destek alın; sık sık gaz çıkarın.
• Kusmaya eşlik eden kilo kaybı, safra kusması, tepkisizlik = tıbbi değerlendirme.`,
    tags: ["gaz", "kolik"],
  },
  {
    slug: "bebek-uykusu-0-6-ay",
    title: "🌙 Bebek Uykusu (0–6 Ay) — Nazik Rutin",
    excerpt:
      "Gündüz/gece ayrımı, uykululuk pencereleri ve güvenli uyku ortamı.",
    date: "2025-09-30",
    body: `• 0–3 ayda kısa uyanıklık pencereleri: 45–90 dk; aşırı uyarılmayı azaltın.
• Karanlık, serin oda; düz ve sert yatak; yüzüstü yatırmayın.
• Yatmadan önce sakin akış: alt değişimi → loş ışık → beslenme → ninni.
• Horlama, apne, terleme ve beslenememe varsa hekime danışın.`,
    tags: ["uyku", "0-6 ay"],
  },
  {
    slug: "kabizlikta-ne-yapmali",
    title: "🍐 Kabızlıkta Ne Yapmalı? (6 Ay+)",
    excerpt:
      "Sıvı ve lif desteği, tuvalet rutini ve ne zaman yardım alınacağı.",
    date: "2025-09-30",
    body: `• 6 ay sonrası: su teklifi ve liften zengin püreler (armut, kayısı, erik).
• Karın masajı ve ilk tuvalet saatini rutine bağlamak yardımcı olur.
• Dışkıda kan, şiddetli karın ağrısı, kilo alımında durma = hekime başvurun.
• Posalı gıdaları yavaşça artırın; hızlı yükleme karın ağrısı yapabilir.`,
    tags: ["kabızlık", "beslenme"],
  },
  {
    slug: "ishalda-sivi-takibi",
    title: "🥤 İshalde Sıvı Takibi ve Uyarı İşaretleri",
    excerpt:
      "Susuzluk riskini azaltma ve evde izlem; tehlike işaretleri.",
    date: "2025-09-30",
    body: `• Küçük yudumlarla sık sık su/anne sütü; iştah zorlamayın.
• Gözyaşı azlığı, idrar azalması, ağız kuruluğu, halsizlik = susuzluk işareti olabilir.
• 6 aydan küçük bebekte, kanlı ishalde veya ateş eşlik ediyorsa hekime başvurun.
• Probiyotik/ilaç kullanımı için hekiminize danışın.`,
    tags: ["ishal", "sıvı"],
  },
  {
    slug: "asi-sonrasi-bakim",
    title: "💉 Aşı Sonrası Bakım: Ne Normaldir?",
    excerpt:
      "Hafif ateş, huzursuzluk ve aşı yerinde hassasiyet beklenebilir.",
    date: "2025-09-30",
    body: `• Aşı yerini temiz ve kuru tutun; hafif kızarıklık/sertlik günler içinde azalır.
• Sıvı/anne sütünü artırın; nazikçe sakinleştirin.
• 39°C üzeri ateş, yaygın döküntü, tepkisizlik, nefes darlığı = acil değerlendirme.
• Analjezik/ateş düşürücü kullanımı için kendi doktorunuza danışın.`,
    tags: ["aşı", "bakım"],
  },
  {
    slug: "pisik-onleme",
    title: "🧴 Pişik Önleme & Bakım",
    excerpt:
      "Sık alt değişimi, nazik temizlik ve bariyer kremlerle koruma.",
    date: "2025-09-30",
    body: `• Her alt değişiminde ılık suyla nazikçe temizleyin; ovalamayın, tamponlayın.
• Cildi kuru bırakıp çinko oksitli bariyer krem sürün.
• İnatçı, sızıntılı, mantar şüphesi olan döküntüde hekim değerlendirmesi alın.
• Islak mendillerde parfüm/alkolden kaçınmak hassas ciltte faydalıdır.`,
    tags: ["pişik", "cilt"],
  },
  {
    slug: "yaz-gunes-ve-sicak",
    title: "☀️ Yazın Güneş ve Sıcakla Güvenli Kalmak",
    excerpt:
      "Gölge, şapka, ince kıyafet ve doğru saatlerde dışarıda olmak.",
    date: "2025-09-30",
    body: `• 6 ay altı: direkt güneşten kaçının; gölge ve ince, uzun kollu kıyafetler.
• 6 ay üstü: geniş kenarlı şapka + uygun SPF'li güneş koruyucu (hekim önerisiyle).
• Sıcak çarpması işaretleri: halsizlik, ciltte kızarıklık, hızlı nefes; serinletin ve gerekirse sağlık kuruluşuna başvurun.
• Arabada gölgede bile yalnız bırakmayın.`,
    tags: ["yaz", "güneş"],
  },
  {
    slug: "seyahat-bebekle",
    title: "🧳 Bebekle Seyahat: Hazırlık Listesi",
    excerpt:
      "Biberon/atıştırmalık, yedek kıyafet, ıslak mendil ve mini ilk yardım.",
    date: "2025-09-30",
    body: `• Yedek kıyafet, bez, ıslak mendil, atıştırmalık, termometre ve temel bakım ürünleri.
• Uykuyu kolaylaştıran küçük rutin/oyuncakları yanınıza alın.
• Emniyet koltuğu kurulumunu yola çıkmadan kontrol edin.
• Gideceğiniz yerdeki sağlık imkânlarını ve iletişim numaralarını not edin.`,
    tags: ["seyahat", "checklist"],
  },
  {
    slug: "kisin-grip-rsv",
    title: "🧣 Kışın Grip/RSV: Korunma ve İzlem",
    excerpt:
      "El hijyeni, kalabalıktan kaçınma ve riskli belirtileri tanıma.",
    date: "2025-09-30",
    body: `• El yıkama ve kalabalık ortamlardan kaçınma önemlidir; hasta kişilerle yakın teması sınırlayın.
• Beslenme/ıslak bez takibini sürdürün; azalma risk göstergesi olabilir.
• Nefes darlığı, morarma, beslenememe, 3 aydan küçükte ateş = tıbbi değerlendirme.
• İlaç/spreylere kendi başınıza başlamayın; hekiminize danışın.`,
    tags: ["kış", "solunum"],
  },
];

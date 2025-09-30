// app/articles/data.ts
export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  body: string; // basit düz metin; istersen sonra markdown'a geçeriz
};

export const articles: Article[] = [
  {
    slug: 'oksurukte-evde-bakim',
    title: 'Bebeklerde Öksürük: Evde Ne Yapmalı?',
    excerpt: 'Odayı nemli/serin tutmak, burun temizliği ve sıvı alımı genelde yeterlidir.',
    body:
`• Odayı serin ve nemli tutun; sigara dumanından uzak durun.
• Burun tıkalıysa serum fizyolojik + nazal aspiratör işe yarar.
• Bol sıvı teklif edin; yüksek yastık verme 12 aydan küçükte uygun değildir.
• 12 aydan küçükte bal vermeyin.

Ne zaman doktora?
• Nefes darlığı/çekilme, morarma, beslenememe, 3+ gün yüksek ateş, inatçı kusma.`
  },
  {
    slug: 'ates-yonetimi',
    title: 'Ateş Yönetimi: Ne Zaman Endişelenmeli?',
    excerpt: 'Ölçüm tekniği ve genel durumu takip edin; 3 aydan küçükte ≥38°C acildir.',
    body:
`• Ateşi güvenilir termometre ile ölçün; fazla giydirmeyin.
• Ilık duş önerilmez; soğuk uygulama/alkollü ovma yapmayın.
• Bol sıvı; bebek rahatsa oyun/uyku düzenine izin verin.

Acil uyarı:
• 3 aydan küçük bebekte ≥38°C; ≥40°C; nefes darlığı, morarma, bilinç değişikliği.`
  },
  {
    slug: 'ek-gidaya-baslama-6-9-ay',
    title: '6–9 Ay Ek Gıdaya Başlama',
    excerpt: 'Anne sütü temel; ek gıdaya küçük porsiyonlar ve tek tek gıdalarla başlayın.',
    body:
`• Anne sütü/formül devam; ek gıda +1 öğün ile başlayıp arttırın.
• Püre/kıvamlı gıdaları tek tek deneyin; alerji bulgularını izleyin.
• Boğulma riski olan parçalı sert gıdalardan kaçının.`
  }
];

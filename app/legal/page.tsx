export default function LegalPage() {
  return (
    <main style={{ maxWidth: 820, margin: "24px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Hukuki Bilgilendirme</h1>

      <section style={{ lineHeight: 1.6, opacity: 0.92 }}>
        <h3>⚠️ Tıbbi Tavsiye Değildir</h3>
        <p>
          BabyQ, genel bilgilendirme amaçlıdır; tanı koymaz, ilaç/doz önermez. Acil belirtilerde 112’yi arayın
          veya en yakın sağlık kuruluşuna başvurun.
        </p>

        <h3 style={{ marginTop: 20 }}>Gizlilik</h3>
        <p>
          Sorularınız kısa süreli olarak sistem günlüklerinde tutulabilir. Kişisel veri talep etmiyoruz.
          Dilerseniz silme talebinde bulunabilirsiniz.
        </p>

        <h3 style={{ marginTop: 20 }}>Sorumluluk Reddi</h3>
        <p>
          Platformun kullanımından doğan sonuçlardan kullanıcı sorumludur. Özel durumlar için doktorunuza başvurun.
        </p>
      </section>
    </main>
  );
}

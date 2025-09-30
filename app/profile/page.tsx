'use client';

import { useEffect, useMemo, useState } from 'react';

type Profile = { baby_name: string; birth_date: string };

const LS_KEY = 'babyq_profile_v1';

function monthsBetween(birthISO: string) {
  if (!birthISO) return 0;
  const b = new Date(birthISO);
  const now = new Date();
  let m = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) m -= 1;
  return Math.max(0, m);
}

export default function ProfilePage() {
  const [babyName, setBabyName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [saved, setSaved] = useState(false);

  // localStorage'dan yükle
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Profile;
        setBabyName(p.baby_name || '');
        setBirthDate(p.birth_date || '');
      }
    } catch {}
  }, []);

  const ageMonths = useMemo(() => monthsBetween(birthDate), [birthDate]);

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    const p: Profile = { baby_name: babyName.trim(), birth_date: birthDate };
    localStorage.setItem(LS_KEY, JSON.stringify(p));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <main style={{ maxWidth: 820, margin: '40px auto', padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Profil</h1>
      <p style={{ opacity: .75, marginTop: 6 }}>
        Bebeğin bilgilerini gir; <strong>yaş (ay)</strong> soru formunda otomatik dolacak.
      </p>

      <form onSubmit={onSave} style={{ display: 'grid', gap: 12, marginTop: 16, maxWidth: 520 }}>
        <label>
          Bebek adı (opsiyonel)
          <input
            value={babyName}
            onChange={(e) => setBabyName(e.target.value)}
            placeholder="Örn. Defne"
            style={{ width: '100%', padding: 10, marginTop: 6 }}
          />
        </label>

        <label>
          Doğum tarihi
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            style={{ width: '100%', padding: 10, marginTop: 6 }}
            required
          />
        </label>

        <div style={{ opacity: .85 }}>
          Hesaplanan yaş: <strong>{ageMonths}</strong> ay
        </div>

        <button
          type="submit"
          style={{ padding: '12px 14px', background: '#111', color: '#fff', borderRadius: 8, border: 0, cursor: 'pointer' }}
        >
          Kaydet
        </button>

        {saved && <div style={{ color: 'green' }}>Kaydedildi ✓</div>}
      </form>
    </main>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';

type Profile = { baby_name: string; birth_date: string };
const LS_KEY = 'babyq_profile_v1';

function monthsBetween(birthISO: string) {
  if (!birthISO) return 0;
  const b = new Date(birthISO); const now = new Date();
  let m = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) m -= 1;
  return Math.max(0, m);
}

export default function ProfilePage() {
  const [babyName, setBabyName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [saved, setSaved] = useState(false);

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
    <main style={{ maxWidth: 820, margin: '24px auto', padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Profile</h1>
      <p style={{ opacity: .75, marginTop: 6 }}>
        Enter your baby’s info. <strong>Age (months)</strong> will auto-fill on the Ask page.
      </p>

      <form onSubmit={onSave} style={{ display: 'grid', gap: 12, marginTop: 16, maxWidth: 520 }}>
        <label>
          Baby’s name (optional)
          <input
            value={babyName}
            onChange={(e) => setBabyName(e.target.value)}
            placeholder="e.g. Daisy"
            style={{ width: '100%', padding: 10, marginTop: 6, border:'1px solid #E5E7EB', borderRadius:12 }}
          />
        </label>

        <label>
          Date of birth
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            style={{ width: '100%', padding: 10, marginTop: 6, border:'1px solid #E5E7EB', borderRadius:12 }}
            required
          />
        </label>

        <div style={{ opacity: .85 }}>
          Calculated age: <strong>{ageMonths}</strong> months
        </div>

        <button
          type="submit"
          style={{ padding: '12px 14px', background: '#111', color: '#fff', borderRadius: 12, border: 0, cursor: 'pointer' }}
        >
          Save
        </button>

        {saved && <div style={{ color: 'green' }}>Saved ✓</div>}
      </form>
    </main>
  );
}

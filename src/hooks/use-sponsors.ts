'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Sponsor } from '@/types/sponsor';

export function useSponsors() {
  const [allSponsors, setAllSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'sponsors'), (snap) => {
      setAllSponsors(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Sponsor)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const sponsors = useMemo(() =>
    allSponsors.filter((s) => s.activo).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)),
    [allSponsors]
  );

  return { sponsors, loading };
}

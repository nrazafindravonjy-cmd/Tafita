import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { searchMadagascar, type GeocodeResult } from '@/lib/geocode';
import type { PlaceMarker } from '@/lib/places';

export type SearchPick = { kind: 'tafita'; place: PlaceMarker } | { kind: 'osm'; result: GeocodeResult };

type MapSearchProps = { places: PlaceMarker[]; onPick: (pick: SearchPick) => void };

function normalize(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function MapSearch({ places, onPick }: MapSearchProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'searching' | 'empty' | 'error'>('idle');

  // Tafita places are already loaded, so they filter live while typing.
  const needle = normalize(query.trim());
  const tafitaMatches = needle
    ? places.filter((place) => normalize(`${place.name} ${place.region ?? ''}`).includes(needle)).slice(0, 5)
    : [];

  async function search() {
    if (query.trim().length < 2) return;
    setStatus('searching');
    try {
      const found = await searchMadagascar(query.trim(), i18n.language);
      setResults(found);
      setStatus(found.length || tafitaMatches.length ? 'idle' : 'empty');
    } catch {
      setStatus('error');
    }
  }

  function pick(selection: SearchPick) {
    onPick(selection);
    setOpen(false);
  }

  if (!open) {
    return (
      <button type="button" aria-label={t('map.search.open')} style={styles.iconButton} onClick={() => setOpen(true)}>
        🔍
      </button>
    );
  }

  return (
    <div style={styles.panel}>
      <form
        style={styles.row}
        onSubmit={(event) => {
          event.preventDefault();
          search();
        }}>
        <input
          autoFocus
          type="search"
          value={query}
          placeholder={t('map.search.placeholder')}
          style={styles.input}
          onChange={(event) => {
            setQuery(event.target.value);
            setResults([]);
            setStatus('idle');
          }}
        />
        <button type="submit" style={styles.submit}>
          {t('map.search.submit')}
        </button>
        <button type="button" aria-label={t('place.close')} style={styles.close} onClick={() => setOpen(false)}>
          ✕
        </button>
      </form>
      {tafitaMatches.map((place) => (
        <button key={place.id} type="button" style={styles.result} onClick={() => pick({ kind: 'tafita', place })}>
          <strong>{place.name}</strong> · Tafita
        </button>
      ))}
      {results.map((result) => (
        <button
          key={`${result.lat},${result.lng},${result.name}`}
          type="button"
          style={styles.result}
          onClick={() => pick({ kind: 'osm', result })}>
          {result.name}
        </button>
      ))}
      {status !== 'idle' && <div style={styles.status}>{t(`map.search.${status}`)}</div>}
    </div>
  );
}

const styles = {
  iconButton: {
    position: 'absolute',
    top: 48,
    left: 10,
    width: 36,
    height: 36,
    border: 'none',
    borderRadius: 8,
    background: '#ffffff',
    boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    fontSize: 16,
  },
  panel: {
    position: 'absolute',
    top: 48,
    left: 10,
    right: 56,
    maxWidth: 420,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: 8,
    borderRadius: 12,
    background: '#ffffff',
    color: '#000000',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
  },
  row: { display: 'flex', gap: 6 },
  input: { flex: 1, minWidth: 0, padding: '6px 10px', border: '1px solid #d4d4d8', borderRadius: 8, fontSize: 16 },
  submit: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: 8,
    background: '#0F766E',
    color: '#ffffff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  close: { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16 },
  result: {
    textAlign: 'left',
    padding: '6px 8px',
    border: 'none',
    borderRadius: 6,
    background: '#f4f4f5',
    color: '#000000',
    cursor: 'pointer',
    fontSize: 14,
  },
  status: { padding: '4px 8px', fontSize: 14, color: '#52525b' },
} satisfies Record<string, React.CSSProperties>;

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { glassCss } from '@/constants/glass';
import { searchMadagascar, type GeocodeResult } from '@/lib/geocode';
import type { PlaceMarker } from '@/lib/places';
import { loadSearchIndex, normalize, searchIndex } from '@/lib/search-index';

export type SearchPick = { kind: 'tafita'; place: PlaceMarker } | { kind: 'osm'; result: GeocodeResult };

type MapSearchProps = { places: PlaceMarker[]; onPick: (pick: SearchPick) => void; top: number };

export function MapSearch({ places, onPick, top }: MapSearchProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'searching' | 'empty' | 'error'>('idle');
  const [index, setIndex] = useState<Awaited<ReturnType<typeof loadSearchIndex>>>([]);

  useEffect(() => {
    if (open) loadSearchIndex().then(setIndex);
  }, [open]);

  // Tafita places are already loaded, so they filter live while typing.
  const needle = normalize(query.trim());
  const tafitaMatches = needle
    ? places.filter((place) => normalize(`${place.name} ${place.region ?? ''}`).includes(needle)).slice(0, 5)
    : [];
  const indexMatches = searchIndex(index, query);

  // Enter searches full addresses, which the offline index does not contain.
  async function search() {
    if (query.trim().length < 2) return;
    setStatus('searching');
    try {
      const found = await searchMadagascar(query.trim(), i18n.language);
      setResults(found);
      setStatus(found.length || tafitaMatches.length || indexMatches.length ? 'idle' : 'empty');
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
      <button type="button" style={{ ...styles.bar, top }} onClick={() => setOpen(true)}>
        <Search size={18} strokeWidth={2.4} aria-hidden />
        <span>{t('map.search.placeholder')}</span>
      </button>
    );
  }

  return (
    <div style={{ ...styles.panel, top }}>
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
      {results.length === 0 &&
        indexMatches.map((place) => (
          <button
            key={`${place.lat},${place.lng},${place.name}`}
            type="button"
            style={styles.result}
            onClick={() => pick({ kind: 'osm', result: place })}>
            <strong>{place.name}</strong> · {t(`map.kinds.${place.kind}`, { defaultValue: place.kind.replaceAll('_', ' ') })}
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
  // Always visible, so searching needs one tap instead of finding an icon first.
  bar: {
    position: 'absolute',
    left: 12,
    right: 12,
    maxWidth: 460,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    border: 'none',
    borderRadius: 999,
    ...glassCss,
    color: '#D7DECB',
    fontSize: 16,
    fontFamily: 'BricolageGrotesque_500Medium, sans-serif',
    textAlign: 'left',
    cursor: 'text',
  },
  panel: {
    position: 'absolute',
    left: 12,
    right: 12,
    maxWidth: 460,
    zIndex: 5,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: 8,
    borderRadius: 22,
    ...glassCss,
  },
  row: { display: 'flex', gap: 6 },
  input: {
    flex: 1,
    minWidth: 0,
    padding: '6px 10px',
    border: '1px solid rgba(255, 246, 230, 0.2)',
    borderRadius: 999,
    background: 'rgba(255, 246, 230, 0.1)',
    color: '#FFF6E6',
    fontSize: 16,
    fontFamily: 'BricolageGrotesque_400Regular, sans-serif',
  },
  submit: {
    padding: '6px 14px',
    border: 'none',
    borderRadius: 999,
    background: '#60D42D',
    color: '#1E3A12',
    fontFamily: 'BricolageGrotesque_700Bold, sans-serif',
    cursor: 'pointer',
  },
  close: { border: 'none', background: 'transparent', color: '#FFF6E6', cursor: 'pointer', fontSize: 16 },
  result: {
    textAlign: 'left',
    padding: '6px 8px',
    border: 'none',
    borderRadius: 12,
    background: 'rgba(255, 246, 230, 0.08)',
    color: '#FFF6E6',
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: 'BricolageGrotesque_400Regular, sans-serif',
  },
  status: { padding: '4px 8px', fontSize: 14, color: '#D7DECB' },
} satisfies Record<string, React.CSSProperties>;

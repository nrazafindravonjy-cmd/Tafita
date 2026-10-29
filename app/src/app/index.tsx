import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PlacesMap } from '@/components/places-map';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { fetchPlaceMarkers, type PlaceMarker } from '@/lib/places';

export default function MapScreen() {
  const { t } = useTranslation();
  const [places, setPlaces] = useState<PlaceMarker[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetchPlaceMarkers()
      .then(setPlaces)
      .catch(() => setFailed(true));
  }, []);

  return (
    <Screen title={t('map.title')} subtitle={t('map.subtitle')}>
      {failed && <ThemedText themeColor="textSecondary">{t('common.loadError')}</ThemedText>}
      <PlacesMap places={places} />
    </Screen>
  );
}

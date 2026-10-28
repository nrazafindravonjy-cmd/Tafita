import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/screen';

export default function MapScreen() {
  const { t } = useTranslation();
  return <Screen title={t('map.title')} subtitle={t('map.subtitle')} />;
}

import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/screen';

export default function DiscoverScreen() {
  const { t } = useTranslation();
  return <Screen title={t('discover.title')} subtitle={t('discover.subtitle')} />;
}

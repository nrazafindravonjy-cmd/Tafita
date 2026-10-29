import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { neon } from '@/lib/neon';

type Category = { id: number; slug: string; name_fr: string; name_en: string };

export default function DiscoverScreen() {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    neon
      .from('categories')
      .select('id, slug, name_fr, name_en')
      .order('id')
      .then(({ data, error }) => {
        if (error) setFailed(true);
        else setCategories((data ?? []) as Category[]);
      });
  }, []);

  return (
    <Screen title={t('discover.title')} subtitle={t('discover.subtitle')}>
      {failed && <ThemedText themeColor="textSecondary">{t('common.loadError')}</ThemedText>}
      {categories.map((category) => (
        <ThemedText key={category.id}>
          {i18n.language === 'en' ? category.name_en : category.name_fr}
        </ThemedText>
      ))}
    </Screen>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Field } from '@/components/form';
import { ReportButton } from '@/components/report-button';
import { ThemedText } from '@/components/themed-text';
import { Brand, Colors, Spacing } from '@/constants/theme';
import { neon } from '@/lib/neon';
import { answerQuestion, askQuestion, fetchQuestions, type Question } from '@/lib/questions';

// Visitors ask, people who know the place answer.
export function PlaceQuestions({ placeId }: { placeId: string }) {
  const { t } = useTranslation();
  const signedIn = Boolean(neon.auth.useSession().data?.user);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [draft, setDraft] = useState('');
  const [answering, setAnswering] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchQuestions(placeId).then(setQuestions, () => {});
  }, [placeId]);

  useEffect(load, [load]);

  async function run(action: () => Promise<void>, reset: () => void) {
    setError(null);
    try {
      await action();
      reset();
      load();
    } catch {
      setError(t('questions.tooShort'));
    }
  }

  return (
    <View style={styles.wrap}>
      <ThemedText type="smallBold" style={styles.heading}>
        {t('questions.title')}
      </ThemedText>
      {questions.length === 0 && <ThemedText type="small" themeColor="textSecondary">{t('questions.empty')}</ThemedText>}
      {questions.map((question) => (
        <View key={question.id} style={styles.question}>
          <ThemedText type="smallBold">{question.body}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">@{question.author?.username ?? '?'}</ThemedText>
          {question.answers.map((answer) => (
            <View key={answer.id} style={styles.answer}>
              <ThemedText type="small">{answer.body}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">@{answer.author?.username ?? '?'}</ThemedText>
              <ReportButton target="answer" targetId={answer.id} />
            </View>
          ))}
          <View style={styles.footer}>
            {signedIn && (
              <Pressable accessibilityRole="button" onPress={() => setAnswering(answering === question.id ? null : question.id)}>
                <ThemedText type="smallBold" style={styles.link}>{t('questions.answer')}</ThemedText>
              </Pressable>
            )}
            <ReportButton target="question" targetId={question.id} />
          </View>
          {answering === question.id && (
            <View style={styles.form}>
              <Field placeholder={t('questions.answerPlaceholder')} value={reply} onChangeText={setReply} multiline maxLength={1000} />
              <Button
                label={t('questions.send')}
                onPress={() => run(() => answerQuestion(question.id, reply), () => { setReply(''); setAnswering(null); })}
              />
            </View>
          )}
        </View>
      ))}
      {signedIn ? (
        <View style={styles.form}>
          <Field placeholder={t('questions.askPlaceholder')} value={draft} onChangeText={setDraft} multiline maxLength={500} />
          <Button secondary label={t('questions.ask')} onPress={() => run(() => askQuestion(placeId, draft), () => setDraft(''))} />
        </View>
      ) : (
        <ThemedText type="small" themeColor="textSecondary">{t('questions.signIn')}</ThemedText>
      )}
      {error && <ThemedText type="small" style={styles.error}>{error}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.two },
  heading: { fontSize: 18, lineHeight: 24 },
  question: { gap: Spacing.half, paddingVertical: Spacing.two, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.dark.backgroundSelected },
  answer: { gap: 2, marginLeft: Spacing.three, paddingLeft: Spacing.three, borderLeftWidth: 2, borderLeftColor: Brand.green },
  footer: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start' },
  link: { color: Brand.green },
  form: { gap: Spacing.two },
  error: { color: Brand.danger },
});

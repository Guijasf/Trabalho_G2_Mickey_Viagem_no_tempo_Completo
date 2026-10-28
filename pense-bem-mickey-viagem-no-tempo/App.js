import React, { useReducer, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Modal, StatusBar, useWindowDimensions, Platform } from 'react-native';
import { PROGRAMS } from './data';
import { PAGES } from './pages';
import { gameReducer } from './engine';

const OPTIONS = [
  { key: 'A', name: 'Vermelho', color: '#DB5545' },
  { key: 'B', name: 'Amarelo', color: '#E8B83D' },
  { key: 'C', name: 'Azul', color: '#427CAA' },
  { key: 'D', name: 'Verde', color: '#3C986C' },
];

const SECRET_CODES = { ELO: '151', HISTORIA: '152', INVENTOS: '153', AMERICAS: '154', EGITO: '155', ORIGINAL: null };
const THEMES = {
  '151': { name: 'Pré-história', era: 'EXPEDIÇÃO PRÉ-HISTÓRICA', page: 5, background: '#F0F6EE', ink: '#244438', muted: '#4F6D5E', accent: '#38694B', soft: '#DDEBDD', line: '#ADC7B0', highlight: '#AB573F' },
  '152': { name: 'Extremo Oriente', era: 'ROTA DO EXTREMO ORIENTE', page: 11, background: '#F9F5F2', ink: '#3D3234', muted: '#69595B', accent: '#A53F39', soft: '#F4E6DD', line: '#D7B5A9', highlight: '#9B453A' },
  '153': { name: 'Era das invenções', era: 'OFICINA DO TEMPO', page: 17, background: '#EDF4F6', ink: '#263D48', muted: '#516873', accent: '#97513A', soft: '#DEE9EC', line: '#B3C9D0', highlight: '#A25034' },
  '154': { name: 'Américas', era: 'CAMINHOS DAS AMÉRICAS', page: 23, background: '#F0F7F1', ink: '#2C4638', muted: '#557263', accent: '#287754', soft: '#DAEDDF', line: '#AFCFB9', highlight: '#B45D37' },
  '155': { name: 'Egito Antigo', era: 'ÀS MARGENS DO NILO', page: 29, background: '#ECF6F4', ink: '#1D4244', muted: '#4C696B', accent: '#9A6628', soft: '#D9ECE8', line: '#A6C9C4', highlight: '#9A6628' },
};

function Action({ label, onPress, outline = false, disabled = false, theme }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.action, theme && { backgroundColor: theme.accent }, outline && styles.outline, outline && theme && { borderColor: theme.accent, backgroundColor: 'transparent' }, (pressed || disabled) && styles.dim]}>
    <Text style={[styles.actionText, outline && styles.outlineText, outline && theme && { color: theme.accent }]}>{label}</Text>
  </Pressable>;
}

export default function App() {
  const [game, dispatch] = useReducer(gameReducer, null);
  const [screen, setScreen] = useState('home');
  const [zoom, setZoom] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [themeCode, setThemeCode] = useState(null);
  const secret = useRef({ armed: false, buffer: '', lastKey: 0 });
  const { width } = useWindowDimensions();
  const scroll = useRef(null);
  const question = game?.program.questions[game.index];
  const pending = question?.answer == null;
  const theme = THEMES[themeCode];
  const start = (program) => { dispatch({ type: 'START', program }); setScreen('play'); scroll.current?.scrollTo({ y: 0, animated: false }); };
  const next = () => {
    if (game.index === 29) setScreen('result');
    dispatch({ type: 'NEXT' });
    scroll.current?.scrollTo({ y: 0, animated: false });
  };
  const correct = game?.history.filter((entry) => entry.correct).length || 0;

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKeyDown = (event) => {
      if (event.target?.closest?.('input, textarea, [contenteditable="true"]') || event.ctrlKey || event.altKey || event.metaKey || event.repeat) return;
      if (event.key === 'Shift') {
        if (!secret.current.armed || Date.now() - secret.current.lastKey > 6000) secret.current = { armed: true, buffer: '', lastKey: Date.now() };
        return;
      }
      const state = secret.current;
      if (!state.armed) return;
      if (Date.now() - state.lastKey > 6000 || !/^[a-z]$/i.test(event.key)) {
        secret.current = { armed: false, buffer: '', lastKey: 0 };
        return;
      }
      const buffer = state.buffer + event.key.toUpperCase();
      if (Object.prototype.hasOwnProperty.call(SECRET_CODES, buffer)) {
        setThemeCode(SECRET_CODES[buffer]);
        secret.current = { armed: false, buffer: '', lastKey: 0 };
      } else if (Object.keys(SECRET_CODES).some((code) => code.startsWith(buffer))) {
        secret.current = { armed: true, buffer, lastKey: Date.now() };
      } else {
        secret.current = { armed: false, buffer: '', lastKey: 0 };
      }
    };
    globalThis.addEventListener('keydown', onKeyDown);
    return () => globalThis.removeEventListener('keydown', onKeyDown);
  }, []);

  return <View style={[styles.root, theme && { backgroundColor: theme.background }]}>
    <StatusBar barStyle="dark-content" backgroundColor={theme?.background || '#F7F9F5'} />
    <ScrollView ref={scroll} contentContainerStyle={styles.container}>
      <View style={[styles.masthead, theme && { borderBottomColor: theme.accent }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Restaurar visual original" onLongPress={() => setThemeCode(null)}><Text style={[styles.logo, theme && { color: theme.ink }]}>PENSE BEM<Text style={[styles.dot, theme && { color: theme.highlight }]}>.</Text></Text></Pressable>
        <Text style={[styles.edition, theme && { color: theme.muted }]}>BIBLIOTECA INTERATIVA</Text>
      </View>
      {theme && <View accessibilityLiveRegion="polite" style={[styles.themeBanner, { borderColor: theme.line }]}>
        <Image source={PAGES[theme.page]} resizeMode="cover" style={styles.themeImage} accessibilityLabel={`Ilustração de ${theme.name} no livro`} />
        <View style={[styles.themeCaption, { backgroundColor: theme.accent }]}><Text style={styles.themeEra}>{theme.era}</Text><Text style={styles.themeName}>{theme.name}</Text></View>
      </View>}

      {screen === 'home' && <>
        <View style={styles.intro}>
          <Text style={[styles.kicker, theme && { color: theme.highlight }]}>DISNEY · VIAGEM NO TEMPO</Text>
          <Text style={[styles.heading, theme && { color: theme.ink }]}>Uma pergunta.{'\n'}Uma época diferente.</Text>
          <Text style={[styles.lead, theme && { color: theme.muted }]}>Explore os cinco programas do livro, da pré-história ao Egito Antigo.</Text>
        </View>
        {!theme && <Image source={require('./assets/cover.jpg')} resizeMode="contain" accessibilityLabel="Capa do livro Pense Bem Disney Viagem no Tempo" style={styles.cover} />}
        <View style={[styles.notice, theme && { backgroundColor: theme.soft, borderLeftColor: theme.accent }]}><Text style={[styles.noticeTitle, theme && { color: theme.ink }]}>Gabarito pendente</Text><Text style={[styles.noticeBody, theme && { color: theme.muted }]}>As páginas já estão disponíveis para leitura. As respostas e a pontuação serão ativadas quando o gabarito for adicionado.</Text></View>
        <View style={styles.sectionHeading}><Text style={[styles.sectionTitle, theme && { color: theme.ink }]}>Programas</Text><Text style={[styles.count, theme && { color: theme.muted }]}>05 / 150 QUESTÕES</Text></View>
        {PROGRAMS.map((program, index) => <Pressable key={program.code} accessibilityRole="button" accessibilityLabel={`Abrir programa ${program.code}: ${program.title}`} onPress={() => start(program)} onLongPress={() => setThemeCode(program.code)} style={({ pressed }) => [styles.program, theme && { borderBottomColor: theme.line }, pressed && styles.dim]}>
          <View style={[styles.programNumber, theme && { backgroundColor: theme.accent }]}><Text style={styles.programNumberText}>{String(index + 1).padStart(2, '0')}</Text></View>
          <View style={styles.programContent}><Text style={[styles.programTitle, theme && { color: theme.ink }]}>{program.title}</Text><Text style={[styles.programMeta, theme && { color: theme.muted }]}>CÓDIGO {program.code} · QUESTÕES {index * 30 + 1}–{index * 30 + 30}</Text></View>
          <Text style={[styles.chevron, theme && { color: theme.highlight }]}>›</Text>
        </Pressable>)}
        <Text style={[styles.footer, theme && { color: theme.muted }]}>Pense Bem — Disney: Viagem no Tempo · Projeto acadêmico sem vínculo oficial com Disney ou Tectoy.</Text>
      </>}

      {screen === 'play' && game && <>
        <View style={styles.toolbar}><Pressable accessibilityRole="button" onPress={() => setScreen('home')}><Text style={[styles.link, theme && { color: theme.accent }]}>‹ Programas</Text></Pressable><Text style={[styles.programMeta, theme && { color: theme.muted }]}>PROGRAMA {game.program.code}</Text></View>
        <Text style={[styles.kicker, theme && { color: theme.highlight }]}>{question.topic.toUpperCase()}</Text>
        <Text style={[styles.heading, theme && { color: theme.ink }]}>Questão {question.id}</Text>
        <View style={styles.progressLine}><Text style={[styles.subtle, theme && { color: theme.muted }]}>{game.index + 1} de 30 · Página {question.printedPage}</Text><Text style={[styles.subtle, theme && { color: theme.muted }]}>{Math.round((game.index + 1) / 30 * 100)}%</Text></View>
        <View style={[styles.track, theme && { backgroundColor: theme.soft }]}><View style={[styles.fill, theme && { backgroundColor: theme.accent }, { width: `${(game.index + 1) / 30 * 100}%` }]} /></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Ampliar página do livro" onPress={() => { setZoom(true); setZoomScale(1); }} style={[styles.pageFrame, theme && { borderColor: theme.line }]}>
          <Image source={PAGES[question.page]} resizeMode="contain" style={{ width: '100%', height: Math.min(width - 48, 650) * 1.28 }} />
          <Text style={[styles.pageHint, theme && { color: theme.accent }]}>TOQUE PARA AMPLIAR ↗</Text>
        </Pressable>
        <Text style={[styles.subtle, theme && { color: theme.muted }]}>Encontre o número {question.id} na página acima.</Text>
        {pending ? <View style={[styles.notice, theme && { backgroundColor: theme.soft, borderLeftColor: theme.accent }]}><Text style={[styles.noticeTitle, theme && { color: theme.ink }]}>Resposta ainda não cadastrada</Text><Text style={[styles.noticeBody, theme && { color: theme.muted }]}>Você pode percorrer o livro. Nenhuma alternativa será corrigida ou pontuada por enquanto.</Text></View> : <>
          <View style={styles.progressLine}><Text style={[styles.sectionTitle, theme && { color: theme.ink }]}>Sua resposta</Text><Text style={[styles.subtle, theme && { color: theme.muted }]}>{game.resolved ? 'Concluída' : `${3 - game.attempts.length} tentativas`}</Text></View>
          <View style={styles.answers}>{OPTIONS.map((option) => {
            const used = game.attempts.includes(option.key);
            const right = game.resolved && question.answer === option.key;
            return <Pressable key={option.key} accessibilityRole="button" accessibilityLabel={`${option.key}, ${option.name}`} disabled={game.resolved || used} onPress={() => dispatch({ type: 'ANSWER', choice: option.key })} style={({ pressed }) => [styles.answer, used && !right && styles.dim, pressed && styles.dim]}><View style={[styles.swatch, { backgroundColor: option.color }]}><Text style={styles.swatchText}>{option.key}</Text></View><Text style={styles.answerText}>{option.name}{right ? ' ✓' : used ? ' ×' : ''}</Text></Pressable>;
          })}</View>
          {!!game.message && <Text accessibilityLiveRegion="polite" style={[styles.feedback, theme && { color: theme.ink }]}>{game.message}{game.resolved ? ` Resposta: ${question.answer}.` : ''}</Text>}
          <Text style={[styles.subtle, theme && { color: theme.muted }]}>Pontuação: {game.score} / 90</Text>
        </>}
        <View style={styles.navigation}>
          {pending && <Action theme={theme} label="← Anterior" outline disabled={game.index === 0} onPress={() => { dispatch({ type: 'PREVIOUS' }); scroll.current?.scrollTo({ y: 0, animated: false }); }} />}
          {(pending || game.resolved) && <Action theme={theme} label={game.index === 29 ? 'Concluir programa →' : 'Próxima →'} onPress={next} />}
        </View>
      </>}

      {screen === 'result' && game && <>
        <Text style={[styles.kicker, theme && { color: theme.highlight }]}>PROGRAMA {game.program.code} · CONCLUÍDO</Text>
        <Text style={[styles.heading, theme && { color: theme.ink }]}>{game.program.title}</Text>
        {game.program.questions.some((item) => item.answer == null) ? <View style={[styles.notice, theme && { backgroundColor: theme.soft, borderLeftColor: theme.accent }]}><Text style={[styles.noticeTitle, theme && { color: theme.ink }]}>Leitura concluída</Text><Text style={[styles.noticeBody, theme && { color: theme.muted }]}>Você percorreu as 30 questões. O resultado ficará disponível depois que o gabarito for cadastrado.</Text></View> : <><Text style={[styles.score, theme && { color: theme.ink }]}>{game.score} <Text style={[styles.subtle, theme && { color: theme.muted }]}>/ 90 pontos</Text></Text><Text style={[styles.lead, theme && { color: theme.muted }]}>{correct} acertos em 30 questões.</Text>{game.history.map((entry) => <View key={entry.id} style={[styles.review, theme && { borderBottomColor: theme.line }]}><Text style={[styles.answerText, theme && { color: theme.ink }]}>Questão {entry.id} · {entry.attempts.join(', ')}</Text><Text style={[styles.subtle, theme && { color: theme.muted }]}>Resposta {entry.answer} · +{entry.points}</Text></View>)}</>}
        <Action theme={theme} label="Recomeçar programa" onPress={() => start(game.program)} />
        <Action theme={theme} label="Voltar aos programas" outline onPress={() => setScreen('home')} />
      </>}
    </ScrollView>

    <Modal visible={zoom} animationType="slide" onRequestClose={() => setZoom(false)}><View style={[styles.modal, theme && { backgroundColor: theme.background }]}>
      <View style={styles.zoomBar}><Text style={[styles.programTitle, theme && { color: theme.ink }]}>Questão {question?.id} · Pág. {question?.printedPage}</Text><Pressable accessibilityRole="button" onPress={() => setZoom(false)}><Text style={[styles.link, theme && { color: theme.accent }]}>Fechar ✕</Text></Pressable></View>
      <View style={styles.zoomBar}><Action theme={theme} label="−" outline onPress={() => setZoomScale(Math.max(1, zoomScale - .5))} /><Text style={[styles.subtle, theme && { color: theme.muted }]}>{Math.round(zoomScale * 100)}%</Text><Action theme={theme} label="+" outline onPress={() => setZoomScale(Math.min(3, zoomScale + .5))} /></View>
      <ScrollView><ScrollView horizontal>{question && <Image source={PAGES[question.page]} resizeMode="contain" style={{ width: width * zoomScale, height: width * zoomScale * 1.3 }} />}</ScrollView></ScrollView>
    </View></Modal>
  </View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F9F5' },
  container: { width: '100%', maxWidth: 700, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 54, paddingBottom: 64 },
  masthead: { borderBottomWidth: 2, borderBottomColor: '#1C494C', paddingBottom: 18, marginBottom: 32, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap' },
  logo: { color: '#1C494C', fontFamily: 'serif', fontSize: 24, fontWeight: '900' },
  dot: { color: '#DC684C' },
  edition: { color: '#51716F', fontSize: 10, fontWeight: '700' },
  intro: { marginBottom: 28 },
  themeBanner: { borderBottomWidth: 3, marginBottom: 28, overflow: 'hidden' },
  themeImage: { width: '100%', height: 165 },
  themeCaption: { paddingHorizontal: 16, paddingVertical: 11 },
  themeEra: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  themeName: { color: '#FFF', fontFamily: 'serif', fontSize: 22, fontWeight: 'bold', marginTop: 2 },
  cover: { width: '100%', height: 245, backgroundColor: '#FFF', borderRadius: 4 },
  kicker: { color: '#C45035', fontSize: 11, fontWeight: '800', marginBottom: 12 },
  heading: { color: '#1D393A', fontFamily: 'serif', fontSize: 36, lineHeight: 42, fontWeight: 'bold', marginBottom: 14 },
  lead: { color: '#48605D', fontSize: 16, lineHeight: 25 },
  notice: { backgroundColor: '#E6F0EB', borderLeftWidth: 4, borderLeftColor: '#328275', padding: 18, marginVertical: 20 },
  noticeTitle: { color: '#21564F', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  noticeBody: { color: '#3C615B', lineHeight: 22 },
  sectionHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 18, marginBottom: 14, gap: 8 },
  sectionTitle: { color: '#1D393A', fontFamily: 'serif', fontWeight: 'bold', fontSize: 21 },
  count: { color: '#647572', fontSize: 10, fontWeight: '700' },
  program: { minHeight: 88, borderBottomWidth: 1, borderBottomColor: '#C8D6D0', flexDirection: 'row', alignItems: 'center', gap: 15 },
  programNumber: { backgroundColor: '#1F5657', width: 43, height: 43, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  programNumberText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  programContent: { flex: 1 },
  programTitle: { color: '#203E3F', fontSize: 17, fontWeight: '700' },
  programMeta: { color: '#637571', fontSize: 10, fontWeight: '700', marginTop: 5 },
  chevron: { color: '#C45035', fontSize: 30 },
  footer: { color: '#657671', fontSize: 12, lineHeight: 19, marginTop: 34 },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 34 },
  link: { color: '#1C6F68', fontWeight: '700', fontSize: 15 },
  progressLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 12, marginBottom: 10 },
  subtle: { color: '#5B716B', fontSize: 13 },
  track: { height: 5, backgroundColor: '#D5E2DC', borderRadius: 3, overflow: 'hidden', marginBottom: 20 },
  fill: { height: 5, backgroundColor: '#C45035' },
  pageFrame: { borderWidth: 1, borderColor: '#C5D4CB', backgroundColor: '#FFF', padding: 8, borderRadius: 4 },
  pageHint: { color: '#236961', fontSize: 10, fontWeight: '800', textAlign: 'center', paddingVertical: 9 },
  answers: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 16 },
  answer: { flexDirection: 'row', alignItems: 'center', width: '48%', minWidth: 135, borderWidth: 1, borderColor: '#C5D4CB', borderRadius: 4, backgroundColor: '#FFF', padding: 9, gap: 10 },
  swatch: { width: 34, height: 34, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  swatchText: { color: '#FFF', fontWeight: '900' },
  answerText: { color: '#254441', fontSize: 15, fontWeight: '600' },
  feedback: { color: '#21564F', fontSize: 15, lineHeight: 22, marginBottom: 16 },
  navigation: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 22 },
  action: { backgroundColor: '#1F5657', paddingHorizontal: 20, minHeight: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 4, marginTop: 10 },
  actionText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#1F5657' },
  outlineText: { color: '#1F5657' },
  dim: { opacity: .5 },
  score: { fontSize: 52, color: '#1D393A', marginVertical: 22, fontWeight: '800' },
  review: { borderBottomWidth: 1, borderBottomColor: '#C8D6D0', paddingVertical: 12, gap: 4 },
  modal: { flex: 1, backgroundColor: '#F7F9F5', paddingTop: 32 },
  zoomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 12, gap: 8 },
});
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { InstallButton } from '../../components/InstallPrompt';
import { ProgressBar } from '../../components/ProgressBar';
import { activityTheme, languageTheme, scoreTone, SKILL_LABEL } from '../../lib/ui';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/auth.store';
import { DashboardData, DashboardLanguage, SessionActivity, XpSummary } from '../../types';
import { BossCard } from './BossCard';
import { PracticePicker } from './PracticePicker';

/** XP de cada tipo de bloco -- a mesma tabela do backend (`xp.rules.ts`). */
const XP_BY_TYPE: Record<string, number> = {
  review: 10,
  listening: 10,
  reading: 10,
  vocabulary: 15,
  structure: 20,
  alphabet: 20,
  foundation: 20,
  contrast: 15,
  compare: 30,
  grammar: 15,
  morphology: 20,
  traps: 15,
  dictation: 15,
  writing: 20,
  speaking: 25,
  shadowing: 20,
  production: 40,
  tutor: 50,
  promotion: 60,
};

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard');
      return data;
    },
  });

  if (isLoading) return <LoadingState />;

  if (isError || !data) {
    return (
      <div className="card bg-cardinal-soft">
        <p className="font-display font-semibold text-cardinal-dark">Não deu para carregar seu dia.</p>
        <p className="text-sm text-wolf">Verifique se a API está no ar e recarregue.</p>
      </div>
    );
  }

  const { session, languages, streak, xp } = data;
  const done = session.activities.filter((a) => a.completed).length;
  const total = session.activities.length;
  const nextIndex = session.activities.findIndex((a) => !a.completed);
  const allDone = total > 0 && done === total;

  // O XP que ainda esta em jogo hoje: e o que transforma a lista de blocos numa
  // recompensa pendente em vez de uma lista de tarefas.
  const xpLeft = session.activities
    .filter((a) => !a.completed)
    .reduce((sum, a) => sum + (XP_BY_TYPE[a.type] ?? 10), 0);

  const languageNames = [...new Set(session.activities.map((a) => a.languageName))];

  return (
    <div className="space-y-6">
      <div>
        <DayHeader name={user?.name} xp={xp} streak={streak.current} />

        <MissionCard
          allDone={allDone}
          completed={session.completed}
          done={done}
          total={total}
          languages={languageNames}
          minutes={session.plannedMinutes}
          xpLeft={xpLeft}
          onStart={() => navigate('/sessao')}
        />
      </div>

      {/*
        O "porque" da sessao continua sendo requisito do produto: o aluno precisa
        entender qual criterio gerou o plano de hoje.
      */}
      {session.rationale && (
        <p className="animate-rise px-1 text-sm leading-relaxed text-wolf [animation-delay:200ms]">
          {session.rationale}
        </p>
      )}

      {total > 0 && (
        <section className="space-y-2">
          <div className="flex items-baseline justify-between px-1">
            <h2 className="section-label">Blocos de hoje</h2>
            <span className="text-[13px] text-wolf">
              {done} de {total}
            </span>
          </div>
          <ol className="list-group animate-rise [animation-delay:220ms]">
            {session.activities.map((activity, index) => (
              <MissionRow
                key={activity.id}
                activity={activity}
                index={index}
                isNext={index === nextIndex}
                onStart={() => navigate(`/sessao?activity=${activity.id}`)}
              />
            ))}
          </ol>
        </section>
      )}

      {/*
        O chefe vem DEPOIS da missao do dia e ANTES da pratica livre: e a
        recompensa que aparece quando o dia ja esta encaminhado.
      */}
      <BossCard />

      <PracticePicker languages={languages} />

      <section className="space-y-2">
        <h2 className="section-label px-1">Seus idiomas</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {languages.map((language) => (
            <LanguageCard key={language.code} language={language} />
          ))}
        </div>
      </section>

      {!data.aiEnabled && (
        <div className="card bg-bee-soft">
          <p className="text-sm text-eel">
            Nenhum provider de IA configurado. O tutor e a geração de exercícios ficam
            indisponíveis até você preencher <code>MIMO_API_KEY</code> ou{' '}
            <code>OPENROUTER_API_KEY</code> no .env do backend. O resto do sistema funciona
            normalmente.
          </p>
        </div>
      )}
    </div>
  );
}

function greeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 5) return 'Boa noite';
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * O topo escuro: quem voce e, a sequencia e quanto falta para o proximo nivel.
 *
 * Ele sangra ate a borda da tela no celular (as margens negativas desfazem o
 * `px-4`/`pt` do Layout) e vira um bloco arredondado a partir do `sm`, onde a
 * coluna de conteudo ja nao ocupa a largura toda.
 */
function DayHeader({ name, xp, streak }: { name?: string; xp: XpSummary; streak: number }) {
  const { progress } = xp;
  const now = new Date();
  const date = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const firstName = name?.split(' ')[0];

  return (
    <section className="-mx-4 -mt-[calc(env(safe-area-inset-top)+1.5rem)] bg-espresso px-5 pb-24 pt-[calc(env(safe-area-inset-top)+1.75rem)] sm:mx-0 sm:mt-0 sm:rounded-3xl sm:pt-6">
      <div className="flex animate-fade items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-latte first-letter:uppercase">{date}</p>
          <p className="truncate font-display text-lg font-semibold text-white">
            {greeting(now)}
            {firstName ? `, ${firstName}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <InstallButton className="lg:hidden" />
          <span
            className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-espresso-3 font-semibold text-accent-soft"
            aria-hidden
          >
            {firstName?.[0]?.toUpperCase() ?? '4'}
          </span>
        </div>
      </div>

      <div className="mt-[18px] flex gap-2.5">
        <div className="flex-1 animate-rise rounded-[14px] bg-espresso-2 px-3.5 py-3 [animation-delay:60ms]">
          <p className="text-[11px] text-latte">Sequência</p>
          <p className="mt-1 font-display text-base font-semibold text-white">
            {streak} {streak === 1 ? 'dia' : 'dias'}
          </p>
        </div>
        <div
          className="min-w-0 flex-[1.6] animate-rise rounded-[14px] bg-espresso-2 px-3.5 py-3 [animation-delay:110ms]"
          title={`Nível ${progress.level} — ${progress.title}`}
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[11px] text-latte">Nível {progress.level}</p>
            <p className="truncate text-[11px] text-honey">faltam {progress.xpRemaining} XP</p>
          </div>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-espresso-3"
            role="progressbar"
            aria-label="Progresso do nível"
            aria-valuenow={progress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full origin-left animate-fill rounded-full bg-bee transition-[width] duration-500 ease-out"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/** O card caramelo da missao, sobreposto a borda de baixo do topo escuro. */
function MissionCard({
  allDone,
  completed,
  done,
  total,
  languages,
  minutes,
  xpLeft,
  onStart,
}: {
  allDone: boolean;
  completed: boolean;
  done: number;
  total: number;
  languages: string[];
  minutes: number;
  xpLeft: number;
  onStart: () => void;
}) {
  const left = total - done;
  const title = allDone
    ? 'Missão concluída'
    : done > 0
      ? `Faltam ${left} ${left === 1 ? 'bloco' : 'blocos'}`
      : `${total} ${total === 1 ? 'bloco' : 'blocos'} para hoje`;

  const details = [
    new Intl.ListFormat('pt-BR', { type: 'conjunction' }).format(languages),
    minutes ? `cerca de ${minutes} min` : null,
    xpLeft > 0 ? `+${xpLeft} XP` : null,
  ].filter(Boolean);

  return (
    <section className="relative -mt-[4.5rem] animate-rise rounded-2xl bg-accent p-5 [animation-delay:160ms] sm:mx-4">
      <span className="inline-block rounded-lg bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent-dark">
        Missão de hoje
      </span>
      <p className="mt-3 font-display text-xl font-semibold leading-snug text-white">{title}</p>
      {details.length > 0 && <p className="mt-1.5 text-xs text-[#F8E9DE]">{details.join(' · ')}</p>}

      <button
        className="press mt-4 inline-flex min-h-11 items-center rounded-xl bg-white px-5 text-sm font-semibold text-accent-dark transition-colors hover:bg-accent-soft disabled:opacity-60"
        onClick={onStart}
        disabled={completed || total === 0}
      >
        {completed ? 'Tudo feito por hoje' : done > 0 ? `Continuar · ${done} de ${total}` : 'Começar missão'}
      </button>
    </section>
  );
}

/**
 * Um bloco da missao, como linha numerada.
 *
 * A trilha em zigue-zague com halo pulsando saiu junto com o visual de jogo: a
 * ordem do dia ja se le de cima para baixo, e o numero diz "isto vem antes
 * daquilo" sem precisar de desenho. O proximo bloco se destaca pelo anel
 * caramelo e pela seta, nao por brilho.
 *
 * Os blocos ainda abertos continuam tocaveis fora de ordem -- o aluno pode
 * pular a sequencia se quiser.
 */
function MissionRow({
  activity,
  index,
  isNext,
  onStart,
}: {
  activity: SessionActivity;
  index: number;
  isNext: boolean;
  onStart: () => void;
}) {
  const theme = activityTheme(activity.type);
  const xpValue = XP_BY_TYPE[activity.type] ?? 10;
  const done = activity.completed;

  return (
    <li className="list-row animate-rise px-0" style={{ animationDelay: `${260 + index * 55}ms` }}>
      <button
        type="button"
        onClick={done ? undefined : onStart}
        disabled={done}
        aria-label={done ? `${theme.label}: feito` : `Começar ${theme.label}`}
        className="flex min-h-14 w-full items-center gap-3.5 px-4 py-2 text-left"
      >
        <span
          className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-[1.5px] text-xs font-semibold ${
            done
              ? 'border-accent bg-accent text-white'
              : isNext
                ? 'border-accent text-accent'
                : 'border-[#D9CEC5] text-hare'
          }`}
        >
          {done ? (
            <svg
              viewBox="0 0 24 24"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12l5 5 9-10" />
            </svg>
          ) : (
            index + 1
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={`block text-[15px] ${isNext ? 'font-semibold' : 'font-medium'} ${
              done ? 'text-wolf' : 'text-eel'
            }`}
          >
            {theme.label}
          </span>
          <span className="block truncate text-[13px] text-wolf">
            {activity.languageName} · {activity.reason ?? theme.blurb}
          </span>
        </span>

        {isNext ? (
          <svg
            viewBox="0 0 24 24"
            className="h-[18px] w-[18px] shrink-0 animate-nudge text-accent"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        ) : (
          !done && <span className="shrink-0 text-xs font-medium text-hare">+{xpValue}</span>
        )}
      </button>
    </li>
  );
}

function LanguageCard({ language }: { language: DashboardLanguage }) {
  const theme = languageTheme(language.code);
  const skills = (['listening', 'reading', 'writing', 'speaking', 'grammar'] as const).map(
    (key) => ({ key, value: language.skills[key] }),
  );

  return (
    /*
      O `min-w-0` nao e enfeite: item de grade nasce com `min-width: auto`, e
      isso o impede de encolher abaixo da largura MINIMA do conteudo. Como o
      card tem varios `truncate` -- e `truncate` e `white-space: nowrap` --, a
      largura minima dele passa a ser a do texto inteiro sem quebra. O card
      entao estoura a coluna, empurra a pagina e o celular comeca a arrastar de
      lado. Zerar o minimo devolve ao `truncate` o direito de cortar.
    */
    <div className="card min-w-0 space-y-3.5">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 font-mono text-lg font-bold ${theme.soft} ${theme.border} ${theme.text}`}
        >
          {theme.mark}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-serif font-bold text-eel">{language.name}</h3>
          <p className="font-mono text-xs text-hare">
            {language.currentLevel} → {language.targetLevel}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {skills.map(({ key, value }) => {
          const meta = SKILL_LABEL[key];
          const tone = scoreTone(value);
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="w-24 shrink-0 truncate text-xs text-wolf">{meta.label}</span>
              <ProgressBar value={value} size="sm" tone={tone.bar} />
              <span className={`w-9 shrink-0 text-right font-mono text-xs ${tone.text}`}>
                {Math.round(value)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-swan pt-3">
        <span className="font-mono text-xs text-hare">{language.vocabulary.total} termos</span>
        <span
          className={`chip ${
            language.dueReviews > 0 ? 'border-bee text-bee' : 'border-grass text-grass'
          }`}
        >
          {language.dueReviews > 0 ? `${language.dueReviews} p/ revisar` : 'em dia'}
        </span>
      </div>

      {language.topErrors.length > 0 && (
        <div className="rounded-xl bg-snow p-3">
          <p className="mb-1.5 text-xs text-wolf">Onde você tropeça</p>
          <ul className="space-y-1">
            {language.topErrors.map((error) => (
              <li key={error.id} className="flex items-baseline justify-between gap-2 text-xs text-eel">
                {/* Mesma razao do `min-w-0` do card, um nivel abaixo: sem ele
                    este `truncate` nunca corta, so alarga a linha. */}
                <span className="min-w-0 truncate">{error.description}</span>
                <span className="shrink-0 font-mono text-cardinal">{error.occurrenceCount}×</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="h-40 animate-pulse rounded-2xl bg-white" />
      <div className="h-8 w-56 animate-pulse rounded-xl bg-white" />
      <div className="space-y-2">
        <div className="h-20 animate-pulse rounded-xl bg-white" />
        <div className="h-20 animate-pulse rounded-xl bg-white" />
        <div className="h-20 animate-pulse rounded-xl bg-white" />
      </div>
    </div>
  );
}

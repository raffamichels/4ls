import '../src/common/timezone';
import 'reflect-metadata';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { DEFAULT_LANGUAGE_SETUP } from '../src/modules/auth/auth.service';

/**
 * Tira do estudo os idiomas que sairam do produto -- o inverso do
 * enroll-languages.
 *
 * Quando o produto passou de quatro idiomas (ingles, espanhol, alemao, russo)
 * para dois (ingles e alemao), o cadastro mudou, mas quem ja tinha conta
 * continuava matriculado nos quatro. A matricula e o que decide o que entra na
 * sessao, no dashboard e na revisao, entao e so ela que este script remove.
 *
 * O historico fica: vocabulario, progresso, erros e atividades de espanhol e
 * russo continuam no banco, e as linhas da tabela `languages` tambem. O que se
 * perde ao apagar a matricula sao os niveis e as notas por competencia -- por
 * isso elas vao antes para um backup em JSON (apps/api/backups/), que basta
 * para recriar a matricula se o idioma voltar.
 *
 *   npm run db:retire-languages -w @4l/api -- --dry-run
 *   npm run db:retire-languages -w @4l/api
 *
 * Idempotente: rodar de novo nao encontra nada para remover.
 */

const prisma = new PrismaClient();

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const active = new Set(DEFAULT_LANGUAGE_SETUP.map((s) => s.code));

  const users = await prisma.user.findMany({
    include: { userLanguages: { include: { language: true } } },
  });

  const retired = users.flatMap((user) =>
    user.userLanguages
      .filter((ul) => !active.has(ul.language.code))
      .map((ul) => ({ email: user.email, code: ul.language.code, enrollment: ul })),
  );

  if (retired.length === 0) {
    console.log(`Nenhuma matricula fora de ${[...active].join(', ')}. Nada a fazer.`);
    return;
  }

  if (!dryRun) {
    const dir = join(__dirname, '..', 'backups');
    mkdirSync(dir, { recursive: true });
    const file = join(dir, `retired-languages-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    writeFileSync(file, JSON.stringify(retired, null, 2));
    console.log(`Backup das ${retired.length} matricula(s) em ${file}\n`);
  }

  let rebalanced = 0;

  for (const user of users) {
    const leaving = user.userLanguages.filter((ul) => !active.has(ul.language.code));
    if (leaving.length === 0) continue;

    const staying = user.userLanguages.filter((ul) => active.has(ul.language.code));
    console.log(
      `${user.email}: sai ${leaving.map((ul) => ul.language.code).join(', ')}` +
        ` -- fica ${staying.map((ul) => ul.language.code).join(', ') || 'nenhum'}`,
    );

    if (!dryRun) {
      await prisma.userLanguage.deleteMany({ where: { id: { in: leaving.map((ul) => ul.id) } } });
    }

    /*
     * Mesma regra do enroll-languages: os minutos so sao redistribuidos quando
     * o aluno nunca mexeu neles (todos iguais). Quem ajustou a propria divisao
     * fica com a proporcao que escolheu -- o planejador normaliza para o dia.
     */
    const untouched =
      user.userLanguages.length > 0 &&
      user.userLanguages.every((ul) => ul.minutesPerDay === user.userLanguages[0].minutesPerDay);

    if (untouched && staying.length > 0) {
      const each = Math.max(5, Math.round(user.dailyMinutes / staying.length));
      console.log(`   redistribuindo: ${staying.length} idiomas x ${each}min`);
      if (!dryRun) {
        await prisma.userLanguage.updateMany({
          where: { id: { in: staying.map((ul) => ul.id) } },
          data: { minutesPerDay: each },
        });
      }
      rebalanced += 1;
    } else if (!untouched) {
      console.log('   minutos por idioma foram ajustados por voce; deixados como estao.');
    }
  }

  console.log(
    dryRun
      ? `\nSimulacao: ${retired.length} matricula(s) a remover, ${rebalanced} redistribuicao(oes). Nada gravado.`
      : `\nPronto: ${retired.length} matricula(s) removida(s), ${rebalanced} redistribuicao(oes).`,
  );
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

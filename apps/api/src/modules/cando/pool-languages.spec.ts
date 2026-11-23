import { describe, expect, it } from 'vitest';
import { passageFitsLanguages, ReadingVersion } from '../reading/reading.service';
import { CanDoSentence, lessonFitsLanguages } from './can-do.service';

/**
 * Os pools de can-do e de leitura sao compartilhados por (conteudo, nivel), nao
 * por idioma. As aulas de quando o aluno estudava quatro idiomas continuam no
 * banco -- e estes filtros sao o que impede que elas voltem para a tela depois
 * da reducao para ingles e alemao.
 */

const sentence = (...codes: string[]): CanDoSentence => ({
  gloss: 'Eu sou brasileiro.',
  realizations: codes.map((languageCode) => ({ languageCode, sentence: 'x', parts: [] })),
});

const version = (languageCode: string) => ({ languageCode }) as ReadingVersion;

describe('lessonFitsLanguages', () => {
  it('aceita a aula feita para exatamente os idiomas da matricula', () => {
    expect(lessonFitsLanguages([sentence('en', 'de'), sentence('de', 'en')], ['en', 'de'])).toBe(
      true,
    );
  });

  it('recusa a aula antiga dos quatro idiomas', () => {
    expect(lessonFitsLanguages([sentence('en', 'es', 'de', 'ru')], ['en', 'de'])).toBe(false);
  });

  it('recusa a aula que tem idioma faltando em alguma frase', () => {
    expect(lessonFitsLanguages([sentence('en', 'de'), sentence('en')], ['en', 'de'])).toBe(false);
  });

  it('recusa aula vazia ou sem frases', () => {
    expect(lessonFitsLanguages([], ['en', 'de'])).toBe(false);
    expect(lessonFitsLanguages(null, ['en', 'de'])).toBe(false);
  });
});

describe('passageFitsLanguages', () => {
  it('aceita o texto com as versoes dos idiomas da matricula', () => {
    expect(passageFitsLanguages([version('de'), version('en')], ['en', 'de'])).toBe(true);
  });

  it('recusa o texto antigo com espanhol e russo', () => {
    expect(
      passageFitsLanguages(
        [version('en'), version('es'), version('de'), version('ru')],
        ['en', 'de'],
      ),
    ).toBe(false);
  });

  it('recusa o texto sem a versao de um dos idiomas', () => {
    expect(passageFitsLanguages([version('en')], ['en', 'de'])).toBe(false);
  });
});

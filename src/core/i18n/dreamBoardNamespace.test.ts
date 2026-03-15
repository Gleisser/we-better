import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = process.cwd();
const dreamBoardFeatureDirectory = resolve(projectRoot, 'src/features/dream-board');
const dreamBoardWidgetDirectory = resolve(
  projectRoot,
  'src/shared/components/widgets/DreamBoardTimelineWidget'
);

const dynamicDreamBoardKeys = [
  'dreamBoard.categories.names.finance',
  'dreamBoard.categories.names.finances',
  'dreamBoard.categories.names.general',
  'dreamBoard.categories.names.travel',
  'dreamBoard.categories.names.skills',
  'dreamBoard.categories.names.health',
  'dreamBoard.categories.names.relationships',
  'dreamBoard.categories.names.career',
  'dreamBoard.categories.names.education',
  'dreamBoard.categories.names.spirituality',
  'dreamBoard.insights.titles.pattern_analysis',
  'dreamBoard.insights.titles.balance_suggestion',
  'dreamBoard.insights.titles.progress_insight',
  'dreamBoard.board.dreamSymbols.messages.briefcase',
  'dreamBoard.board.dreamSymbols.messages.money',
  'dreamBoard.board.dreamSymbols.messages.health',
  'dreamBoard.board.dreamSymbols.messages.house',
  'dreamBoard.board.dreamSymbols.messages.growth',
  'dreamBoard.board.dreamSymbols.messages.heart',
  'dreamBoard.board.dreamSymbols.messages.recreation',
  'dreamBoard.board.dreamSymbols.messages.meditation',
  'dreamBoard.board.dreamSymbols.messages.graduation',
  'dreamBoard.board.dreamSymbols.messages.travel',
  'dreamBoard.board.dreamSymbols.messages.default',
  'dreamBoard.weather.states.sunny',
  'dreamBoard.weather.states.partly-cloudy',
  'dreamBoard.weather.states.cloudy',
  'dreamBoard.weather.states.stormy',
  'dreamBoard.weather.states.raining',
  'dreamBoard.weather.states.unknown',
];

const readLocale = (language: 'en' | 'pt'): Record<string, unknown> =>
  JSON.parse(
    readFileSync(resolve(projectRoot, `public/locales/${language}/dream-board.json`), 'utf8')
  ) as Record<string, unknown>;

const getNestedValue = (source: Record<string, unknown>, path: string): unknown =>
  path.split('.').reduce<unknown>((currentValue, segment) => {
    if (!currentValue || typeof currentValue !== 'object') {
      return undefined;
    }

    return (currentValue as Record<string, unknown>)[segment];
  }, source);

const getDreamBoardKeysFromSource = (): string[] => {
  const output = execSync(
    `rg -o "dreamBoard(?:\\.[A-Za-z0-9_]+)+" "${dreamBoardFeatureDirectory}" "${dreamBoardWidgetDirectory}" -g '!**/*.test.*' -g '!**/__tests__/**'`,
    {
      cwd: projectRoot,
      encoding: 'utf8',
    }
  );

  const staticKeys = output.match(/dreamBoard(?:\.[A-Za-z0-9_]+)+/g) ?? [];

  return Array.from(new Set([...staticKeys, ...dynamicDreamBoardKeys])).sort();
};

describe('dream-board locale namespace', () => {
  it.each(['en', 'pt'] as const)(
    'includes every Dream Board translation key referenced by the feature for %s',
    language => {
      const locale = readLocale(language);
      const keys = getDreamBoardKeysFromSource();
      const missingKeys = keys.filter(key => getNestedValue(locale, key) === undefined);

      expect(missingKeys).toEqual([]);
    }
  );
});

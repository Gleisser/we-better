import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = process.cwd();

const collectSourceFiles = (directories: string[]): string[] => {
  const files: string[] = [];

  const walk = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) {
        continue;
      }

      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!/\.(ts|tsx)$/.test(entry.name)) {
        continue;
      }

      if (fullPath.includes('__tests__') || fullPath.includes('.test.')) {
        continue;
      }

      files.push(fullPath);
    }
  };

  directories.forEach(directory => walk(resolve(projectRoot, directory)));
  return files;
};

const getNestedValue = (source: Record<string, unknown>, path: string): unknown =>
  path.split('.').reduce<unknown>((currentValue, segment) => {
    if (!currentValue || typeof currentValue !== 'object') {
      return undefined;
    }

    return (currentValue as Record<string, unknown>)[segment];
  }, source);

const extractKeys = (sourceFiles: string[], prefixes: string[]): string[] => {
  const keys = new Set<string>();
  const pattern = new RegExp(
    `\\bt\\(\\s*['"]((?:${prefixes.join('|')})(?:\\.[A-Za-z0-9_]+)+)['"]`,
    'g'
  );

  sourceFiles.forEach(filePath => {
    const content = readFileSync(filePath, 'utf8');
    for (const match of content.matchAll(pattern)) {
      keys.add(match[1]);
    }
  });

  return Array.from(keys).sort();
};

const localeConfig = {
  dashboard: {
    localeFile: 'dashboard.json',
    directories: [
      'src/features/dashboard',
      'src/shared/components/layout/DashboardGrid',
      'src/shared/components/widgets',
      'src/shared/components/common/AIAssistantButton',
    ],
    prefixes: ['widgets', 'floating', 'aiChat'],
    extraKeys: [] as string[],
  },
  missions: {
    localeFile: 'missions.json',
    directories: ['src/features/missions'],
    prefixes: ['missions'],
    extraKeys: Array.from(
      readFileSync(
        resolve(projectRoot, 'src/features/missions/constants/categoryHeaderGuidance.ts'),
        'utf8'
      ).matchAll(/['"]((?:missions)(?:\.[A-Za-z0-9_]+)+)['"]/g),
      match => match[1]
    ),
  },
  settings: {
    localeFile: 'settings.json',
    directories: [
      'src/pages/Settings',
      'src/shared/components/theme',
      'src/shared/components/user',
      'src/shared/components/i18n/LanguageSelector',
    ],
    prefixes: ['settings'],
    extraKeys: [] as string[],
  },
} as const;

describe('route locale namespaces', () => {
  it.each([
    ['dashboard', 'en'],
    ['dashboard', 'pt'],
    ['missions', 'en'],
    ['missions', 'pt'],
    ['settings', 'en'],
    ['settings', 'pt'],
  ] as const)('includes every referenced %s key for %s', (namespace, language) => {
    const config = localeConfig[namespace];
    const locale = JSON.parse(
      readFileSync(resolve(projectRoot, `public/locales/${language}/${config.localeFile}`), 'utf8')
    ) as Record<string, unknown>;
    const keys = Array.from(
      new Set([
        ...extractKeys(collectSourceFiles(config.directories), [...config.prefixes]),
        ...config.extraKeys,
      ])
    ).sort();
    const missingKeys = keys.filter(key => getNestedValue(locale, key) === undefined);

    expect(missingKeys).toEqual([]);
  });
});

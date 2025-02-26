import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import { cli } from '../src/cli.js';

function readTestData(filename: string): string {
  return readFileSync(testData(filename), 'utf8');
}

function testData(filename: string): string {
  return join(__dirname, 'data', filename);
}

describe('cli', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join('.', 'test-cli'));

    return () => {
      rmSync(tmpDir, { force: true, recursive: true });
    };
  });

  describe('mode overwrite', () => {
    it('creates file when file not exist yet', async () => {
      copyFileSync(testData('example.yml'), join(tmpDir, 'action.yml'));

      expect(existsSync(join(tmpDir, 'README.md'))).toBeFalsy();
      const rc = await cli([
        'node',
        'github-action-docs',
        '--output-file',
        join(tmpDir, 'README.md'),
        '--mode',
        'overwrite',
        join(tmpDir, 'action.yml'),
      ]);
      expect(rc).toBe(0);
      expect(existsSync(join(tmpDir, 'README.md'))).toBeTruthy();

      expect(readFileSync(join(tmpDir, 'README.md'), 'utf8')).toStrictEqual(readTestData('example.md'));
    });
  });

  describe('mode inject', () => {
    it('injects markdown when file exists', async () => {
      copyFileSync(testData('example.yml'), join(tmpDir, 'action.yml'));
      copyFileSync(testData('existing-readme.md'), join(tmpDir, 'README.md'));

      const rc = await cli([
        'node',
        'github-action-docs',
        '--output-file',
        join(tmpDir, 'README.md'),
        '--mode',
        'inject',
        join(tmpDir, 'action.yml'),
      ]);
      expect(rc).toBe(0);

      expect(readFileSync(join(tmpDir, 'README.md'), 'utf8')).toStrictEqual(readTestData('existing-readme-inject.md'));
    });
  });
});

import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cli, raiseIfNotSet } from '../src/cli.js';

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

    it('uses custom sections', async () => {
      copyFileSync(testData('example.yml'), join(tmpDir, 'action.yml'));

      expect(existsSync(join(tmpDir, 'README.md'))).toBeFalsy();
      const rc = await cli([
        'node',
        'github-action-docs',
        '--output-file',
        join(tmpDir, 'README.md'),
        '--sections',
        'outputs',
        'inputs',
        '--mode',
        'overwrite',
        join(tmpDir, 'action.yml'),
      ]);
      expect(rc).toBe(0);
      expect(existsSync(join(tmpDir, 'README.md'))).toBeTruthy();

      expect(readFileSync(join(tmpDir, 'README.md'), 'utf8')).toStrictEqual(readTestData('example-custom-sections.md'));
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

  describe('no output file', () => {
    it('prints to stdout', async () => {
      const logMock = vi.spyOn(console, 'log').mockImplementation(() => {});
      copyFileSync(testData('example.yml'), join(tmpDir, 'action.yml'));

      const rc = await cli([
        'node',
        'github-action-docs',
        join(tmpDir, 'action.yml'),
      ]);
      expect(rc).toBe(0);

      expect(logMock).toHaveBeenCalledWith(readTestData('example.md'));
    });
  });
});

describe('raiseIfNotSet', () => {
  it('raises an error when not set', () => {
    const file = undefined;
    expect(() => {
      raiseIfNotSet(file, 'File not set');
    }).toThrow('File not set');
  });

  it('passes when set', () => {
    const file = 'actions.yml';
    expect(() => {
      raiseIfNotSet(file, 'File not set');
    }).not.toThrow();
  });
});

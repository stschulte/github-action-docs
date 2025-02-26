import { describe, expect, it } from 'vitest';

import { sortEntries, sortInput } from '../src/github.js';

describe('sortEntries', () => {
  it('sorts by first item', () => {
    const entries: [string, unknown][] = [
      ['bar', 20],
      ['foo', { message: 'Hi' }],
      ['alice', 'unimportant'],
      ['charly', null],
    ];
    expect(entries.sort(sortEntries)).toStrictEqual([
      ['alice', 'unimportant'],
      ['bar', 20],
      ['charly', null],
      ['foo', { message: 'Hi' }],
    ]);
  });
});

describe('sortInput', () => {
  it('sorts required attributes by name', () => {
    const inputs: [string, { description: string; required?: boolean }][] = [
      ['bar', { description: 'some bar stuff', required: true }],
      ['foo', { description: 'some foo stuff', required: true }],
      ['alice', { description: 'some alice stuff', required: true }],
      ['charly', { description: 'some charly stuff', required: true }],
    ];
    expect(inputs.sort(sortInput)).toStrictEqual([
      ['alice', { description: 'some alice stuff', required: true }],
      ['bar', { description: 'some bar stuff', required: true }],
      ['charly', { description: 'some charly stuff', required: true }],
      ['foo', { description: 'some foo stuff', required: true }],
    ]);
  });

  it('lists required attributes first', () => {
    const inputs: [string, { description: string; required?: boolean }][] = [
      ['charly', { description: 'some charly stuff' }],
      ['foo', { description: 'some foo stuff', required: true }],
      ['alice', { description: 'some alice stuff', required: true }],
      ['bar', { description: 'some bar stuff', required: false }],
    ];
    expect(inputs.sort(sortInput)).toStrictEqual([
      ['alice', { description: 'some alice stuff', required: true }],
      ['foo', { description: 'some foo stuff', required: true }],
      ['bar', { description: 'some bar stuff', required: false }],
      ['charly', { description: 'some charly stuff' }],
    ]);
  });
});

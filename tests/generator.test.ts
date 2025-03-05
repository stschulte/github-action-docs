import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

import type { Metadata, MetadataComposite, MetadataDocker, MetadataJS } from '../src/github.js';

import {
  generateMarkdown,
  generateMarkdownInputs,
  generateMarkdownOutputs,
  generateMarkdownType,
  itemToRows,
  mdAnchor,
  mdBoolean,
  mdCode,
  mdString,
  sectionToRows,
} from '../src/generator.js';

function readTestData(filename: string): string {
  return readFileSync(join(__dirname, 'data', filename), 'utf8');
}

describe('mdString', () => {
  it('keeps a single string', () => {
    expect(mdString('Hello World')).toStrictEqual('Hello World');
  });

  it('transforms a single newline into whitespace', () => {
    const input = `I think this should keep going
on a new line`;
    expect(mdString(input)).toStrictEqual('I think this should keep going on a new line');
  });

  it('replaces a paragraph with html linebreaks', () => {
    const input = `For more info
see here.

Or here.`;
    expect(mdString(input)).toStrictEqual('For more info see here.<br><br>Or here.');
  });
});

describe('mdBoolean', () => {
  it('returns yes for true values', () => {
    expect(mdBoolean(true)).toStrictEqual('yes');
  });

  it('returns no for false values', () => {
    expect(mdBoolean(false)).toStrictEqual('no');
  });

  it('returns no for undefined values', () => {
    expect(mdBoolean(undefined)).toStrictEqual('no');
  });
});

describe('mdCode', () => {
  it('puts a string into an inline code block', () => {
    expect(mdCode('echo foo')).toStrictEqual('`echo foo`');
  });

  it('returns an empty string for undefined values', () => {
    expect(mdCode(undefined)).toStrictEqual('');
  });
});

describe('mdAnchor', () => {
  it('creates an anchor', () => {
    expect(mdAnchor('input', 'foo_bar')).toStrictEqual('<a name="input_foo_bar"></a> [foo\\_bar](#input\\_foo\\_bar)');
  });

  it('replaces - with _', () => {
    expect(mdAnchor('input', 'foo-bar')).toStrictEqual('<a name="input_foo_bar"></a> [foo-bar](#input\\_foo\\_bar)');
  });
});

describe('generateMarkdownInputs', () => {
  it('create a heading with no inputs', () => {
    expect(Array.from(generateMarkdownInputs(undefined)).join('')).toStrictEqual(`## Inputs

(none)
`);
  });

  it('generates correct markdown', () => {
    const testdata = parse(readTestData('input-mixed.yml')) as Metadata['inputs'];
    const expectedResult = readTestData('input-mixed.md');
    expect(Array.from(generateMarkdownInputs(testdata)).join('')).toStrictEqual(expectedResult);
  });
});

describe('generateMarkdownOutputs', () => {
  it('create a heading with no inputs', () => {
    expect(Array.from(generateMarkdownOutputs(undefined)).join('')).toStrictEqual(`## Outputs

(none)
`);
  });

  it('generates correct markdown', () => {
    const testdata = parse(readTestData('output-mixed.yml')) as Metadata['outputs'];
    const expectedResult = readTestData('output-mixed.md');
    expect(Array.from(generateMarkdownOutputs(testdata)).join('')).toStrictEqual(expectedResult);
  });
});

describe('generateMarkdownType', () => {
  describe('Node action', () => {
    it('generates section with common attributes', () => {
      const testdata = parse(readTestData('type-nodejs.yml')) as MetadataJS['runs'];
      const expectedResult = readTestData('type-nodejs.md');
      expect(Array.from(generateMarkdownType(testdata)).join('')).toStrictEqual(expectedResult);
    });
  });

  describe('Composite action', () => {
    it('generates a section', () => {
      const testdata = parse(readTestData('type-composite.yml')) as MetadataComposite['runs'];
      const expectedResult = readTestData('type-composite.md');
      expect(Array.from(generateMarkdownType(testdata)).join('')).toStrictEqual(expectedResult);
    });
  });

  describe('Docker action', () => {
    it('generates a section when referencing a dockerfile', () => {
      const testdata = parse(readTestData('type-docker.yml')) as MetadataDocker['runs'];
      const expectedResult = readTestData('type-docker.md');
      expect(Array.from(generateMarkdownType(testdata)).join('')).toStrictEqual(expectedResult);
    });

    it('generates a section when referencing an image', () => {
      const testdata = parse(readTestData('type-docker-alpine.yml')) as MetadataDocker['runs'];
      const expectedResult = readTestData('type-docker-alpine.md');
      expect(Array.from(generateMarkdownType(testdata)).join('')).toStrictEqual(expectedResult);
    });

    it('lists environment variables', () => {
      const testdata = parse(readTestData('type-docker-env.yml')) as MetadataDocker['runs'];
      const expectedResult = readTestData('type-docker-env.md');
      expect(Array.from(generateMarkdownType(testdata)).join('')).toStrictEqual(expectedResult);
    });
  });
});

describe('itemToRows', () => {
  it('translates a number to a row', () => {
    expect(itemToRows('foo', 10)).toStrictEqual(['| foo | `10` |']);
  });

  it('translates a string to a row', () => {
    expect(itemToRows('foo', 'bar')).toStrictEqual(['| foo | `bar` |']);
  });

  it('translates an array to a row', () => {
    expect(itemToRows('foo', [10, 'alice'])).toStrictEqual(['| foo | `10`, `alice` |']);
  });

  it('translates an object to multiple rows', () => {
    expect(itemToRows('foo', { a: 10, b: ['yes', 'no'] })).toStrictEqual([
      '| a | `10` |',
      '| b | `yes`, `no` |',
    ]);
  });

  it('returns an empty array on other types', () => {
    expect(itemToRows('foo', () => 42)).toStrictEqual([]);
  });
});

describe('sectionToRows', () => {
  it('handles different types', () => {
    const input = {
      'bar': 'alice',
      'cannot handle': () => (42),
      'charly': {
        name: 'charly',
        point: ['a1', 'a2'],
      },
      'foo': 10,
      'ignore': 'This will be ignored',
    };

    expect(sectionToRows(input, ['charly', 'foo', 'bar', 'cannot handle'])).toStrictEqual([
      '| name | `charly` |',
      '| point | `a1`, `a2` |',
      '| foo | `10` |',
      '| bar | `alice` |',
    ]);
  });
});

describe('generateMarkdown', () => {
  it('generates a valid documentation', () => {
    const testdata = parse(readTestData('example.yml')) as Metadata;
    const expectedResult = readTestData('example.md');
    expect(Array.from(generateMarkdown(testdata, ['type', 'inputs', 'outputs'])).join('')).toStrictEqual(expectedResult);
  });
});

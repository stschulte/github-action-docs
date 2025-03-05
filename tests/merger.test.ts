import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import { merge } from '../src/merger.js';

async function consumeAsyncIterator(it: AsyncIterable<string>): Promise<string> {
  let result = '';
  for await (const chunk of it) {
    result += chunk;
  }
  return result;
}

describe('merge', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join('.', 'test-merger'));

    return () => {
      rmSync(tmpDir, { force: true, recursive: true });
    };
  });

  it('merges file with an iterator between START_PATTERN and END_PATTERN', async () => {
    const file = join(tmpDir, 'input.txt');
    const data = 'Above One\nAbove Two\n<!-- BEGIN_GITHUB_ACTION_DOCS -->\nWill overwrite\n<!-- END_GITHUB_ACTION_DOCS -->\nBelow One\nBelow Two\n';
    const it = ['Inject ', 'One\n', 'In', 'ject', ' Two\n'];

    writeFileSync(file, data, { encoding: 'utf8' });

    const result = await consumeAsyncIterator(merge(file, it));
    expect(result).toBe(`Above One
Above Two
<!-- BEGIN_GITHUB_ACTION_DOCS -->
Inject One
Inject Two
<!-- END_GITHUB_ACTION_DOCS -->
Below One
Below Two
`);
  });
});

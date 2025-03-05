import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

const START_PATTERN = /<!-- BEGIN_GITHUB_ACTION_DOCS -->/;
const END_PATTERN = /<!-- END_GITHUB_ACTION_DOCS -->/;

export async function* merge(path: string, mergeIterator: Iterable<string>): AsyncGenerator<string, undefined, unknown> {
  const rl = createInterface({
    crlfDelay: Infinity,
    input: createReadStream(path),
  });

  let shouldCopy = true;
  for await (const line of rl) {
    if (START_PATTERN.exec(line)) {
      yield line;
      yield '\n';
      for (const chunk of mergeIterator) {
        yield chunk;
      }
      shouldCopy = false;
    }
    else if (END_PATTERN.exec(line)) {
      yield line;
      yield '\n';
      shouldCopy = true;
    }
    else if (shouldCopy) {
      yield line;
      yield '\n';
    }
  }
}

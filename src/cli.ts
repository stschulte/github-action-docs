import { Command, Option } from 'commander';
import { readFileSync } from 'node:fs';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { parse } from 'yaml';

import type { Metadata } from './github.js';

import { generateMarkdown } from './generator.js';
import { replaceFile } from './writer.js';

const START_PATTERN = /<!-- BEGIN_GITHUB_ACTION_DOCS -->/;
const END_PATTERN = /<!-- END_GITHUB_ACTION_DOCS -->/;

type Options = {
  mode?: 'inject' | 'overwrite';
  outputFile?: string;
};

export async function cli(args: string[]): Promise<number> {
  const command = new Command();
  command
    .name('github-action-docs')
    .version('1.0.0')
    .option('--output-file [output-file]', 'markdown file to modify. If not specified prints on stdout')
    .addOption(new Option('--mode <mode>', 'overwrite a file or inject').choices(['overwrite', 'inject']))
    .argument('<file>', 'location of your actions.yml file');

  command.parse(args);

  const file = command.args[0];
  const options = command.opts<Options>();
  const outputFile = options.outputFile;

  if (!file) {
    console.error('You have to provide the path to your \'actions.yml\' file');
    throw new Error('Missing parameter');
  }

  const yaml = parse(readFileSync(file, 'utf8')) as Metadata;
  const doc = generateMarkdown(yaml, ['type', 'inputs', 'outputs']);

  if (outputFile) {
    await replaceFile(outputFile, async (stream) => {
      if (options.mode === 'inject') {
        const rl = createInterface({
          crlfDelay: Infinity,
          input: createReadStream(outputFile),
        });

        let shouldCopy = true;
        for await (const line of rl) {
          if (START_PATTERN.exec(line)) {
            stream.write(line);
            stream.write('\n');
            stream.write(doc);
            shouldCopy = false;
          }
          else if (END_PATTERN.exec(line)) {
            stream.write(line);
            stream.write('\n');
            shouldCopy = true;
          }
          else if (shouldCopy) {
            stream.write(line);
            stream.write('\n');
          }
        }
      }
      else {
        stream.write(doc);
      }
    });
  }
  else {
    console.log(doc);
  }

  return 0;
}

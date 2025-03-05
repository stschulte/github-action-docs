import { Command, Option } from 'commander';
import { readFileSync } from 'node:fs';
import { Readable } from 'node:stream';
import { parse } from 'yaml';

import type { Metadata } from './github.js';

import { generateMarkdown } from './generator.js';
import { merge } from './merger.js';
import { stdoutStream } from './stdoutStream.js';
import { replaceFile } from './writer.js';

type Options = {
  mode?: 'inject' | 'overwrite';
  outputFile?: string;
  sections?: Array<'inputs' | 'outputs' | 'type'>;
};

export async function cli(args: string[]): Promise<number> {
  const command = new Command();
  command
    .name('github-action-docs')
    .version('1.0.1')
    .option('--output-file [output-file]', 'markdown file to modify. If not specified prints on stdout')
    .addOption(new Option('--sections [sections...]', 'specify one or more sections to render. Available sections are "type", "inputs", "outputs"').choices(['outputs', 'inputs', 'type']))
    .addOption(new Option('--mode <mode>', 'overwrite a file or inject').choices(['overwrite', 'inject']))
    .argument('<file>', 'location of your actions.yml file');

  command.parse(args);

  const file = command.args[0];
  const options = command.opts<Options>();
  const outputFile = options.outputFile;

  raiseIfNotSet(file, 'You have to provide the path to your \'actions.yml\' file');

  const yaml = parse(readFileSync(file, 'utf8')) as Metadata;
  const doc = generateMarkdown(yaml, options.sections ?? ['type', 'inputs', 'outputs']);

  if (outputFile) {
    await replaceFile(outputFile, async (writeStream) => {
      return new Promise((resolve, reject) => {
        const readStream = options.mode === 'inject' ? Readable.from(merge(outputFile, doc)) : Readable.from(doc);

        readStream
          .pipe(writeStream)
          .on('close', () => { resolve(0); })
          .on('error', (error) => { reject(error); });
      });
    });
  }
  else {
    await new Promise((resolve, reject) => {
      const readStream = Readable.from(doc);
      const writeStream = stdoutStream();

      readStream
        .pipe(writeStream)
        .on('close', () => { resolve(0); })
        .on('error', (error) => { reject(error); });
    });
  }

  return 0;
}

export function raiseIfNotSet<T>(input: T | undefined, message: string): asserts input is T {
  if (input === undefined) {
    throw new Error(message);
  }
  return undefined;
}

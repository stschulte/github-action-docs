import type { Metadata } from './github.js';

import { sortEntries, sortInput } from './github.js';

export type Prefix = 'input' | 'output';

export type Sections = 'inputs' | 'outputs' | 'steps' | 'type';

export function* generateMarkdown(configuration: Metadata, sections: Sections[]): Generator<string, undefined, unknown> {
  let firstSection = true;
  for (const section of sections) {
    if (!firstSection) {
      yield '\n';
    }
    switch (section) {
      case 'inputs':
        for (const line of generateMarkdownInputs(configuration.inputs)) {
          yield line;
        }
        break;
      case 'outputs':
        for (const line of generateMarkdownOutputs(configuration.outputs)) {
          yield line;
        }
        break;
      case 'type':
        for (const line of generateMarkdownType(configuration.runs)) {
          yield line;
        }
        break;
    }
    firstSection = false;
  }
}

export function* generateMarkdownInputs(inputs: Metadata['inputs']): Generator<string, undefined, unknown> {
  yield '## Inputs\n\n';

  const entries = inputs ? Object.entries(inputs).sort(sortInput) : [];
  if (entries.length === 0) {
    yield '(none)\n';
  }
  else {
    yield '| Name | Description | Default | Required |\n';
    yield '|------|-------------|---------|:--------:|\n';
    for (const [name, info] of entries) {
      yield `| ${mdAnchor('input', name)} | ${mdString(info.description)} | ${mdCode(info.default)} | ${mdBoolean(info.required)} |\n`;
    }
  }
}

export function* generateMarkdownOutputs(outputs: Metadata['outputs']): Generator<string, undefined, unknown> {
  yield '## Outputs\n\n';

  const entries = outputs ? Object.entries(outputs).sort(sortEntries) : [];
  if (entries.length === 0) {
    yield '(none)\n';
  }
  else {
    yield '| Name | Description |\n';
    yield '|------|-------------|\n';
    for (const [name, info] of entries) {
      yield `| ${mdAnchor('output', name)} | ${mdString(info.description)} |\n`;
    }
  }
}

export function* generateMarkdownType(runs: Metadata['runs']): Generator<string, undefined, unknown> {
  yield '## Action type\n\n';
  if (runs.using == 'composite') {
    yield 'This is a composite action\n';
  }
  else if (runs.using == 'docker') {
    if (runs.image === 'Dockerfile') {
      yield `This is a Docker action using a ${mdCode(runs.image)}.\n`;
    }
    else {
      yield `This is a Docker action running the following docker image: ${mdCode(runs.image)}.\n`;
    }
    yield '\n';
    yield '| Attribute | Value |\n';
    yield '|-----------|-------|\n';
    for (const row of sectionToRows(runs, ['image', 'entrypoint', 'pre-entrypoint', 'post-entrypoint', 'args'])) {
      yield row;
      yield '\n';
    }
    if (runs.env) {
      yield '\n';
      yield 'The container will run with the following environment variables:\n\n';
      yield '| Environment Key | Value |\n';
      yield '|-----------------|-------|\n';
      for (const row of sectionToRows(runs, ['env'])) {
        yield row;
        yield '\n';
      }
    }
  }
  else {
    yield `This is a NodeJS action and depends on ${runs.using}\n\n`;
    yield '| Attribute | Value |\n';
    yield '|-----------|-------|\n';
    for (const row of sectionToRows(runs, ['using', 'main', 'pre', 'pre-if', 'post', 'post-if'])) {
      yield row;
      yield '\n';
    }
  }
}

export function itemToRows(key: string, value: unknown): string[] {
  if (Array.isArray(value)) {
    const formatted = value
      .filter(v => typeof v === 'string' || typeof v === 'number')
      .map(v => mdCode(v.toString()))
      .join(', ');
    return [`| ${key} | ${formatted} |`];
  }
  else if (typeof value === 'object' && value !== null) {
    return Object.entries(value).sort(sortEntries).flatMap(([k, v]) => itemToRows(k, v));
  }
  else if (typeof value === 'string' || typeof value === 'number') {
    const formatted = mdCode(value.toString());
    return [`| ${key} | ${formatted} |`];
  }
  return [];
}

/**
 * Create a string with an anchor pointing to itself
 *
 * When creating documentation it can be helpful to include anchors to
 * be able to share links to specific inputs and outputs
 *
 * This function can be used to turn a text into a link pointing to itself
 *
 * @param prefix - A prefix to prepend to the anchor name, e.g. `input`
 * @param item - The text which should become a link. It is expected to be save markdown.
 *
 * @returns Markdown with an HTML <a> tag to point to itself.
 */
export function mdAnchor(prefix: Prefix, item: string): string {
  const anchor = `${prefix}_${item.replace(/-/g, '_')}`;
  return `<a name="${anchor}"></a> [${item.replace(/_/g, '\\_')}](#${anchor.replace(/_/g, '\\_')})`;
}

export function mdBoolean(b: boolean | undefined): 'no' | 'yes' {
  return b ? 'yes' : 'no';
}

export function mdCode(s: string | undefined): string {
  if (s) {
    return `\`${s}\``;
  }
  return '';
}

/**
 * Sanitize a single string to be used in markdown tables
 *
 * Multiline strings in a normal markdown table are not possible. Linebreaks
 * can be performed with a void html `<br>` tag.
 *
 * We assume a single linebreak inside an action description is just meant to
 * visually break the line in editors and we can just rely on the browser to
 * perform a line wrap. Two linebreaks are interpreted as a new paragraph that
 * we can preserve with two <br><br> tags.
 *
 * @param s - The string to sanitize
 * @returns The sanitized version of the string
 */
export function mdString(s: string) {
  return s
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, ' ');
}

export function sectionToRows<T>(section: T, keys: Array<keyof T & string>): string[] {
  const rows: string[] = [];
  for (const key of keys) {
    const value = section[key];
    rows.push(...itemToRows(key, value));
  }
  return rows;
}

import type { Metadata } from './github.js';

import { sortEntries, sortInput } from './github.js';

export type Prefix = 'input' | 'output';

export type Sections = 'inputs' | 'outputs' | 'steps' | 'type';

export function generateMarkdown(configuration: Metadata, sections: Sections[]): string {
  const lines: string[] = [];

  for (const section of sections) {
    switch (section) {
      case 'inputs':
        lines.push(generateMarkdownInputs(configuration.inputs));
        break;
      case 'outputs':
        lines.push(generateMarkdownOutputs(configuration.outputs));
        break;
      case 'type':
        lines.push(generateMarkdownType(configuration.runs));
        break;
    }
  }

  return lines.join('\n');
}

export function generateMarkdownInputs(inputs: Metadata['inputs']): string {
  const lines = [];

  lines.push('## Inputs');
  lines.push('');

  const entries = inputs ? Object.entries(inputs).sort(sortInput) : [];
  if (entries.length === 0) {
    lines.push('(none)');
  }
  else {
    lines.push('| Name | Description | Default | Required |');
    lines.push('|------|-------------|---------|:--------:|');
    for (const [name, info] of entries) {
      lines.push(`| ${mdAnchor('input', name)} | ${mdString(info.description)} | ${mdCode(info.default)} | ${mdBoolean(info.required)} |`);
    }
  }
  lines.push('');

  return lines.join('\n');
}

export function generateMarkdownOutputs(outputs: Metadata['outputs']): string {
  const lines = [];

  lines.push('## Outputs');
  lines.push('');

  const entries = outputs ? Object.entries(outputs).sort(sortEntries) : [];
  if (entries.length === 0) {
    lines.push('(none)');
  }
  else {
    lines.push('| Name | Description |');
    lines.push('|------|-------------|');
    for (const [name, info] of entries) {
      lines.push(`| ${mdAnchor('output', name)} | ${mdString(info.description)} |`);
    }
  }
  lines.push('');

  return lines.join('\n');
}

export function generateMarkdownType(runs: Metadata['runs']): string {
  const lines = [];
  lines.push('## Action type');
  lines.push('');
  if (runs.using == 'composite') {
    lines.push('This is a composite action');
  }
  else if (runs.using == 'docker') {
    if (runs.image === 'Dockerfile') {
      lines.push(`This is a Docker action using a ${mdCode(runs.image)}.`);
    }
    else {
      lines.push(`This is a Docker action running the following docker image: ${mdCode(runs.image)}.`);
    }
    lines.push('');
    lines.push('| Attribute | Value |');
    lines.push('|-----------|-------|');
    lines.push(...sectionToRows(runs, ['image', 'entrypoint', 'pre-entrypoint', 'post-entrypoint', 'args']));
    if (runs.env) {
      lines.push('');
      lines.push('The container will run with the following environment variables:');
      lines.push('');
      lines.push('| Environment Key | Value |');
      lines.push('|-----------------|-------|');
      lines.push(...sectionToRows(runs, ['env']));
    }
  }
  else {
    lines.push(`This is a NodeJS action and depends on ${runs.using}`);
    lines.push('');
    lines.push('| Attribute | Value |');
    lines.push('|-----------|-------|');
    lines.push(...sectionToRows(runs, ['using', 'main', 'pre', 'pre-if', 'post', 'post-if']));
  }
  lines.push('');

  return lines.join('\n');
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

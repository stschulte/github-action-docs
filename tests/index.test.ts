import { describe, expect, it } from 'vitest';

import {
  generateMarkdownInputs as generateMarkdownInputsOrigin,
  generateMarkdown as generateMarkdownOrigin,
  generateMarkdownOutputs as generateMarkdownOutputsOrigin,
  generateMarkdownType as generateMarkdownTypeOrigin,
} from '../src/generator.js';
import {
  generateMarkdown,
  generateMarkdownInputs,
  generateMarkdownOutputs,
  generateMarkdownType,
} from '../src/index.js';

describe('index', () => {
  it('reexports generateMarkdown', () => {
    expect(generateMarkdown).toBe(generateMarkdownOrigin);
  });

  it('reexports generateMarkdownInputs', () => {
    expect(generateMarkdownType).toBe(generateMarkdownTypeOrigin);
  });

  it('reexports generateMarkdownOutputs', () => {
    expect(generateMarkdownInputs).toBe(generateMarkdownInputsOrigin);
  });

  it('reexports generateMarkdownType', () => {
    expect(generateMarkdownOutputs).toBe(generateMarkdownOutputsOrigin);
  });
});

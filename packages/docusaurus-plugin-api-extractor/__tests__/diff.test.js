/* eslint-disable node/no-unpublished-import */
/* eslint-disable node/no-unsupported-features/es-syntax */
import { cached } from '../dist/diff';
import fixturify from 'fixturify';
import { existsSync, rmdirSync, statSync, writeFileSync } from 'fs';

const dir = {
  src: {
    'a.ts': 'let a;',
    'b.ts': 'let b;',
    c: {
      'd.ts': 'let d',
    },
  },
  out: {},
};

beforeEach(() => {
  fixturify.writeSync('fixtures', dir);
});

afterEach(() => {
  rmdirSync('./fixtures', { recursive: true });
});

test('idempotent update', async () => {
  expect.assertions(3);

  await cached('./fixtures/src', './fixtures/out', async () => {
    await expect(true).toBe(true);
  });

  expect(existsSync('./fixtures/out/.api-extractor-meta')).toBe(true);

  await cached('./fixtures/src', './fixtures/out', async () => {
    // should never happen
    await expect(true).toBe(false);
  });

  expect(existsSync('./fixtures/out/.api-extractor-meta')).toBe(true);
});

test('update', async () => {
  expect.assertions(5);

  await cached('./fixtures/src', './fixtures/out', async () => {
    await expect(true).toBe(true);
  });

  writeFileSync('./fixtures/src/f.ts', 'let f;');

  expect(existsSync('./fixtures/out/.api-extractor-meta')).toBe(true);

  const oldStats = statSync('./fixtures/out/.api-extractor-meta');

  await cached('./fixtures/src', './fixtures/out', async () => {
    // should be called because we wrote into the src/ dir
    await expect(true).toBe(true);
  });

  expect(existsSync('./fixtures/out/.api-extractor-meta')).toBe(true);
  const newStats = statSync('./fixtures/out/.api-extractor-meta');

  expect(newStats.mtime > oldStats.mtime).toBe(true);
});

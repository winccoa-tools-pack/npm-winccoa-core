import fs from 'fs';
import os from 'os';
import path from 'path';
import { strict as assert } from 'assert';
import { describe, it, beforeEach, afterEach } from 'node:test';
import ProjEnvProjectConfig from '../../src/types/project/ProjEnvProjectConfig';

function writeFile(p: string, content: string) {
  fs.writeFileSync(p, content, 'utf-8');
}

function makeTempFile(prefix = 'projenv'): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));
  return path.join(dir, 'config');
}

describe('ProjEnvProjectConfig', () => {
  let cfgPath: string;
  let cfg: ProjEnvProjectConfig;

  beforeEach(() => {
    cfgPath = makeTempFile();
    cfg = new ProjEnvProjectConfig(cfgPath);
  });

  afterEach(() => {
    try { fs.rmSync(path.dirname(cfgPath), { recursive: true }); } catch { /* ignore */ }
  });

  it('parses and returns entry values', () => {
    const content = `[general]\nname = "TestProject"\n[sectionA]\nkey = "value"\n`;
    writeFile(cfgPath, content);
    const v = cfg.getEntryValue('name', 'general');
    assert.equal(v, 'TestProject');
  });

  it('insertValue adds new key', () => {
    writeFile(cfgPath, '[general]\n');
    const ret = cfg.insertValue('abc', 'newKey', 'general');
    assert.equal(ret, 0);
    const content = fs.readFileSync(cfgPath, 'utf-8');
    assert.match(content, /newKey = "abc"/);
  });

  it('insertValue fails when key exists', () => {
    writeFile(cfgPath, '[general]\nexisting = "1"\n');
    const ret = cfg.insertValue('2', 'existing', 'general');
    assert.equal(ret, -1);
  });

  it('setValue sets and overwrites keys', () => {
    writeFile(cfgPath, '[general]\nfoo = "bar"\n');
    const ret = cfg.setValue('baz', 'foo', 'general');
    assert.equal(ret, 0);
    const content = fs.readFileSync(cfgPath, 'utf-8');
    assert.match(content, /foo = "baz"/);
  });

  it('deleteValue removes key when value matches', () => {
    writeFile(cfgPath, '[general]\nk = "v"\n');
    const ret = cfg.deleteValue('v', 'k', 'general');
    assert.equal(ret, 0);
    const content = fs.readFileSync(cfgPath, 'utf-8');
    assert.doesNotMatch(content, /k =/);
  });

  it('deleteValue fails when value does not match', () => {
    writeFile(cfgPath, '[general]\nkk = "vv"\n');
    const ret = cfg.deleteValue('x', 'kk', 'general');
    assert.equal(ret, -1);
  });

  it('deleteEntry removes key regardless of value', () => {
    writeFile(cfgPath, '[general]\nrem = "1"\n');
    const ret = cfg.deleteEntry('rem', 'general');
    assert.equal(ret, 0);
    const content = fs.readFileSync(cfgPath, 'utf-8');
    assert.doesNotMatch(content, /rem =/);
  });
});

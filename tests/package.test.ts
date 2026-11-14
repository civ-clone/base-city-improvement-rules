import { execFileSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { expect } from 'chai';

describe('package', (): void => {
  it('is a library: no entry point, so loading it as a plugin registers nothing', (): void => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

    ['main', 'module', 'exports', 'bin'].forEach((key) =>
      expect(pkg).not.have.property(key)
    );
    expect(existsSync('index.ts')).false;
    expect(existsSync('index.js')).false;
  });

  it('ships its TypeScript', (): void => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

    expect(pkg.files).include('lib/*.ts');
  });

  it('registers no rule when each module is loaded', (): void => {
    const out = execFileSync(
      process.execPath,
      [
        '-e',
        "const {instance}=require('@civ-clone/core-rule/RuleRegistry');['build','buildPriority','city','created','has','maintenance','obsolete','threat'].forEach((m)=>require('./lib/'+m+'.js'));process.stdout.write(String(instance.entries().length))",
      ],
      { cwd: process.cwd() }
    ).toString();

    expect(out).equal('0');
  });
});

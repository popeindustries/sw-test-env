import esbuild from 'esbuild';
import fs from 'fs';
import glob from 'glob';
import path from 'path';

await esbuild.build({
  bundle: true,
  entryPoints: ['src/index.js'],
  format: 'esm',
  platform: 'node',
  splitting: false,
  target: 'node16',
  outfile: './sw-test-env.js',
  plugins: [
    {
      name: 'external',
      setup(build) {
        build.onResolve({ filter: /^[@a-zA-Z]/ }, (args) => {
          return { external: true };
        });
      },
    },
  ],
});

let types = '';

for (const typePath of glob.sync('src/**/_.d.ts')) {
  types += `// ${typePath}\n${fs.readFileSync(path.resolve(typePath), 'utf-8')}\n`;
}

fs.writeFileSync(
  'sw-test-env.d.ts',
  types.replace(/(declare) (interface|type|enum|namespace|function|class)/g, 'export $2'),
);

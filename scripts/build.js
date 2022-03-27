import esbuild from 'esbuild';
import fs from 'fs';
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

fs.writeFileSync(
  'sw-test-env.d.ts',
  fs
    .readFileSync(path.resolve('src/types.d.ts'), 'utf-8')
    .replace(/(declare) (interface|type|enum|namespace|function|class)/g, 'export $2'),
);

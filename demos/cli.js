import { runDemo } from './lib.js';

const demoName = process.argv[2];

if (!demoName) {
  throw new Error(
    'Pass demo name as an argument (name of one of the subfolders in demos folder)'
  );
}

await runDemo(demoName);

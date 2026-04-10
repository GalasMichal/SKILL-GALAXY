'use strict';

const fs = require('fs');
const path = require('path');

const appRoot = path.join(__dirname, '..');
const localPath = path.join(appRoot, 'src', 'environments', 'environment.local.ts');
const examplePath = path.join(appRoot, 'src', 'environments', 'environment.local.example.ts');

if (!fs.existsSync(localPath)) {
  fs.copyFileSync(examplePath, localPath);
  // eslint-disable-next-line no-console
  console.log(
    '[env] Created src/environments/environment.local.ts from environment.local.example.ts — add your Supabase URL and publishable key.'
  );
}

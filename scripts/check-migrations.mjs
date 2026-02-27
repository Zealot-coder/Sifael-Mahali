import { readdirSync } from 'node:fs';
import path from 'node:path';

const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
const allEntries = readdirSync(migrationsDir, { withFileTypes: true });
const files = allEntries.filter((entry) => entry.isFile()).map((entry) => entry.name);
const sqlFiles = files.filter((name) => name.endsWith('.sql'));

if (sqlFiles.length === 0) {
  console.error('Migration check failed: no SQL migration files found in supabase/migrations.');
  process.exit(1);
}

const allowedPattern = /^(\d{3,}|\d{14})_[a-z0-9_]+\.sql$/;
const invalid = sqlFiles.filter((name) => !allowedPattern.test(name));
if (invalid.length > 0) {
  console.error('Migration check failed: invalid migration filenames detected.');
  invalid.forEach((name) => console.error(` - ${name}`));
  console.error('Expected format: 001_name.sql or 20260227120000_name.sql');
  process.exit(1);
}

const prefixes = new Map();
for (const fileName of sqlFiles) {
  const [prefix] = fileName.split('_');
  if (prefixes.has(prefix)) {
    console.error(
      `Migration check failed: duplicate migration prefix "${prefix}" in "${prefixes.get(prefix)}" and "${fileName}".`
    );
    process.exit(1);
  }
  prefixes.set(prefix, fileName);
}

const sorted = [...sqlFiles].sort();
for (let index = 0; index < sqlFiles.length; index += 1) {
  if (sqlFiles[index] !== sorted[index]) {
    console.error(
      'Migration check failed: migration files must be lexicographically ordered in the repository.'
    );
    console.error(`Current: ${sqlFiles.join(', ')}`);
    console.error(`Sorted:  ${sorted.join(', ')}`);
    process.exit(1);
  }
}

console.log(`Migration check passed: ${sqlFiles.length} SQL migration file(s) validated.`);

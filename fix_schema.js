import fs from 'fs';
let c = fs.readFileSync('backend/db/schema.ts', 'utf8');
c = c.replace(/\.defaultNow\(\)/g, '.$defaultFn(() => new Date())');
c = c.replace(/updatedAt: timestamp\('updatedAt', \{ mode: 'date' \}\)\.\$defaultFn\(\(\) => new Date\(\)\)/g, "updatedAt: timestamp('updatedAt', { mode: 'date' }).$defaultFn(() => new Date()).$onUpdate(() => new Date())");
fs.writeFileSync('backend/db/schema.ts', c);
console.log('Schema fixed');

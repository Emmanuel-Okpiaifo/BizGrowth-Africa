/**
 * Post-build script to rename index.admin.html to index.html in dist-admin
 */
import { renameSync, existsSync } from 'fs';
import { join } from 'path';

const distAdminPath = join(process.cwd(), 'dist-admin');
const oldFile = join(distAdminPath, 'index.admin.html');
const newFile = join(distAdminPath, 'index.html');

try {
  if (existsSync(oldFile)) {
    renameSync(oldFile, newFile);
    console.log('✅ Successfully renamed index.admin.html to index.html');
  } else if (existsSync(newFile)) {
    console.log('✅ index.html already exists in dist-admin');
  } else {
    console.warn('⚠️  Neither index.admin.html nor index.html found in dist-admin');
    console.warn('   Make sure the build completed successfully');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error renaming file:', error.message);
  process.exit(1);
}

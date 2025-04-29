const fs = require('fs');
const path = require('path');

const sourceFolder = 'src/migrations';
const distFolder = 'dist/src/migrations';

const sourceExtension = '.ts';
const distExtensions = ['.d.ts', '.js', '.js.map'];
const distExtRegex = new RegExp(`(${distExtensions.join('|')})$`);

function getSourceFiles(dir) {
  const files = fs.readdirSync(dir);
  return files.filter(file => file.endsWith(sourceExtension));
}

function getDistFiles(dir) {
  const files = fs.readdirSync(dir);
  return files.filter(file => distExtensions.some(ext => file.endsWith(ext)));
}

function cleanDist() {
  const sourceFiles = getSourceFiles(sourceFolder);
  const distFiles = getDistFiles(distFolder);

  distFiles.forEach(file => {
    const correspondingTsFile = file.replace(distExtRegex, sourceExtension);
    if (!sourceFiles.includes(correspondingTsFile)) {
      const filePath = path.join(distFolder, file);
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${filePath}`);
    }
  });

  console.log('Cleanup completed!');
}

cleanDist();

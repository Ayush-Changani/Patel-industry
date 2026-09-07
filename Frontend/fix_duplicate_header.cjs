const fs = require('fs');
const path = require('path');

function fix(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
       fix(fullPath);
    } else if (file.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const match = content.match(/import\s+Header\s+from\s+[^;]+;/g);
      if (match && match.length > 1) {
         console.log('Fixing duplicate Header import in:', fullPath);
         
         let isFirst = true;
         content = content.replace(/import\s+Header\s+from\s+[^;]+;\r?\n?/g, (m) => {
             if (isFirst) {
                isFirst = false;
                return m;
             }
             return '';
         });
         fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}
fix('d:/Patel_Industries/Frontend/src/layouts');

const fs = require('fs');
const path = require('path');

function addHeader(dir) {
  let updatedCount = 0;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('Auth')) {
         updatedCount += addHeader(fullPath);
      }
    } else if (file.endsWith('.jsx')) {
      try {
          let content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('return (') && content.includes('<Sidebar') && !content.includes('<Header')) {
            const sidebarImportMatch = content.match(/import\s+Sidebar\s+from\s+[\"']([^\"']+)[\"']/);
            if (sidebarImportMatch) {
              const sidebarPath = sidebarImportMatch[1];
              const headerPath = sidebarPath.replace('Sidebar', 'Header');
              
              content = content.replace(sidebarImportMatch[0], sidebarImportMatch[0] + '\nimport Header from "' + headerPath + '";');
              content = content.replace(/(<main[^>]*>)/, '$1\n        <Header />');
              
              fs.writeFileSync(fullPath, content, 'utf8');
              console.log('Updated:', fullPath);
              updatedCount++;
            }
          }
      } catch (err) {
          console.error("Error formatting " + fullPath, err);
      }
    }
  }
  return updatedCount;
}

try {
    const count = addHeader('d:/Patel_Industries/Frontend/src/layouts');
    console.log('Total files updated successfully:', count);
} catch (e) {
    console.error("Fatal:", e);
}

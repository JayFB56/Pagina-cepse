const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'pages');
if(!fs.existsSync(pagesDir)) {
    console.error("Pages directory not found!");
    process.exit(1);
}

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

const replacer = `async function loadComponent(id, filePath) { try { const r = await fetch('../' + filePath); let html = await r.text(); html = html.replace(/(src|href)="assets\\//g, '$1="../assets/'); html = html.replace(/href="index\\.html/g, 'href="../index.html'); html = html.replace(/href="(acuerdo-ministerial\\.html|estatuto\\.html|galeria\\.html|noticias\\.html|presidente\\.html|privacidad\\.html|servicios\\.html)/g, 'href="$1'); document.getElementById(id).innerHTML = html; } catch (e) { console.error(e); } }`;

files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Update <link> and <script> src inside the <head>
    content = content.replace(/href="css\//g, 'href="../css/');
    content = content.replace(/src="js\//g, 'src="../js/');
    
    // Update assets paths everywhere in the HTML body
    content = content.replace(/href="assets\//g, 'href="../assets/');
    content = content.replace(/src="assets\//g, 'src="../assets/');
    
    // Update breadcrumb navigation & other links to index.html
    content = content.replace(/href="index\.html"/g, 'href="../index.html"');
    
    // Replace the loadComponent function
    content = content.replace(/async function loadComponent(?:[^}]+|}(?!\s*\}))+}\s*}/, replacer);
    // wait, replacing `catch (e) { console.error(e); } }`
    // safer regex:
    content = content.replace(/async function loadComponent[\s\S]*?catch\s*\([^\)]*\)\s*\{[\s\S]*?\}\s*\}/, replacer);
    
    fs.writeFileSync(filePath, content);
});

console.log("Pages updated successfully.");

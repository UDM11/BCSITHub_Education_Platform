const fs = require('fs');
const path = require('path');

// 1. Read files as text
const notesFilePath = path.join(__dirname, '../src/data/notesData.ts');
const chapterFilePath = path.join(__dirname, '../src/data/chapterData.ts');

const notesText = fs.readFileSync(notesFilePath, 'utf8');
const chapterText = fs.readFileSync(chapterFilePath, 'utf8');

// 2. Parse chapterData.ts to build a map of: courseCode -> chapterIds[]
const courseChaptersMap = {};
const chapterBlockRegex = /courseCode:\s*"([^"]+)"[\s\S]*?chapters:\s*\[([\s\S]*?)\]/g;
let match;

while ((match = chapterBlockRegex.exec(chapterText)) !== null) {
  const courseCode = match[1];
  const chaptersBlock = match[2];
  
  const unitRegex = /id:\s*"([^"]+)"/g;
  let unitMatch;
  const chapterIds = [];
  
  while ((unitMatch = unitRegex.exec(chaptersBlock)) !== null) {
    chapterIds.push(unitMatch[1]);
  }
  
  courseChaptersMap[courseCode] = chapterIds;
}

// 3. Parse notesData.ts to find Semesters and Subjects
const semesters = [];
const semesterBlockRegex = /id:\s*(\d+)[\s\S]*?name:\s*"([^"]+)"[\s\S]*?subjects:\s*\[([\s\S]*?)\]/g;
let semMatch;

while ((semMatch = semesterBlockRegex.exec(notesText)) !== null) {
  const semId = parseInt(semMatch[1], 10);
  const semName = semMatch[2];
  const subjectsBlock = semMatch[3];
  
  const subjectRegex = /courseCode:\s*"([^"]*)"[\s\S]*?courseName:\s*"([^"]*)"/g;
  let subMatch;
  const subjects = [];
  
  while ((subMatch = subjectRegex.exec(subjectsBlock)) !== null) {
    const courseCode = subMatch[1];
    const courseName = subMatch[2];
    subjects.push({ courseCode, courseName });
  }
  
  semesters.push({ id: semId, name: semName, subjects });
}

// 4. Generate sitemap entries
const baseUrl = 'https://bcsithub.web.app';
const currentDate = new Date().toISOString().split('T')[0];

const staticRoutes = [
  { path: '', changefreq: 'daily', priority: '1.0' },
  { path: '/notes', changefreq: 'weekly', priority: '0.9' },
  { path: '/past-papers', changefreq: 'weekly', priority: '0.9' },
  { path: '/syllabus', changefreq: 'monthly', priority: '0.8' },
  { path: '/cgpa-calculator', changefreq: 'monthly', priority: '0.8' },
  { path: '/quiz-generator', changefreq: 'weekly', priority: '0.8' },
  { path: '/code-compiler', changefreq: 'monthly', priority: '0.7' },
  { path: '/pomodoro-timer', changefreq: 'monthly', priority: '0.7' },
  { path: '/colleges', changefreq: 'monthly', priority: '0.6' },
  { path: '/pu-notices', changefreq: 'daily', priority: '0.7' },
  { path: '/signin', changefreq: 'monthly', priority: '0.4' },
  { path: '/signup', changefreq: 'monthly', priority: '0.4' }
];

let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
xmlContent += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

// Add static routes
staticRoutes.forEach(route => {
  xmlContent += '  <url>\n';
  xmlContent += `    <loc>${baseUrl}${route.path}</loc>\n`;
  xmlContent += `    <lastmod>${currentDate}</lastmod>\n`;
  xmlContent += `    <changefreq>${route.changefreq}</changefreq>\n`;
  xmlContent += `    <priority>${route.priority}</priority>\n`;
  xmlContent += '  </url>\n';
});

// Add dynamic routes for semesters, subjects, and chapters
semesters.forEach(sem => {
  // Semester list route
  xmlContent += '  <url>\n';
  xmlContent += `    <loc>${baseUrl}/notes/${sem.id}</loc>\n`;
  xmlContent += `    <lastmod>${currentDate}</lastmod>\n`;
  xmlContent += `    <changefreq>weekly</changefreq>\n`;
  xmlContent += `    <priority>0.8</priority>\n`;
  xmlContent += '  </url>\n';

  // Subjects inside this semester
  sem.subjects.forEach(sub => {
    if (!sub.courseCode) return; // skip specializations without codes

    const encodedCode = encodeURIComponent(sub.courseCode);
    
    // Subject route (chapter list)
    xmlContent += '  <url>\n';
    xmlContent += `    <loc>${baseUrl}/notes/${sem.id}/${encodedCode}</loc>\n`;
    xmlContent += `    <lastmod>${currentDate}</lastmod>\n`;
    xmlContent += `    <changefreq>weekly</changefreq>\n`;
    xmlContent += `    <priority>0.7</priority>\n`;
    xmlContent += '  </url>\n';

    // Chapters inside this subject
    const chapterIds = courseChaptersMap[sub.courseCode];
    if (chapterIds) {
      chapterIds.forEach(chapId => {
        const encodedChap = encodeURIComponent(chapId);
        
        // Specific Chapter Notes route
        xmlContent += '  <url>\n';
        xmlContent += `    <loc>${baseUrl}/notes/${sem.id}/${encodedCode}/${encodedChap}</loc>\n`;
        xmlContent += `    <lastmod>${currentDate}</lastmod>\n`;
        xmlContent += `    <changefreq>monthly</changefreq>\n`;
        xmlContent += `    <priority>0.6</priority>\n`;
        xmlContent += '  </url>\n';
      });
    }
  });
});

xmlContent += '</urlset>\n';

// Write sitemap.xml
fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), xmlContent);
console.log("Successfully generated public/sitemap.xml containing all chapters and subjects!");

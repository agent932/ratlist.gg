/**
 * Link Checker - Scans project for URLs and validates them
 * 
 * Checks:
 * - External URLs (HTTP/HTTPS)
 * - Internal Next.js routes
 * - Anchor links
 * - Image sources
 * - API endpoints
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface LinkResult {
  file: string;
  line: number;
  type: 'external' | 'internal' | 'anchor' | 'image' | 'api';
  url: string;
  status: 'valid' | 'invalid' | 'warning' | 'unchecked';
  reason?: string;
}

const results: LinkResult[] = [];
const processedUrls = new Map<string, boolean>();

// File extensions to scan
const SCANNABLE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.md', '.mdx', '.json'];

// Known valid routes in the project
const VALID_ROUTES = [
  '/',
  '/auth/sign-in',
  '/auth/callback',
  '/browse',
  '/contact',
  '/dashboard',
  '/diagnostic',
  '/faq',
  '/flags',
  '/games',
  '/guidelines',
  '/privacy',
  '/report',
  '/terms',
  '/admin/dashboard',
  '/admin/users',
  '/admin/audit',
  '/moderator/flags',
];

// Known valid API routes
const VALID_API_ROUTES = [
  '/api/health',
  '/api/games',
  '/api/incidents',
  '/api/search/player',
  '/api/user/me',
  '/api/user/incidents',
  '/api/user/flags',
  '/api/user/export',
  '/api/user/link-player',
  '/api/user/unlink-player',
  '/api/user/update-profile',
  '/api/dashboard/stats',
  '/api/notifications/toggle',
  '/api/admin/fix-functions',
  '/api/admin/users/search',
];

// External domains that are expected
const KNOWN_DOMAINS = [
  'supabase.co',
  'vercel.app',
  'github.com',
  'nextjs.org',
  'react.dev',
  'tailwindcss.com',
  'radix-ui.com',
];

function findFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    // Skip node_modules, .next, .git
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === '.specify') {
      return;
    }

    if (stat.isDirectory()) {
      findFiles(filePath, fileList);
    } else if (SCANNABLE_EXTENSIONS.some(ext => file.endsWith(ext))) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function extractUrls(content: string, filePath: string): void {
  const lines = content.split('\n');
  const relativePath = path.relative(process.cwd(), filePath);

  // Patterns to match URLs
  const patterns = [
    // href="..." or href='...'
    /href=["']([^"']+)["']/g,
    // src="..." or src='...'
    /src=["']([^"']+)["']/g,
    // url(...) in CSS
    /url\(["']?([^)"']+)["']?\)/g,
    // Markdown links [text](url)
    /\[([^\]]+)\]\(([^)]+)\)/g,
    // Direct HTTP(S) URLs
    /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g,
    // Next.js Link to="..."
    /to=["']([^"']+)["']/g,
    // router.push('...')
    /router\.push\(["']([^"']+)["']/g,
    // window.location = '...'
    /window\.location\s*=\s*["']([^"']+)["']/g,
    // API fetch calls
    /fetch\(["']([^"']+)["']/g,
  ];

  lines.forEach((line, index) => {
    patterns.forEach((pattern) => {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        let url = match[1] || match[2] || match[0];
        
        // Skip empty, template literals, or obvious variables
        if (!url || url.includes('${') || url.startsWith('data:') || url === '#') {
          continue;
        }

        // Clean up the URL
        url = url.trim();

        // Categorize the URL
        let type: LinkResult['type'] = 'external';
        if (url.startsWith('http://') || url.startsWith('https://')) {
          type = 'external';
        } else if (url.startsWith('/api/')) {
          type = 'api';
        } else if (url.startsWith('/')) {
          type = 'internal';
        } else if (url.startsWith('#')) {
          type = 'anchor';
        } else if (url.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i)) {
          type = 'image';
        }

        results.push({
          file: relativePath,
          line: index + 1,
          type,
          url,
          status: 'unchecked',
        });
      }
    });
  });
}

function validateUrls(): void {
  results.forEach((result) => {
    // Skip if already checked
    const cacheKey = `${result.type}:${result.url}`;
    if (processedUrls.has(cacheKey)) {
      result.status = processedUrls.get(cacheKey) ? 'valid' : 'invalid';
      return;
    }

    switch (result.type) {
      case 'internal':
        // Check if route exists in our known routes
        const baseRoute = result.url.split('?')[0].split('#')[0];
        const isDynamicRoute = baseRoute.includes('[') || VALID_ROUTES.some(route => {
          // Check for dynamic segments
          if (baseRoute.startsWith('/player/') || baseRoute.startsWith('/user/')) {
            return true;
          }
          return route === baseRoute;
        });

        if (isDynamicRoute || VALID_ROUTES.includes(baseRoute)) {
          result.status = 'valid';
          processedUrls.set(cacheKey, true);
        } else {
          result.status = 'warning';
          result.reason = 'Route not found in known routes list';
          processedUrls.set(cacheKey, false);
        }
        break;

      case 'api':
        // Check if API route exists
        const apiPath = result.url.split('?')[0];
        const isDynamicApi = apiPath.includes('[') || VALID_API_ROUTES.some(route => {
          if (apiPath.startsWith('/api/user/[') || 
              apiPath.startsWith('/api/admin/users/[') ||
              apiPath.startsWith('/api/moderator/')) {
            return true;
          }
          return route === apiPath;
        });

        if (isDynamicApi || VALID_API_ROUTES.includes(apiPath)) {
          result.status = 'valid';
          processedUrls.set(cacheKey, true);
        } else {
          result.status = 'warning';
          result.reason = 'API route not found in known routes list';
          processedUrls.set(cacheKey, false);
        }
        break;

      case 'external':
        // Check if domain is known
        const isKnownDomain = KNOWN_DOMAINS.some(domain => result.url.includes(domain));
        if (isKnownDomain) {
          result.status = 'valid';
          result.reason = 'Known trusted domain';
        } else {
          result.status = 'warning';
          result.reason = 'External URL - manual verification recommended';
        }
        processedUrls.set(cacheKey, isKnownDomain);
        break;

      case 'anchor':
        result.status = 'valid';
        result.reason = 'Anchor link - requires page-specific validation';
        processedUrls.set(cacheKey, true);
        break;

      case 'image':
        // Check if image path exists
        const imagePath = path.join(process.cwd(), 'public', result.url.replace(/^\//, ''));
        if (fs.existsSync(imagePath)) {
          result.status = 'valid';
          processedUrls.set(cacheKey, true);
        } else {
          result.status = 'invalid';
          result.reason = 'Image file not found in public directory';
          processedUrls.set(cacheKey, false);
        }
        break;
    }
  });
}

function generateReport(): void {
  const grouped = {
    valid: results.filter(r => r.status === 'valid'),
    invalid: results.filter(r => r.status === 'invalid'),
    warning: results.filter(r => r.status === 'warning'),
    unchecked: results.filter(r => r.status === 'unchecked'),
  };

  const reportPath = path.join(process.cwd(), 'LINK_CHECK_REPORT.md');
  
  let report = `# Link Check Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- ✅ Valid: ${grouped.valid.length}\n`;
  report += `- ❌ Invalid: ${grouped.invalid.length}\n`;
  report += `- ⚠️  Warnings: ${grouped.warning.length}\n`;
  report += `- ❓ Unchecked: ${grouped.unchecked.length}\n`;
  report += `- **Total Links Found: ${results.length}**\n\n`;

  // Invalid links
  if (grouped.invalid.length > 0) {
    report += `## ❌ Invalid Links (${grouped.invalid.length})\n\n`;
    grouped.invalid.forEach((r) => {
      report += `- **${r.url}**\n`;
      report += `  - File: \`${r.file}:${r.line}\`\n`;
      report += `  - Type: ${r.type}\n`;
      if (r.reason) report += `  - Reason: ${r.reason}\n`;
      report += `\n`;
    });
  }

  // Warnings
  if (grouped.warning.length > 0) {
    report += `## ⚠️  Warnings (${grouped.warning.length})\n\n`;
    const uniqueWarnings = Array.from(new Set(grouped.warning.map(r => r.url)));
    uniqueWarnings.forEach((url) => {
      const instances = grouped.warning.filter(r => r.url === url);
      report += `- **${url}**\n`;
      report += `  - Found in ${instances.length} location(s)\n`;
      if (instances[0].reason) report += `  - Reason: ${instances[0].reason}\n`;
      report += `  - Locations:\n`;
      instances.slice(0, 5).forEach((r) => {
        report += `    - \`${r.file}:${r.line}\`\n`;
      });
      if (instances.length > 5) {
        report += `    - ... and ${instances.length - 5} more\n`;
      }
      report += `\n`;
    });
  }

  // Valid links summary (deduplicated)
  report += `## ✅ Valid Links\n\n`;
  const validByType = {
    internal: grouped.valid.filter(r => r.type === 'internal'),
    api: grouped.valid.filter(r => r.type === 'api'),
    external: grouped.valid.filter(r => r.type === 'external'),
    image: grouped.valid.filter(r => r.type === 'image'),
    anchor: grouped.valid.filter(r => r.type === 'anchor'),
  };

  Object.entries(validByType).forEach(([type, links]) => {
    if (links.length > 0) {
      const unique = Array.from(new Set(links.map(l => l.url)));
      report += `### ${type.charAt(0).toUpperCase() + type.slice(1)} (${unique.length} unique)\n\n`;
      unique.slice(0, 10).forEach(url => {
        report += `- ${url}\n`;
      });
      if (unique.length > 10) {
        report += `- ... and ${unique.length - 10} more\n`;
      }
      report += `\n`;
    }
  });

  fs.writeFileSync(reportPath, report);
  console.log(`\n📊 Report generated: ${reportPath}\n`);
}

function printSummary(): void {
  const grouped = {
    valid: results.filter(r => r.status === 'valid'),
    invalid: results.filter(r => r.status === 'invalid'),
    warning: results.filter(r => r.status === 'warning'),
  };

  console.log('\n' + '='.repeat(60));
  console.log('LINK CHECK SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Valid Links:    ${grouped.valid.length}`);
  console.log(`❌ Invalid Links:  ${grouped.invalid.length}`);
  console.log(`⚠️  Warnings:       ${grouped.warning.length}`);
  console.log(`📝 Total Scanned:  ${results.length}`);
  console.log('='.repeat(60));

  if (grouped.invalid.length > 0) {
    console.log('\n❌ INVALID LINKS FOUND:');
    grouped.invalid.forEach((r) => {
      console.log(`  ${r.url}`);
      console.log(`    → ${r.file}:${r.line}`);
      if (r.reason) console.log(`    → ${r.reason}`);
    });
  }

  if (grouped.warning.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    const uniqueWarnings = Array.from(new Set(grouped.warning.map(r => r.url)));
    uniqueWarnings.slice(0, 5).forEach((url) => {
      const count = grouped.warning.filter(r => r.url === url).length;
      console.log(`  ${url} (${count} occurrence${count > 1 ? 's' : ''})`);
    });
    if (uniqueWarnings.length > 5) {
      console.log(`  ... and ${uniqueWarnings.length - 5} more warnings`);
    }
  }

  console.log('\n');
}

// Main execution
console.log('🔍 Scanning project for links...\n');

const projectRoot = path.resolve(__dirname, '..');
const files = findFiles(projectRoot);

console.log(`Found ${files.length} files to scan\n`);

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8');
  extractUrls(content, file);
});

console.log(`Extracted ${results.length} total links\n`);
console.log('🔎 Validating links...\n');

validateUrls();
printSummary();
generateReport();

console.log('✅ Link check complete!\n');

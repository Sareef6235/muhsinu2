import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = 'c:/Users/User/Documents/muhsin2';
const OUTPUT = path.join(ROOT, 'flattened_v3');

if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT);

// Helper to find all files recursively
function walk(dir, results = []) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.git') && file !== OUTPUT) {
                walk(file, results);
            }
        } else {
            results.push(file);
        }
    });
    return results;
}

const allFiles = walk(ROOT);

// Mappings
const htmlFiles = allFiles.filter(f => f.endsWith('.html'));
const cssFiles = allFiles.filter(f => f.endsWith('.css'));
const jsFiles = allFiles.filter(f => f.endsWith('.js'));
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.mp4', '.pdf'];
const assetFiles = allFiles.filter(f => imageExtensions.includes(path.extname(f).toLowerCase()));

const pathMapping = {}; // old_rel_path -> new_name

// 1. Plan asset names (flat root)
assetFiles.forEach(f => {
    const rel = path.relative(ROOT, f).replace(/\\/g, '/');
    const ext = path.extname(f);
    let newName = rel.replace(/\//g, '_').replace(/ /g, '_');
    pathMapping[rel] = newName;
});

// 2. Plan HTML names (flat root)
htmlFiles.forEach(f => {
    const rel = path.relative(ROOT, f).replace(/\\/g, '/');
    if (rel === 'index.html') {
        pathMapping[rel] = 'index.html';
    } else {
        let newName = rel.replace(/\//g, '_').replace(/ /g, '_');
        pathMapping[rel] = newName;
    }
});

console.log('--- Path Mapping Ready ---');

// 3. Cache CSS and JS content
const cssCache = {};
cssFiles.forEach(f => {
    const rel = path.relative(ROOT, f).replace(/\\/g, '/');
    cssCache[rel] = fs.readFileSync(f, 'utf8');
});

const jsCache = {};
jsFiles.forEach(f => {
    const rel = path.relative(ROOT, f).replace(/\\/g, '/');
    jsCache[rel] = fs.readFileSync(f, 'utf8');
});

// Function to resolve relative paths
function resolveRel(fromFile, targetRel) {
    if (targetRel.startsWith('/')) {
        // Path is root-relative, resolve from ROOT
        return targetRel.substring(1); // Return path relative to root
    }
    const dir = path.dirname(fromFile);
    const abs = path.resolve(ROOT, dir, targetRel);
    return path.relative(ROOT, abs).replace(/\\/g, '/');
}

// 4. Process HTML
htmlFiles.forEach(f => {
    const rel = path.relative(ROOT, f).replace(/\\/g, '/');
    let content = fs.readFileSync(f, 'utf8');

    // Inline CSS
    content = content.replace(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi, (match, href) => {
        if (href.startsWith('http') || href.startsWith('//')) return match;
        const resolved = resolveRel(rel, href);
        if (cssCache[resolved]) {
            return `<style>\n/* ${resolved} */\n${cssCache[resolved]}\n</style>`;
        }
        return match;
    });

    // Inline JS
    content = content.replace(/<script[^>]+src=["']([^"']+)["'][^>]*><\/script>/gi, (match, src) => {
        if (src.startsWith('http') || src.startsWith('//')) return match;
        const resolved = resolveRel(rel, src);
        if (jsCache[resolved]) {
            let jsContent = jsCache[resolved];
            // Strip imports and exports
            jsContent = jsContent.replace(/^import\s+.*\s+from\s+['"].*['"];?\s*$/gm, '');
            jsContent = jsContent.replace(/^export\s+(default\s+)?/gm, '');

            // --- Menu & Dynamic Link Patching ---

            // 1. Expand Static Fallback Menu
            if (resolved.includes('site-nav.js')) {
                const newMenu = [
                    { id: 'home', label: 'Home', href: '/index.html', tKey: 'home' },
                    { id: 'about', label: 'About', href: '/pages/about/index.html', tKey: 'about' },
                    { id: 'services', label: 'Services', href: '/pages/services/index.html', tKey: 'services' },
                    {
                        id: 'results',
                        label: 'Results',
                        href: '#',
                        type: 'dropdown',
                        tKey: 'results_menu',
                        children: [
                            { label: 'Search', href: '/pages/results/index.html', tKey: 'results' },
                            { label: 'Archive', href: '/pages/results/archive.html', tKey: 'results_old' },
                            { label: 'Rules', href: '/pages/results/rules.html', tKey: 'notices' }
                        ]
                    },
                    { id: 'gallery', label: 'Gallery', href: '/pages/gallery/index.html', tKey: 'gallery' },
                    { id: 'creations', label: 'Creations', href: '/pages/students/creations.html', tKey: 'creations' },
                    { id: 'news', label: 'News', href: '/pages/news/index.html', tKey: 'news' },
                    { id: 'admin', label: 'Admin', href: '/pages/admin/index.html', tKey: 'dashboard' }
                ];
                jsContent = jsContent.replace(/getStaticFallback\(\) \{[\s\S]*?return \[[\s\S]*?\];/, `getStaticFallback() { return ${JSON.stringify(newMenu, null, 2)};`);
            }

            // 2. Flatten hardcoded links in JS: href: '/path/to/page.html' or "href": "/..."
            jsContent = jsContent.replace(/(['"]?href['"]?)\s*:\s*['"]\/([^'"]+\.html)['"]/gi, (m, attr, path) => {
                if (pathMapping[path]) return `${attr}: '${pathMapping[path]}'`;
                return m;
            });

            // 3. Flatten BP links: BP + 'path/to/page.html'
            jsContent = jsContent.replace(/BP\s*\+\s*['"]([^'"]+\.html)['"]/gi, (m, path) => {
                if (pathMapping[path]) return `'${pathMapping[path]}'`;
                return m;
            });

            return `<script>\n// ${resolved}\n${jsContent}\n</script>`;
        }
        return match;
    });

    // Handle internal link navigation to flat structure
    content = content.replace(/href=["']([^"']+\.html)["']/gi, (match, val) => {
        if (val.startsWith('http') || val.startsWith('//')) return match;
        const resolved = resolveRel(rel, val);
        if (pathMapping[resolved]) {
            return `href="${pathMapping[resolved]}"`;
        }
        return match;
    });

    // Update Image Paths in HTML (including posters and icons)
    content = content.replace(/(src|poster|href)=["']([^"']+\.(jpg|jpeg|png|gif|svg|webp|mp4|pdf))["']/gi, (match, attr, val) => {
        if (val.startsWith('http') || val.startsWith('//')) return match;
        if (val.startsWith('data:')) return match;
        const resolved = resolveRel(rel, val);
        if (pathMapping[resolved]) {
            return `${attr}="${pathMapping[resolved]}"`;
        }
        return match;
    });

    // Handle CSS url() paths inside <style> tags
    content = content.replace(/url\(["']?([^"')]+\.(jpg|jpeg|png|gif|svg|webp))["']?\)/gi, (match, val) => {
        if (val.startsWith('http') || val.startsWith('//')) return match;
        if (val.startsWith('data:')) return match;
        const resolved = resolveRel(rel, val);
        if (pathMapping[resolved]) {
            return `url("${pathMapping[resolved]}")`;
        }
        return match;
    });

    // Special case for data attributes that might hold image paths
    content = content.replace(/data-(src|image|bg)=["']([^"']+)["']/gi, (match, attr, val) => {
        if (val.startsWith('http') || val.startsWith('//')) return match;
        const resolved = resolveRel(rel, val);
        if (pathMapping[resolved]) {
            return `data-${attr}="${pathMapping[resolved]}"`;
        }
        return match;
    });

    // Save final HTML
    const newName = pathMapping[rel];
    fs.writeFileSync(path.join(OUTPUT, newName), content);
});

// 5. Copy Assets
assetFiles.forEach(f => {
    const rel = path.relative(ROOT, f).replace(/\\/g, '/');
    const newName = pathMapping[rel];
    fs.copyFileSync(f, path.join(OUTPUT, newName));
});

console.log('Flattening complete! Files saved to: ' + OUTPUT);

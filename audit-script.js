const fs = require('fs');
const path = require('path');

/**
 * Website File Reference Audit Script
 * Scans all HTML files and verifies that referenced assets exist
 */

const PROJECT_ROOT = __dirname;
const RESULTS = {
    totalHtmlFiles: 0,
    totalReferences: 0,
    missingFiles: [],
    brokenReferences: [],
    validReferences: 0,
    warnings: []
};

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Recursively find all HTML files in directory
 */
function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Skip node_modules, .git, etc.
            if (!file.startsWith('.') && file !== 'node_modules') {
                findHtmlFiles(filePath, fileList);
            }
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

/**
 * Extract file references from HTML content
 */
function extractReferences(htmlContent, htmlFilePath) {
    const references = [];

    // Match href and src attributes (excluding http/https URLs)
    const hrefRegex = /href=["'](?!http|#|mailto:|tel:)([^"']+)["']/gi;
    const srcRegex = /src=["'](?!http|data:)([^"']+)["']/gi;

    let match;

    // Extract href references
    while ((match = hrefRegex.exec(htmlContent)) !== null) {
        references.push({
            type: 'href',
            path: match[1],
            line: htmlContent.substring(0, match.index).split('\n').length
        });
    }

    // Extract src references
    while ((match = srcRegex.exec(htmlContent)) !== null) {
        references.push({
            type: 'src',
            path: match[1],
            line: htmlContent.substring(0, match.index).split('\n').length
        });
    }

    return references;
}

/**
 * Resolve relative path and check if file exists
 */
function verifyReference(htmlFilePath, referencePath) {
    // Remove query strings and fragments
    const cleanPath = referencePath.split('?')[0].split('#')[0];

    // Resolve the path relative to the HTML file
    const htmlDir = path.dirname(htmlFilePath);
    const absolutePath = path.resolve(htmlDir, cleanPath);

    // Check if file exists
    return {
        exists: fs.existsSync(absolutePath),
        absolutePath: absolutePath,
        relativePath: path.relative(PROJECT_ROOT, absolutePath)
    };
}

/**
 * Audit a single HTML file
 */
function auditHtmlFile(htmlFilePath) {
    const relativePath = path.relative(PROJECT_ROOT, htmlFilePath);
    log(`\n📄 Scanning: ${relativePath}`, 'cyan');

    const content = fs.readFileSync(htmlFilePath, 'utf-8');
    const references = extractReferences(content, htmlFilePath);

    RESULTS.totalReferences += references.length;

    references.forEach(ref => {
        const verification = verifyReference(htmlFilePath, ref.path);

        if (!verification.exists) {
            // Check if it's an external page we haven't created yet
            if (ref.path.startsWith('pages/') && ref.type === 'href') {
                RESULTS.warnings.push({
                    file: relativePath,
                    line: ref.line,
                    reference: ref.path,
                    message: 'Page link (may be intentional placeholder)'
                });
            } else {
                RESULTS.brokenReferences.push({
                    file: relativePath,
                    line: ref.line,
                    type: ref.type,
                    reference: ref.path,
                    resolved: verification.relativePath
                });

                if (!RESULTS.missingFiles.includes(verification.relativePath)) {
                    RESULTS.missingFiles.push(verification.relativePath);
                }
            }
        } else {
            RESULTS.validReferences++;
        }
    });
}

/**
 * Generate audit report
 */
function generateReport() {
    log('\n' + '='.repeat(60), 'bold');
    log('📊 AUDIT REPORT', 'bold');
    log('='.repeat(60), 'bold');

    log(`\n✅ HTML Files Scanned: ${RESULTS.totalHtmlFiles}`, 'green');
    log(`✅ Total References Found: ${RESULTS.totalReferences}`, 'green');
    log(`✅ Valid References: ${RESULTS.validReferences}`, 'green');

    if (RESULTS.brokenReferences.length > 0) {
        log(`\n❌ Broken References: ${RESULTS.brokenReferences.length}`, 'red');
        log('\nDetails:', 'red');
        RESULTS.brokenReferences.forEach(ref => {
            log(`  • ${ref.file}:${ref.line}`, 'yellow');
            log(`    ${ref.type}: ${ref.reference}`, 'yellow');
            log(`    → Resolved to: ${ref.resolved}`, 'yellow');
        });
    } else {
        log(`\n✅ No Broken References Found!`, 'green');
    }

    if (RESULTS.missingFiles.length > 0) {
        log(`\n📂 Missing Files (${RESULTS.missingFiles.length}):`, 'red');
        RESULTS.missingFiles.forEach(file => {
            log(`  • ${file}`, 'yellow');
        });
    }

    if (RESULTS.warnings.length > 0) {
        log(`\n⚠️  Warnings (${RESULTS.warnings.length}):`, 'yellow');
        RESULTS.warnings.forEach(warn => {
            log(`  • ${warn.file}:${warn.line} - ${warn.reference}`, 'yellow');
            log(`    ${warn.message}`, 'yellow');
        });
    }

    // Save JSON report
    const reportPath = path.join(PROJECT_ROOT, 'audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(RESULTS, null, 2));
    log(`\n💾 Detailed report saved to: audit-report.json`, 'cyan');

    log('\n' + '='.repeat(60), 'bold');

    // Exit code: 0 if no broken references, 1 otherwise
    return RESULTS.brokenReferences.length === 0 ? 0 : 1;
}

/**
 * Main execution
 */
function main() {
    log('🔍 Starting Website File Reference Audit...', 'bold');
    log(`📁 Project Root: ${PROJECT_ROOT}\n`, 'cyan');

    // Find all HTML files
    const htmlFiles = findHtmlFiles(PROJECT_ROOT);
    RESULTS.totalHtmlFiles = htmlFiles.length;

    log(`Found ${htmlFiles.length} HTML files\n`, 'green');

    // Audit each file
    htmlFiles.forEach(file => {
        auditHtmlFile(file);
    });

    // Generate and display report
    const exitCode = generateReport();
    process.exit(exitCode);
}

// Run the audit
main();

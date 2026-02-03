#!/usr/bin/env python3
"""
Website File Reference Audit Script
Scans all HTML files and verifies that referenced assets exist
"""

import os
import re
import json
from pathlib import Path
from typing import List, Dict, Set

# ANSI color codes for terminal output
class Colors:
    RESET = '\033[0m'
    GREEN = '\033[32m'
    RED = '\033[31m'
    YELLOW = '\033[33m'
    CYAN = '\033[36m'
    BOLD = '\033[1m'

class AuditResults:
    def __init__(self):
        self.total_html_files = 0
        self.total_references = 0
        self.missing_files: List[str] = []
        self.broken_references: List[Dict] = []
        self.valid_references = 0
        self.warnings: List[Dict] = []

def log(message: str, color: str = 'RESET'):
    color_code = getattr(Colors, color.upper(), Colors.RESET)
    print(f"{color_code}{message}{Colors.RESET}")

def find_html_files(directory: Path) -> List[Path]:
    """Recursively find all HTML files in directory"""
    html_files = []
    
    for root, dirs, files in os.walk(directory):
        # Skip hidden directories and node_modules
        dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']
        
        for file in files:
            if file.endswith('.html'):
                html_files.append(Path(root) / file)
    
    return html_files

def extract_references(html_content: str, html_file_path: Path) -> List[Dict]:
    """Extract file references from HTML content"""
    references = []
    
    href_pattern = r'href=["\']((?!http|#|mailto:|tel:)[^"\']+)["\']'
    src_pattern = r'src=["\']((?!http|data:)[^"\']+)["\']'
    poster_pattern = r'poster=["\']((?!http)[^"\']+)["\']'
    
    for pattern, ref_type in [(href_pattern, 'href'), (src_pattern, 'src'), (poster_pattern, 'poster')]:
        for match in re.finditer(pattern, html_content):
            ref_path = match.group(1)
            line_num = html_content[:match.start()].count('\n') + 1
            
            references.append({
                'type': ref_type,
                'path': ref_path,
                'line': line_num
            })
    
    return references

def verify_reference(html_file_path: Path, reference_path: str, project_root: Path) -> Dict:
    """Resolve relative path and check if file exists, with directory support"""
    # [NEW] Ignore dynamic JS template literals
    if '${' in reference_path:
        return {
            'exists': True,
            'absolute_path': reference_path,
            'relative_path': reference_path
        }

    # Remove query strings and fragments
    clean_path = reference_path.split('?')[0].split('#')[0]
    
    # Resolve the path relative to the HTML file
    html_dir = html_file_path.parent
    absolute_path = (html_dir / clean_path).resolve()
    
    # Check if file exists
    exists = absolute_path.exists()
    
    # Handle Directory Links (Clean URLs)
    if not exists:
        # Check if the reference is a directory link (ends with / or is intended as such)
        # Try appending index.html
        alt_path = absolute_path / "index.html"
        if alt_path.exists():
            exists = True
            absolute_path = alt_path
    elif absolute_path.is_dir():
        # It's a directory that exists, check for index.html inside
        alt_path = absolute_path / "index.html"
        if alt_path.exists():
            # If index.html exists, we consider the directory link valid
            absolute_path = alt_path
    
    # Normalize path for reporting
    try:
        relative_to_root = absolute_path.relative_to(project_root)
    except ValueError:
        relative_to_root = absolute_path
    
    return {
        'exists': exists,
        'absolute_path': str(absolute_path),
        'relative_path': str(relative_to_root)
    }

def audit_html_file(html_file_path: Path, project_root: Path, results: AuditResults):
    """Audit a single HTML file"""
    relative_path = html_file_path.relative_to(project_root)
    log(f"\nScanning: {relative_path}", 'cyan')
    
    try:
        with open(html_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        log(f"  Warning: Error reading file: {e}", 'yellow')
        return
    
    references = extract_references(content, html_file_path)
    results.total_references += len(references)
    
    for ref in references:
        verification = verify_reference(html_file_path, ref['path'], project_root)
        
        if not verification['exists']:
            # Check if it's an external page link (may be intentional)
            if ref['path'].startswith('pages/') and ref['type'] == 'href':
                results.warnings.append({
                    'file': str(relative_path),
                    'line': ref['line'],
                    'reference': ref['path'],
                    'message': 'Page link (may be intentional placeholder)'
                })
            else:
                results.broken_references.append({
                    'file': str(relative_path),
                    'line': ref['line'],
                    'type': ref['type'],
                    'reference': ref['path'],
                    'resolved': verification['relative_path']
                })
                
                if verification['relative_path'] not in results.missing_files:
                    results.missing_files.append(verification['relative_path'])
        else:
            results.valid_references += 1

def generate_report(results: AuditResults, project_root: Path) -> int:
    """Generate and display audit report"""
    log('\n' + '=' * 60, 'bold')
    log('AUDIT REPORT', 'bold')
    log('=' * 60, 'bold')
    
    log(f"\n[OK] HTML Files Scanned: {results.total_html_files}", 'green')
    log(f"[OK] Total References Found: {results.total_references}", 'green')
    log(f"[OK] Valid References: {results.valid_references}", 'green')
    
    if results.broken_references:
        log(f"\n[ERROR] Broken References: {len(results.broken_references)}", 'red')
        log('\nDetails:', 'red')
        for ref in results.broken_references:
            log(f"  * {ref['file']}:{ref['line']}", 'yellow')
            log(f"    {ref['type']}: {ref['reference']}", 'yellow')
            log(f"    -> Resolved to: {ref['resolved']}", 'yellow')
    else:
        log(f"\n[OK] No Broken References Found!", 'green')
    
    if results.missing_files:
        log(f"\n[ERROR] Missing Files ({len(results.missing_files)}):", 'red')
        for file in results.missing_files:
            log(f"  * {file}", 'yellow')
    
    if results.warnings:
        log(f"\n[WARNING] Warnings ({len(results.warnings)}):", 'yellow')
        for warn in results.warnings:
            log(f"  * {warn['file']}:{warn['line']} - {warn['reference']}", 'yellow')
            log(f"    {warn['message']}", 'yellow')
    
    # Save JSON report
    report_path = project_root / 'audit-report.json'
    report_data = {
        'total_html_files': results.total_html_files,
        'total_references': results.total_references,
        'valid_references': results.valid_references,
        'broken_references': results.broken_references,
        'missing_files': results.missing_files,
        'warnings': results.warnings
    }
    
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report_data, f, indent=2)
    
    log(f"\n[SAVED] Detailed report saved to: audit-report.json", 'cyan')
    log('\n' + '=' * 60, 'bold')
    
    # Return exit code: 0 if no broken references, 1 otherwise
    return 0 if not results.broken_references else 1

def main():
    """Main execution"""
    project_root = Path(__file__).parent.resolve()
    
    log('Starting Website File Reference Audit...', 'bold')
    log(f'Project Root: {project_root}\n', 'cyan')
    
    # Find all HTML files
    html_files = find_html_files(project_root)
    results = AuditResults()
    results.total_html_files = len(html_files)
    
    log(f'Found {len(html_files)} HTML files\n', 'green')
    
    # Audit each file
    for html_file in html_files:
        audit_html_file(html_file, project_root, results)
    
    # Generate and display report
    exit_code = generate_report(results, project_root)
    exit(exit_code)

if __name__ == '__main__':
    main()

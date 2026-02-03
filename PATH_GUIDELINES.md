# Path Reference Guidelines

## Quick Reference Table

| Your File Location | Reference Type | Path Formula | Example |
|-------------------|----------------|--------------|---------|
| **Root** (`index.html`) | CSS | `assets/css/[file]` | `assets/css/styles.css` |
| | JS | `assets/js/[file]` | `assets/js/site-nav.js` |
| | Page | `pages/[section]/` | `pages/about/` |
| | Image | `assets/images/[file]` | `assets/images/logo.png` |
| **Subpage** (`pages/*/index.html`) | CSS | `../../assets/css/[file]` | `../../assets/css/styles.css` |
| | JS | `../../assets/js/[file]` | `../../assets/js/site-nav.js` |
| | Root | `../../` | `../../` |
| | Sibling page | `../[section]/` | `../about/` |
| | Image | `../../assets/images/[file]` | `../../assets/images/logo.png` |
| **Nested page** (`pages/services/service-detail.html`) | CSS | `../../assets/css/[file]` | `../../assets/css/styles.css` |
| | JS | `../../assets/js/[file]` | `../../assets/js/site-nav.js` |
| | Same folder | `./index.html` | `./index.html` |

## The `../` Rule

Each `../` means "go up one directory level":

```
Current file:     pages/about/index.html
Reference:        ../../assets/css/styles.css

Breaking it down:
pages/about/index.html  → Your current location
../                      → Go up to pages/
../                      → Go up to muhsin2/
assets/css/styles.css   → Now access assets
```

## Common Patterns

### Standard Page Template

Every page in `pages/*/index.html` should have:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Page Title | MIFTHAHUL HUDA</title>
    
    <!-- Core CSS (always same from subpages) -->
    <link rel="stylesheet" href="../../assets/css/styles.css">
    <link rel="stylesheet" href="../../assets/css/modern-nav.css">
    <link rel="stylesheet" href="../../assets/css/site-footer.css">
    
    <!-- Core JS (always same from subpages) -->
    <script src="../../assets/js/site-nav.js" defer></script>
    <script src="../../assets/js/site-footer.js" defer></script>
    <script src="../../assets/js/script.js" defer></script>
</head>
<body>
    <header id="main-header"></header>
    <!-- Content -->
    <footer id="main-footer"></footer>
</body>
</html>
```

### Navigation Links

#### From Homepage (`index.html`)
```html
<a href="pages/about/index.html">About</a>
<a href="pages/services/index.html">Services</a>
<a href="pages/booking/index.html">Book Now</a>
```

#### From Subpage (`pages/about/index.html`)
```html
<a href="../../index.html">Home</a>
<a href="../services/index.html">Services</a>
<a href="../booking/index.html">Book Now</a>
```

#### From Nested Page (`pages/services/service-detail.html`)
```html
<a href="../../index.html">Home</a>
<a href="./index.html">All Services</a>
<a href="../about/index.html">About</a>
```

## Common Mistakes to Avoid

### ❌ Mistake 1: Mixing Absolute and Relative Paths
```html
<!-- WRONG -->
<link rel="stylesheet" href="/assets/css/styles.css">
<script src="assets/js/site-nav.js"></script>
```

**Why it's wrong**: The first uses an absolute path (starts with `/`), the second is relative but from the wrong level.

**✅ Correct (from subpage)**:
```html
<link rel="stylesheet" href="../../assets/css/styles.css">
<script src="../../assets/js/site-nav.js"></script>
```

### ❌ Mistake 2: Wrong Number of `../`
```html
<!-- WRONG (from pages/about/index.html) -->
<link rel="stylesheet" href="../assets/css/styles.css">
```

**Why it's wrong**: Only goes up one level (to `pages/`), but `assets/` is at root level.

**✅ Correct**:
```html
<link rel="stylesheet" href="../../assets/css/styles.css">
```

### ❌ Mistake 3: Using Root-Relative Paths
```html
<!-- WRONG -->
<a href="/pages/about/index.html">About</a>
```

**Why it's wrong**: Won't work when deployed or opened locally without a server.

**✅ Correct (from homepage)**:
```html
<a href="pages/about/index.html">About</a>
```

**✅ Correct (from subpage)**:
```html
<a href="../about/index.html">About</a>
```

### ❌ Mistake 4: Forgetting to Update Paths After Moving Files
**Scenario**: You move `about.html` from root to `pages/about/index.html`

**Before move**:
```html
<link rel="stylesheet" href="assets/css/styles.css">
```

**After move** (MUST UPDATE):
```html
<link rel="stylesheet" href="../../assets/css/styles.css">
```

## Path Calculation Formula

```
Number of ../ = Depth of current file from root

Examples:
index.html                          → Depth 0 → Use: assets/css/
pages/about/index.html              → Depth 2 → Use: ../../assets/css/
pages/services/service-detail.html  → Depth 2 → Use: ../../assets/css/
```

## Pre-Move Checklist

Before moving ANY file:

1. ✅ **Document current location**: Note where file is now
2. ✅ **Plan new location**: Decide final destination
3. ✅ **Calculate new depth**: Count directory levels from root
4. ✅ **List all asset references**: Find all `href=` and `src=` in the file
5. ✅ **Update each reference**: Adjust `../` count based on new depth
6. ✅ **Move the file**: Use Git or file manager
7. ✅ **Test immediately**: Open page and check console for 404 errors
8. ✅ **Update links TO this file**: Update any pages that link to it

## Testing Your Paths

### Method 1: Browser DevTools
1. Open the page in browser
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Look for red errors (especially 404)
5. Check **Network** tab for failed requests

### Method 2: Automated Script
```bash
node audit-script.js
```

### Method 3: Visual Inspection
- Page loads but no styles? → CSS path is wrong
- Images show broken icon? → Image path is wrong
- JavaScript features don't work? → JS path is wrong

## Recovery Steps

**If you moved files and paths broke**:

1. **Don't panic** - Files aren't lost, just paths are wrong
2. **Open browser console** - See which files are 404
3. **Check file depth** - Count `../` needed from new location
4. **Update paths** - Fix the `href=` and `src=` attributes
5. **Test again** - Refresh and verify console is clear
6. **Run audit** - Use `node audit-script.js` to verify all pages

## Quick Fixes

### "My CSS isn't loading!"
```html
<!-- Check your path from current file to assets/css/ -->
<!-- If you're in pages/about/index.html: -->
<link rel="stylesheet" href="../../assets/css/styles.css">
```

### "Images are broken!"
```html
<!-- Same depth rule applies -->
<!-- From pages/about/index.html: -->
<img src="../../assets/images/logo.png" alt="Logo">
```

### "Navigation links are 404!"
```html
<!-- From subpage to another subpage: -->
<a href="../services/index.html">Services</a>

<!-- From subpage to root: -->
<a href="../../index.html">Home</a>
```

## Best Practices

1. ✅ **Always use relative paths** (never `/assets/...`)
2. ✅ **Be consistent** - same pattern across all pages
3. ✅ **Test after every move** - don't move 10 files then test
4. ✅ **Use the audit script** - automate error detection
5. ✅ **Document your structure** - keep FILE_STRUCTURE.md updated
6. ✅ **Version control** - use Git to track changes
7. ✅ **Name files consistently** - e.g., always `index.html` in folders

## Need Help?

**Run the audit script**:
```bash
node audit-script.js
```

This will scan every HTML file and report any broken references!

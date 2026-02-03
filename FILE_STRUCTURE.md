# Website File Structure

## Directory Tree

```
muhsin2/
├── index.html                          # Homepage
├── audit-script.js                     # Automated audit tool
├── package.json                        # Project dependencies
│
├── pages/                              # All site pages
│   ├── about/
│   │   └── index.html                  # About page
│   ├── admin/
│   │   ├── index.html                  # Admin login
│   │   ├── dashboard.html              # Admin dashboard
│   │   └── services.html               # Service management
│   ├── booking/
│   │   └── index.html                  # Tuition booking
│   ├── gallery/
│   │   └── index.html                  # Photo/video gallery
│   ├── news/
│   │   └── index.html                  # News & updates
│   ├── notices/                        # Notice pages (future)
│   ├── poster-builder/
│   │   └── index.html                  # Poster builder tool
│   ├── results/
│   │   ├── index.html                  # Result search
│   │   └── exam_result.html            # Old results archive
│   ├── services/
│   │   ├── index.html                  # Services listing
│   │   └── service-detail.html         # Service detail page
│   └── students/
│       ├── creations.html              # Student work gallery
│       ├── creative.html               # Creative submission
│       └── creation_receipt.html       # Fee receipt form
│
├── assets/                             # All static assets
│   ├── css/                            # Stylesheets
│   │   ├── styles.css                  # Main global styles
│   │   ├── modern-nav.css              # Navigation styles
│   │   ├── site-footer.css             # Footer styles
│   │   ├── site-languages.css          # Language switcher styles
│   │   ├── responsive-nav.css          # Responsive navigation
│   │   ├── premium-animations.css      # Animation library
│   │   ├── poster-builder.css          # Poster builder UI
│   │   ├── poster-properties.css       # Properties panel
│   │   └── plugins/                    # Plugin-specific styles
│   │
│   ├── js/                             # JavaScript files
│   │   ├── script.js                   # Main site logic
│   │   ├── site-nav.js                 # Navigation handler
│   │   ├── site-footer.js              # Footer handler
│   │   ├── site-languages.js           # Multi-language system
│   │   ├── firebase.js                 # Firebase config
│   │   ├── auth-nav-guard.js           # Auth-based navigation
│   │   ├── admin-auth.js               # Admin authentication
│   │   ├── admin-logic.js              # Admin panel logic
│   │   ├── booking_logic.js            # Booking form handler
│   │   ├── subject-storage.js          # Subject management
│   │   ├── news-service.js             # News system
│   │   ├── services-cms.js             # Services CMS
│   │   ├── service-renderer.js         # Service page renderer
│   │   ├── services-data.js            # Services data store
│   │   ├── gallery-admin.js            # Gallery admin
│   │   ├── gallery-db.js               # Gallery database
│   │   ├── media-optimizer.js          # Media compression
│   │   ├── poster-builder.js           # Poster builder core
│   │   ├── poster-controls-engine.js   # Builder controls
│   │   ├── poster-templates.js         # Poster templates
│   │   ├── premium-animations.js       # Animation engine
│   │   ├── bot.js                      # Chatbot logic
│   │   └── utils/
│   │       └── performance.js          # Performance utilities
│   │
│   ├── system/                         # System architecture
│   │   ├── core.js                     # Core system
│   │   ├── plugin-loader.js            # Plugin loader
│   │   └── plugins/
│   │       ├── jet-services.js         # JetEngine-like services
│   │       └── visual-builder.js       # Visual builder plugin
│   │
│   ├── plugins/                        # External plugin emulations
│   │   ├── elementor-pro/
│   │   ├── jet-engine/
│   │   ├── membership/
│   │   ├── woocommerce/
│   │   └── [38+ plugin directories]
│   │
│   ├── images/                         # Image assets
│   ├── videos/                         # Video assets
│   ├── gallery/                        # Gallery media
│   ├── pdfs/                           # PDF documents
│   ├── creations/                      # Student creations
│   └── elements.json                   # Design elements data
│
└── system/                             # System-level scripts
    └── plugins/
        └── service-templates.js        # Service templates
```

## File Location Quick Reference

| File Type | Location | Example |
|-----------|----------|---------|
| Homepage | Root directory | `index.html` |
| Site pages | `pages/[section]/` | `pages/about/index.html` |
| Admin pages | `pages/admin/` | `pages/admin/dashboard.html` |
| Student pages | `pages/students/` | `pages/students/creations.html` |
| Service pages | `pages/services/` | `pages/services/index.html` |
| Global CSS | `assets/css/` | `assets/css/styles.css` |
| Global JS | `assets/js/` | `assets/js/site-nav.js` |
| System core | `assets/system/` | `assets/system/core.js` |
| Plugin emulations | `assets/plugins/` | `assets/plugins/elementor-pro/` |
| Images | `assets/images/` | `assets/images/logo.png` |
| Videos | `assets/videos/` | `assets/videos/intro.mp4` |
| PDFs | `assets/pdfs/` | `assets/pdfs/schedule.pdf` |

## Path Resolution Rules

### From Root (`index.html`)
- CSS: `assets/css/[filename].css`
- JS: `assets/js/[filename].js`
- Pages: `pages/[section]/index.html`
- Images: `assets/images/[filename]`

### From Subpage (`pages/*/index.html`)
- CSS: `../../assets/css/[filename].css`
- JS: `../../assets/js/[filename].js`
- Root: `../../index.html`
- Other pages: `../[section]/index.html`
- Images: `../../assets/images/[filename]`

### From Nested Page (`pages/services/service-detail.html`)
- CSS: `../../assets/css/[filename].css`
- JS: `../../assets/js/[filename].js`
- Root: `../../index.html`
- Same folder: `./index.html`

## File Count Summary

- **Total HTML Pages**: 19
- **CSS Files**: 15+
- **JavaScript Files**: 44+
- **Plugin Directories**: 38+
- **System Directories**: 4

## Special Directories

### `pages/notices/`
Currently empty - reserved for future notice/announcement pages.

### `assets/creations/`
Contains student-submitted artwork and projects.

### `assets/plugins/`
Contains WordPress plugin emulations for compatibility:
- ACF (Advanced Custom Fields)
- Elementor Pro
- JetEngine
- Membership plugins
- WooCommerce
- And 30+ more

### `assets/system/`
Core system architecture for the site's plugin-based design.

## Notes

- All pages use consistent `index.html` naming within their directories
- Admin section is isolated in `pages/admin/` for security
- Student-facing features are grouped in `pages/students/`
- Assets are centralized in `assets/` for easy management
- Static site design - no server-side dependencies required

# Header & Footer Integration - Quick Start Guide

## 📦 Files Created

### Header Navigation
1. **`assets/css/global-navigation.css`** - Navigation styling
2. **`assets/js/global-navigation.js`** - Navigation engine
3. **`assets/js/navigation-config.js`** - Menu configuration

### Footer
4. **`assets/css/global-footer.css`** - Footer styling
5. **`assets/js/global-footer.js`** - Footer engine
6. **`assets/js/footer-config.js`** - Footer configuration

### Template
7. **`template-page.html`** - Complete working example

---

## 🚀 Quick Integration

### Add to Every Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Your existing head content -->
    
    <!-- Add these CSS files -->
    <link rel="stylesheet" href="assets/css/global-navigation.css">
    <link rel="stylesheet" href="assets/css/global-footer.css">
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
</head>
<body data-page-id="your-page-id">
    
    <!-- Header Navigation -->
    <div id="global-nav"></div>
    
    <!-- Your Content -->
    <main id="main-content" style="padding-top: 90px;">
        <!-- Your page content here -->
    </main>
    
    <!-- Footer -->
    <div id="global-footer"></div>
    
    <!-- Scripts -->
    <script src="assets/js/global-navigation.js"></script>
    <script src="assets/js/navigation-config.js"></script>
    <script src="assets/js/global-footer.js"></script>
    <script src="assets/js/footer-config.js"></script>
</body>
</html>
```

---

## ⚙️ Configuration

### Update Navigation Menu

Edit `assets/js/navigation-config.js`:

```javascript
menuItems: [
  {
    id: 'home',
    label: 'Home',
    href: '/index.html',
    icon: 'ph ph-house'
  },
  {
    id: 'services',
    label: 'Services',
    href: '#',
    icon: 'ph ph-briefcase',
    children: [
      {
        id: 'tuition',
        label: 'Tuition Classes',
        href: '/pages/tuition.html'
      }
    ]
  }
]
```

### Update Footer

Edit `assets/js/footer-config.js`:

```javascript
columns: [
  {
    title: 'Quick Links',
    type: 'menu',
    items: [
      { label: 'Home', href: '/index.html', icon: 'ph ph-house' },
      { label: 'About', href: '/about.html', icon: 'ph ph-info' }
    ]
  }
]
```

---

## ✅ Features

**Header:**
- ✅ Sticky navigation
- ✅ Dropdown menus
- ✅ Mobile hamburger menu
- ✅ Active page highlighting
- ✅ Icon support

**Footer:**
- ✅ Multi-column layout
- ✅ Social media links
- ✅ Contact information
- ✅ Newsletter subscription
- ✅ Responsive design

---

## 📝 Next Steps

1. Open `template-page.html` to see the complete example
2. Copy the HTML structure to your existing pages
3. Update `navigation-config.js` with your menu items
4. Update `footer-config.js` with your footer content
5. Test on different devices

---

**All files are ready to use!** 🎉

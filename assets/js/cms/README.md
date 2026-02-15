# CMS Quick Reference Guide

## 🚀 Quick Start

### Import Data
```javascript
// Click "Import JSON" in Data Management dropdown
// OR programmatically:
await CMS.importJSON();
```

### Publish Data
```javascript
// Click "Static Publish" in Data Management dropdown
// OR programmatically:
await CMS.publishWithPreview();
```

---

## 📚 Module APIs

### Toast
```javascript
Toast.success(message, duration);
Toast.error(message, duration);
Toast.warning(message, duration);
Toast.info(message, duration);
```

### DataManager
```javascript
DataManager.load(data, source);
DataManager.get();
DataManager.hasData();
DataManager.clear();
DataManager.onChange(callback);
DataManager.getStats();
```

### ValidationEngine
```javascript
ValidationEngine.validate(data, schema);
ValidationEngine.validateJSON(jsonString);
ValidationEngine.validateFileType(file);
ValidationEngine.validateFileSize(file, maxMB);
```

### BackupManager
```javascript
BackupManager.create(data, label);
BackupManager.restore(id);
BackupManager.list();
BackupManager.getLatest();
BackupManager.getStats();
```

### StaticPublisher
```javascript
StaticPublisher.publishWithPreview(filename);
StaticPublisher.quickPublish(filename);
StaticPublisher.canPublish();
```

### JSONImporter
```javascript
JSONImporter.importWithPicker(options);
JSONImporter.importFile(file, options);
JSONImporter.validateFile(file);
```

### CMS (High-Level)
```javascript
CMS.publishWithPreview();
CMS.quickPublish();
CMS.importJSON();
CMS.clearData();
CMS.getStatus();
```

---

## 🎯 Common Tasks

### Load & Publish
```javascript
// 1. Import
await CMS.importJSON();

// 2. Publish
await CMS.publishWithPreview();
```

### Backup & Restore
```javascript
// Create backup
BackupManager.create(DataManager.get(), 'My Backup');

// List backups
const backups = BackupManager.list();

// Restore
const data = BackupManager.restore(backups[0].id);
DataManager.load(data, 'restore');
```

### Custom Validation
```javascript
const schema = {
    data: {
        required: true,
        type: 'array',
        minLength: 1,
        validator: (arr) => arr.every(item => item.id)
    }
};

const result = ValidationEngine.validate(data, schema);
```

---

## 🔧 Troubleshooting

### Publish Button Disabled
- **Cause:** No data loaded
- **Fix:** Import data or load via DataManager

### Import Fails
- **Cause:** Invalid JSON or schema mismatch
- **Fix:** Check console for validation errors

### Backup Not Created
- **Cause:** LocalStorage full or disabled
- **Fix:** Clear old backups or enable LocalStorage

---

## 📁 File Locations

- **Core:** `assets/js/cms/core/`
- **Features:** `assets/js/cms/features/`
- **Styles:** `assets/css/toast-notifications.css`
- **Init:** `assets/js/cms/cms-init.js`

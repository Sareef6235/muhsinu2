# Firestore Security Rules - Deployment Guide

## 📁 Files Created

1. **`firestore.rules`** - Development rules (currently active)
2. **`firestore.rules.production`** - Production rules (for deployment)

## 🔧 Current Rules (Development)

The current `firestore.rules` file has **VERY PERMISSIVE** rules for development:

```javascript
✅ Users can create their own documents
✅ Authenticated users can read all user documents
✅ Authenticated users can manage subjects
✅ Anyone can create bookings
✅ Authenticated users can manage bookings
```

### Key Features:
- ✅ **Allows user document creation** - Users can create `/users/{UID}` on first login
- ✅ **Authenticated read access** - Any logged-in user can read user documents
- ✅ **Subject management** - Authenticated users can add/edit subjects
- ✅ **Public bookings** - Anyone can submit booking forms

## 🚀 Deploying Rules to Firebase

### Option 1: Firebase Console (Recommended for beginners)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **my-pc-895cd**
3. Click **Firestore Database** in the left menu
4. Click the **Rules** tab
5. Copy the contents of `firestore.rules`
6. Paste into the editor
7. Click **Publish**

### Option 2: Firebase CLI

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

## 🔒 Production Deployment

When ready to deploy to production:

1. **Backup current rules** (just in case)
2. **Replace** `firestore.rules` with `firestore.rules.production`
3. **Deploy** using one of the methods above
4. **Test thoroughly** to ensure everything works

### Production Rules Features:
- 🔒 Users can only read their own documents
- 🔒 Users cannot change their role or approval status
- 🔒 Only admins can read all users
- 🔒 Only admins can manage subjects
- 🔒 Only admins can view/manage bookings
- ✅ Public can still create bookings (for booking form)

## ⚠️ Important Notes

### Development Rules (Current)
- ⚠️ **DO NOT use in production** - too permissive
- ✅ Good for testing and development
- ✅ Allows easy debugging
- ✅ No permission errors during development

### Production Rules
- 🔒 Secure and restrictive
- 🔒 Role-based access control
- 🔒 Field-level validation
- 🔒 Prevents unauthorized access

## 🧪 Testing Rules

After deploying, test these scenarios:

### Test 1: User Document Creation
1. Create new account via portal.html
2. Check Firestore console - document should exist at `/users/{UID}`
3. Verify fields: email, role, approved, active, createdAt

### Test 2: Admin Access
1. Login as admin
2. Should see admin panel
3. Should be able to manage users and subjects

### Test 3: Student Access
1. Login as student
2. Should see student panel or waiting panel
3. Should NOT see admin features

### Test 4: Booking Form
1. Open index.html (not logged in)
2. Fill booking form
3. Submit - should work even without login
4. Check Firestore - booking should appear in `/bookings/`

## 🔄 Switching Between Rules

### To Development Rules:
```bash
# Use firestore.rules (already active)
firebase deploy --only firestore:rules
```

### To Production Rules:
```bash
# Rename files
mv firestore.rules firestore.rules.dev
mv firestore.rules.production firestore.rules

# Deploy
firebase deploy --only firestore:rules

# Restore dev rules
mv firestore.rules firestore.rules.production
mv firestore.rules.dev firestore.rules
```

## 📊 Current Rule Summary

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| `/users/{uid}` | Auth users | Self only | Auth users | Auth users |
| `/subjects/{id}` | Anyone | Auth users | Auth users | Auth users |
| `/bookings/{id}` | Auth users | Anyone | Auth users | Auth users |

## 🎯 Next Steps

1. ✅ Deploy current development rules to Firebase
2. ✅ Test user document creation
3. ✅ Test admin functionality
4. ✅ Test booking form
5. 🔄 When ready for production, switch to production rules

---

**Current Status:** Development rules active in `firestore.rules`
**Ready to deploy:** Yes ✅
**Production ready:** No (use `firestore.rules.production` when ready)

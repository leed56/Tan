# Soma AI — Beta Testing Checklist

## Pre-Beta Build (Internal)

### Build & Infrastructure
- [ ] EAS build succeeds for Android (APK preview profile)
- [ ] EAS build succeeds for iOS (simulator build)
- [ ] Firebase project configured (dev/staging/production separation)
- [ ] `google-services.json` and `GoogleService-Info.plist` added to project
- [ ] Firestore security rules deployed (`firebase deploy --only firestore:rules`)
- [ ] Firestore indexes deployed (`firebase deploy --only firestore:indexes`)
- [ ] Cloud Functions deployed (`firebase deploy --only functions`)
- [ ] Firebase App Check enabled in Firebase Console (Play Integrity registered)

### Authentication
- [ ] Phone OTP sends real SMS (test with real Tanzania number)
- [ ] OTP verification succeeds and creates Firestore user document
- [ ] Sign out clears all local state
- [ ] Re-login restores progress

### Curriculum & Quizzes
- [ ] Subjects list loads (Firestore + offline cache)
- [ ] Topics load per subject/form
- [ ] MCQ quiz starts and completes correctly
- [ ] FIB quiz accepts input and validates
- [ ] TF quiz works
- [ ] Daily limit (5 free / unlimited premium) enforced correctly
- [ ] Quiz results save to Firestore

### AI Explanations (Premium feature)
- [ ] "Explain this" button appears only for premium users
- [ ] Cloud Function called successfully (not direct Gemini API key)
- [ ] All 8 explanation sections display correctly
- [ ] Feedback (thumbs up/down) saves to Firestore
- [ ] Rate limiting (20/day) works

### Gamification
- [ ] XP awarded after quiz completion
- [ ] Level-up animation triggers at correct threshold
- [ ] Coins credited for correct answers
- [ ] Daily streak increments on consecutive days
- [ ] Badges unlock and display
- [ ] Daily missions update and complete
- [ ] Leaderboard shows correct rankings

### Subscriptions & Payments
- [ ] Subscription page shows both plans with correct TSH prices
- [ ] Selcom PayBox checkout opens in browser/WebView
- [ ] Azampay MNO checkout sends USSD push to test number
- [ ] Webhook receives callback and activates subscription in Firestore
- [ ] Admin panel can manually verify payment
- [ ] Subscription status reflected immediately in app
- [ ] RevenueCat IAP sandbox purchase succeeds (iOS TestFlight)
- [ ] Subscription expiry job runs correctly (test with past date)

### Offline Support
- [ ] App loads previously-visited subjects without network
- [ ] Quiz progress saves to Firestore offline cache
- [ ] Pending writes flush when network restored
- [ ] NetInfo banner shows when offline

### Performance
- [ ] App cold start < 3 seconds on mid-range Android
- [ ] No FlatList/ScrollView jank on questions list (FlashList)
- [ ] Images load lazily (no blocking the quiz screen)
- [ ] No memory leaks on repeated quiz sessions

### Crash Reporting
- [ ] Sentry DSN configured and test crash reported
- [ ] Crashlytics enabled and appears in Firebase Console
- [ ] User context (userId) attached to crash reports

### Admin Panel
- [ ] Admin can sign in at deployed URL
- [ ] Dashboard stats load
- [ ] Content editor can add/edit questions
- [ ] Super admin can verify payments
- [ ] All audit logs recorded

---

## Beta Distribution (Firebase App Distribution)

### Android
- [ ] APK distributed via Firebase App Distribution to 10+ beta testers
- [ ] Testers include Form 1, 2, 3, 4 students
- [ ] Testers on Vodacom, Tigo, Airtel, Halotel networks tested
- [ ] Low-end device tested (2GB RAM, Android 8+)
- [ ] Collected feedback via beta feedback form

### iOS
- [ ] TestFlight build submitted
- [ ] Internal testers added
- [ ] App Review Information completed

---

## Beta Feedback Criteria (Pass/Fail)

| Metric | Target | Critical |
|--------|--------|----------|
| Crash-free sessions | > 98% | Yes |
| Quiz completion rate | > 80% | Yes |
| Payment success rate | > 90% | Yes |
| AI explanation load time | < 5s | No |
| App launch time | < 3s | No |
| Daily active users retention (Day 7) | > 40% | No |

---

## Store Submission Checklist

### Google Play
- [ ] Privacy policy URL live and accessible
- [ ] App content rating questionnaire completed
- [ ] Store listing screenshots (all required sizes)
- [ ] Feature graphic (1024 x 500 px)
- [ ] App Bundle (AAB) uploaded
- [ ] In-app products configured in Play Console
- [ ] RevenueCat Play Store server notifications webhook configured
- [ ] Internal testing track approved
- [ ] Production rollout at 10% → 50% → 100%

### Apple App Store
- [ ] App Store Connect listing complete
- [ ] Screenshots for all required device sizes
- [ ] App Review Information with demo credentials
- [ ] In-app purchases approved by Apple
- [ ] Age rating set to 4+
- [ ] Privacy nutrition labels complete
- [ ] TestFlight external beta (up to 10,000 testers)
- [ ] App Review submission

---

## Post-Launch Monitoring (Week 1)

- [ ] Monitor Crashlytics for crash spikes
- [ ] Monitor Sentry for JS errors
- [ ] Check Firebase Functions logs for errors
- [ ] Verify payment webhooks processing correctly
- [ ] Monitor Firestore usage/costs
- [ ] Check leaderboard for anomalies (cheating detection)
- [ ] Review admin audit logs for unexpected access

# Өрнөл v2.0 — Personal Life OS

Өрнөл бол Study Hub, Planner, Smart Goals, Focus, Journal, Money, AI Coach, AI Pet, Cloud Sync болон Smart Reminders-ийг нэг дор багтаасан mobile-first PWA юм. Хуучин `myLifeTracker.*` storage key болон Firestore user document-ийг хэвээр үлдээсэн тул өмнөх хэрэглэгчийн өгөгдөл migration шаардахгүй үргэлжилнэ.

## v2.0 онцлох шинэчлэл

- Шинэ Өрнөл нэр, утга, logo, өнгө төрх, PWA metadata болон social preview.
- Долоо хоногийн сонгосон өдрүүдтэй хичээлийн хуваарь, багш, анги/линк, өнгө, сануулга.
- Хичээлийн даалгавар, priority, хугацаа, completion XP болон 25 минутын Focus shortcut.
- Dashboard, AI Coach, AI Pet-тэй холбогдсон class/assignment context.
- Signed-in хэрэглэгчийн reminder registry болон Firebase Scheduled Function-д суурилсан хаалттай үед хүрэх Cloud Push.
- Local reminder, missed recovery, snooze, done болон PWA notification click-ийн өмнөх ажиллагааг хэвээр хадгалсан.

## Local preview ба шалгалт

`index.html`-ийг `file://`-оор биш HTTP server-ээр ажиллуулна. Build step шаардлагагүй; Vercel deployment output нь repository root.

```bash
npm run check
npm --prefix functions install
npm run check:functions
```

## Firebase Cloud Push

Frontend sign-in хийсэн хэрэглэгчийн timezone, reminder tasks болон FCM token-ийг `reminderUsers/{uid}` private registry-д sync хийнэ. `sendSmartReminders` scheduled function минут тутам due reminder-ийг олж, occurrence бүрт duplicate-safe claim хийж FCM data message илгээнэ.

```bash
firebase deploy --only "firestore:rules,functions:sendSmartReminders" --project my-life-tracker-6c19b
```

Scheduled Functions deploy хийхэд Firebase project Blaze plan шаарддаг. Billing-ийг repository эсвэл client code-д хадгалахгүй. Service-account credential, private key, Apple `.p8` зэрэг нууцыг commit хийж болохгүй.

## Production domain

Одоогийн canonical URL: `https://my-life-tracker-seven.vercel.app/`

Custom domain нэмэх бол нэг тогтвортой canonical domain сонгоод Vercel, Firebase Authorized Domains, OAuth redirect, `index.html`, `robots.txt`, `sitemap.xml`-ийг нэг release-д шинэчилнэ.

## GitHub → Vercel checklist

- [ ] `npm run check` болон `npm run check:functions` амжилттай.
- [ ] Нууц credential, service-account JSON эсвэл private key commit хийгдээгүй.
- [ ] Firebase project `my-life-tracker-6c19b` зөв account/region/billing plan-тай.
- [ ] Firestore rules болон `sendSmartReminders` function deploy амжилттай.
- [ ] Firebase Authentication Authorized Domains-д production domain бүртгэлтэй.
- [ ] `main` branch GitHub-д push хийгдсэн; Vercel Framework preset **Other**, build command хоосон, output directory `.`.
- [ ] Production HTTPS дээр Google/Email sign-in, logout, Device Mode, Cloud Sync ажилласан.
- [ ] Хуучин Planner, Goals, Journal, Money, Pet, Focus, Quests, Reminders өгөгдөл refresh/update-ийн дараа хэвээр.
- [ ] Study class/assignment CRUD, selected weekdays, reminder болон Pet XP шалгагдсан.
- [ ] PWA install, offline reload, service-worker update, light/dark theme шалгагдсан.
- [ ] 320 px mobile, tablet, desktop дээр horizontal overflow байхгүй.
- [ ] Privacy, Terms, About, Contact, 404, manifest, icons, robots болон sitemap 200 хариулттай.
- [ ] Production smoke test-ийн дараа `v2.0.0` tag гаргасан.

## Data ба security contract

- Firebase web config нь public project identifier; admin credential биш.
- Cloud data: `users/{uid}/data/tracker`; reminder registry: `reminderUsers/{uid}`.
- Firestore rules хэрэглэгч бүрийг зөвхөн өөрийн document-д хязгаарлана; Scheduled Function Admin SDK-аар server талд ажиллана.
- Device Mode нь Firestore-гүй offline ажиллана.
- `myLifeTracker.*` localStorage key-г migration-гүй rename/clear хийж болохгүй.
- Cache шинэчлэх үед `sw.js`-ийн `CACHE` болон visible app version-ийг хамт ахиулна.

## Rollback

Vercel өмнөх immutable deployment-ийг promote хийж frontend-ийг буцаана. Firebase Function-ийн rollback-ийг өмнөх Git commit-оос ижил нэрээр дахин deploy хийж гүйцэтгэнэ.

KJ’s Mobile Dog Nail Services Appointment Tracker (iOS-ready PWA)
=================================================================

This is a web app that installs to your iPhone Home Screen and works offline.
No App Store needed.

Quick Start
-----------
1) Upload all files to any static hosting (GitHub Pages, Netlify, Vercel, or your own site).
2) Open the site in Safari on your iPhone.
3) Tap the Share icon → Add to Home Screen. It will open as a standalone app.
4) The app saves data on-device. Use Export CSV regularly as a backup.

Features
--------
- Create, edit, delete appointments with client, pet, date/time, service, price, notes, status, and paid flag.
- Filter: Upcoming / Today / Past; Status; Full-text search.
- Export/Import CSV.
- Add to Calendar (.ics) per appointment.
- Offline support via Service Worker.
- Install prompt on Android/desktop; on iOS use “Add to Home Screen”.

Tips
----
- To move to a new phone, Export CSV on old phone, then Import CSV on the new one.
- You can host it at your existing business site subfolder, e.g. /appointments/.


Enhancements (this build)
-------------------------
- **Reports:** Revenue totals (paid), completed count, unpaid scheduled total, and last 6 months monthly rollup.
- **SMS Reminders:** One-tap "Text Reminder" from each appointment (opens Messages with a prefilled text).
- **Backup/Restore:** Backup to JSON (save to Files/iCloud Drive). Restore from JSON anytime.
- **Hosting Guide (GitHub Pages):**

GitHub Pages Deploy (your existing site)
---------------------------------------
1) In your repo for the website, create a folder: `/appointments/`
2) Upload *all* files from this folder into `/appointments/` (keep subfolders like `/icons/` intact).
3) Commit and push. Your app will be live at: `https://<your-username>.github.io/<your-repo>/appointments/`
4) On iPhone Safari, open that URL → Share → Add to Home Screen.

Optional SMS via Twilio (server required)
-----------------------------------------
This app currently opens the Messages app with a prefilled reminder. If you want true automated SMS, you’ll need a tiny server or a Netlify Function with your Twilio credentials. I can provide that snippet on request.

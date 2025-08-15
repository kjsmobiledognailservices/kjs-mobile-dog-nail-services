KJ Website Patch — Appointments + POS
======================================

This bundle adds TWO installable iOS PWAs to your site and provides HTML snippets to link them.

Folders to add to your repo root (or site root)
------------------------------------------------
- /appointments   → Enhanced Appointment Tracker (PWA)
- /pos            → Cash/Debit POS (PWA)
- /snippets       → Copy/paste HTML snippets to your homepage and nav

Install steps (GitHub web)
--------------------------
1) In your repo, create folders: `appointments`, `pos`, and `snippets`.
2) Upload all contents of each folder to the matching folder in your repo (keep the /icons folders).
3) Commit the changes.
4) Your apps will be live at:
   https://<username>.github.io/<repo>/appointments/
   https://<username>.github.io/<repo>/pos/

Add links on your homepage
--------------------------
- Open /snippets/home-links.html and paste that block into your homepage where you want the buttons and services/prices.
- Optionally add the nav links from /snippets/add-to-nav.html to your top navigation.

iPhone install
--------------
Open each URL in Safari → Share → Add to Home Screen.

Backups
-------
- Appointment Tracker: Export CSV and Backup JSON inside the app.
- POS: Export CSV from Sales History.

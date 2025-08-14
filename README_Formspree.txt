To enable email on the form:
1) Create a free account at https://formspree.io and add your email.
2) Create a new form; copy your Form ID (looks like xyzabcd).
3) In index.html, replace YOUR_FORM_ID inside:
   action="https://formspree.io/f/YOUR_FORM_ID"
4) Commit the change to GitHub. Submissions will email you.
Optional: Update the _next hidden field URL if your site URL changes.

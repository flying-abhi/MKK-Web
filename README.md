# Maati Ke Khel Booking Setup

## Store form submissions in Google Sheets

1. Create a new Google Sheet for bookings.
2. Open `Extensions -> Apps Script`.
3. Paste the code from `google-apps-script.gs` into the Apps Script editor.
4. Save the script and deploy it as a web app.
5. Set `Execute as` to `Me`.
6. Set access to `Anyone`.
7. Copy the deployed web app URL.
8. Open `config.js` and replace `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` with that URL.

After that, each booking form submission will be added as a new row in the `Bookings` sheet.

## Extra protection included

- `config.js` keeps the Sheet endpoint separate from the page markup.
- The form now validates names, age, email, phone number, and note length before submission.
- A hidden honeypot field helps block simple bots.
- Very fast submissions are rejected as likely spam.

## Deploy to GitHub Pages

1. Create a new GitHub repository.
2. Upload the full project, including the `.github/workflows/deploy-pages.yml` file.
3. Push everything to the `main` branch.
4. In GitHub, open `Settings -> Pages`.
5. Under `Build and deployment`, choose `GitHub Actions` as the source.
6. Wait for the `Deploy static site to GitHub Pages` workflow to finish.
7. Your site will be published at:
   `https://<your-github-username>.github.io/<your-repository-name>/`

Before publishing, make sure `config.js` contains your Google Apps Script web app `.../exec` URL.

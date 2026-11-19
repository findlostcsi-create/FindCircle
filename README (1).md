# Find Circle

**Lost it || List it || Find it**

Find Circle is a campus-focused Lost & Found web application for students of **Pune Institute of Computer Technology (PICT)**. Students can report missing or found belongings, explore recent reports, contact report owners privately, and submit ownership claims.

**Live website:** [Find Circle](https://findlostcsi-create.github.io/FindCircle/)  
**Repository:** [findlostcsi-create/FindCircle](https://github.com/findlostcsi-create/FindCircle)

> The live-site link works once GitHub Pages has successfully published the repository.

## Features

- **Authentication:** Sign up and log in with Google or email/password using Firebase Authentication.
- **Student dashboard:** Dashboard Home, My Profile, My Reports, Claims, Messages, Recently Reported, and Privacy & Security.
- **Student profiles:** Full name, email, college (PICT), department/branch, academic year, and roll number.
- **Lost & Found reports:** Create reports with category, location, description, and optional images; edit, close, reopen, or delete your own reports.
- **Recent reports:** Browse and filter open reports by category and Lost/Found status.
- **Private messaging:** Real-time, one-to-one conversations between registered students, with persistent history.
- **Ownership claims:** Submit identifying information privately on a found-item report; the finder can approve, reject, or revise a decision. An approval closes the related report.
- **Found-item responses:** Use **I Found This Item** on another student's lost-item report to start a conversation.
- **Privacy & Security:** Profile and email visibility controls, password management, account data download, and account deletion controls.
- **Responsive interface:** Desktop sidebar and mobile navigation with logout access.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript |
| Authentication | Firebase Authentication |
| Database / live updates | Cloud Firestore |
| Image uploads | Cloudinary |
| Hosting | GitHub Pages |

## Run locally

1. Clone the repository:

   ```bash
   git clone https://github.com/findlostcsi-create/FindCircle.git
   cd FindCircle
   ```

2. Open the folder in **Visual Studio Code**.
3. Run with the **Live Server** extension, preferably at `http://localhost:5500/`.
4. Open `index.html` in your browser.

> Use a local web server rather than opening HTML files directly with `file://`, because the project uses JavaScript modules and Firebase.

## Firebase setup

1. Create or select a Firebase project and configure `firebase-config.js` with its public web app configuration.
2. Enable **Email/Password** and **Google** in **Authentication → Sign-in method**.
3. Add your deployment domain, `findlostcsi-create.github.io`, to **Authentication → Settings → Authorized domains**. Authorize your local host as needed.
4. In **Firestore Database → Rules**, replace the rules with the project's complete `firestore.rules` and click **Publish**.
5. Review `SETUP.md` for the latest configuration and test guidance.

## Cloudinary setup

Image uploads use Cloudinary. Configure the cloud name and unsigned upload preset in `items.js`, and restrict the preset to the intended file types, sizes, and upload folder. **Never put a Cloudinary API secret or Firebase service-account key in frontend code or this public repository.**

## Deploy on GitHub Pages

1. Push the site files to the repository's `main` branch. Ensure `index.html` is at the repository root.
2. Go to **Settings → Pages**.
3. Select **Deploy from a branch**, then choose **main** and **/(root)**.
4. Save and check the Pages deployment status under **Actions**.
5. Visit [the live site](https://findlostcsi-create.github.io/FindCircle/).

## How Find Circle works

1. Sign in and complete your student profile.
2. Report an item as **Lost** or **Found**.
3. Other students can browse open reports through **Recently Reported**.
4. Students communicate through private messages. A student can claim a found item or tell the owner of a lost report that they may have found it.
5. A finder reviews ownership evidence and can approve or reject the claim. Approved claims close their reports; owners can review decisions later.

## Security and project limitations

Find Circle is currently a **college project / demonstration build**, not a fully audited production service.

- Firestore Security Rules must be published and tested to protect private conversations, claims, and student data.
- Campus affiliation is not automatically verified simply because someone signs up.
- Unsigned Cloudinary uploads need additional protections before a broad public launch.
- Deleting a Firebase account or report may not remove all shared message history, claim records, or hosted images without additional server-side cleanup.
- Approval of an ownership claim does **not** itself verify physical handover of an item.
- Avoid placing passwords, confidential documents, or other private information in public reports or source files.

## Project status

**Phases 1–4:** Core features implemented and tested for the college project.  
**Current focus:** UI refinement, responsiveness, and reliability.  
**Phase 5 (smart matching and notifications):** Not planned for the current scope.

## Project identity

**Find Circle** — *Lost it || List it || Find it*  
Built for the PICT campus community.

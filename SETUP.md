# Find Circle — Phase 3 setup

## Firebase
1. Firebase project `findnlost-faadd` is already configured in `firebase-config.js`.
2. Enable Email/Password and Google in Authentication. Add `localhost` and your deployment domain to Authorized domains.
3. In Firebase Console > Firestore Database > Rules, replace rules with **all** of `firestore.rules` and Publish. Existing user profile rules are retained.
4. Firestore collection `items` is created automatically when the first report is submitted. Public reads are enabled for item listings; only the owner may edit/delete a report.

## Cloudinary
1. Create a Cloudinary account and open its console to find **Cloud name**.
2. Settings > Upload > Upload presets > Add upload preset. Choose **Unsigned** and restrict uploads to images, small files (2 MB), and a designated folder such as `find-circle-items`. Enable moderation/abuse controls if available. Use a unique preset specifically for this project.
3. Edit **only** the two values `cloudName` and `uploadPreset` in `items.js`. Never put a Cloudinary API secret in browser code.
4. Unsigned browser uploads are public and can be abused; preset restrictions and monitoring are essential. For a production campus rollout, move uploads behind a verified server endpoint with authenticated users, rate limits, and image moderation. Firestore rules cannot validate Cloudinary uploads or confirm image ownership.

## Run
1. Extract ZIP; open `find-circle` in VS Code.
2. Use Live Server at `http://localhost:5500/` (or authorize `127.0.0.1` in Firebase).
3. Log in, click Report Lost/Found, fill fields and publish. Images are optional while Cloudinary is unconfigured.
4. Check the Recently Reported filters, Item Details, My Reports, Edit, Close/Reopen and Delete.
5. Test using two accounts: Account A can manage its own reports, but not Account B's.

## Scope and limitations
- Reports are immediately publicly visible. **No admin approval workflow** yet.
- Phase 4 will add private messaging and verified ownership claims. Do not exchange sensitive contact details in descriptions.
- `Closed` currently means the poster closed the report, not a verified return. Closed reports remain visible to their owner in My Reports; they are hidden from public browsing.
- Search filters up to the 100 newest reports loaded from Firestore. For a larger deployment, add paginated server queries.
- Campus email affiliation verification is not yet enforced; any authenticated Firebase account can post.
- Cloudinary photos are public, and deleting a report does not remove its Cloudinary image. Production should add authenticated server-side image deletion.
- The supplied Cloudinary preset is a placeholder until you provide its public configuration.


## Cloudinary configured for this build
- Cloud name: `vrppq0kp`
- Unsigned upload preset: `FindLost`
- Test with a JPG/PNG/WebP photo of 2 MB or less.
- Do not put Cloudinary API secrets in frontend files.
- Browser-based unsigned uploads can be abused; use a backend-authorized upload flow before opening the site to the public.


## Phase 4: Messaging, claims and closed-item visibility
1. **Publish the complete replacement** `firestore.rules` under Firebase Console → Firestore Database → Rules. Do not append the new rules below older permissive rules.
2. Keep Email/Password and Google enabled under Firebase Authentication.
3. Run the site through VS Code Live Server using `http://localhost:5500/` and sign in.
4. Open a **Found** item as a second account. Click **Message reporter** to start a private chat; use two browser profiles to test real-time messages.
5. Click **Claim this item** and enter a private identifying detail (10–500 characters). The owner reviews it under **Claims**, then approves or rejects.
6. Verify that a third account cannot read either conversation or claim. Test that closed items disappear from the public homepage but remain in **My Reports** for the owner.
7. If Firestore requests an index for the public item query (`status` + `createdAt`), follow the Firebase Console link shown in the browser console to create the composite index, then retry after it builds.
8. Do not publicly deploy without moderation, campus-account verification, Cloudinary upload authorization, and further rules testing.

### Scope and security limitations
- Text-only messaging, persistent chat history, and private ownership claims are implemented. Claim approval is **not** proof of handover; no handover-code backend is included in this release.
- Firestore rules restrict private reads to participants and prevent edits to sent messages and unauthorized claim decisions.
- Deleting an item does not remove previously uploaded Cloudinary photos, conversations, or claims. Plan an authenticated server-side cleanup mechanism before launch.
- A closed report is hidden from public Firestore reads and public listings. Owners can still see it in My Reports and reopen it.
- The Recently Reported page shows only open reports. The homepage does not show public report counters.
- Cloudinary unsigned uploads are suitable for a limited demo, not a secure public production deployment.


## Phase 4 visibility hotfix
Public listing queries now filter `status == 'Open'` without combining an `orderBy` clause, avoiding the composite-index requirement that could prevent all open reports from loading. Results are sorted newest-first in the browser. Keep the Phase 4 Firestore rules published. If items still do not appear, inspect the browser Console for a permission error and confirm report status is exactly `Open`.


## Item Details loading fix
Removed invalid named import `getDocs` from `community.js` in `item.js`. The missing export prevented the module from running and left the page stuck on 'Loading report…'. Reload with Ctrl+Shift+R after replacing files. No Firebase rule changes needed for this fix.


## Phase 4 message reporter fix
The old `startThread` first read a conversation document that did not yet exist. Firestore correctly rejected this read under participant-only rules. The revised code tries to create the conversation first, then verifies an existing conversation if creation was rejected. Publish the included Phase 4 rules if you have not already. Test with two different signed-in accounts; you cannot message your own report.

## Phase 4 polish — inbox, claims, and decisions
- Inbox now displays the report title (when accessible), the other participant's role, last available message preview, and timestamps.
- Claim cards display report titles instead of raw Firestore IDs (when the report is accessible).
- Approving a claim atomically closes the related report in the same Firestore transaction.
- The finder can change a Rejected claim to Approved, or Approved to Rejected. Reversing an approval reopens the report. Other approved claims on the same report should be reviewed before reversing.
- **Publish the updated `firestore.rules`** or decision edits will fail.
- Firestore rules enforce that approval corresponds to a Closed report and approval reversal corresponds to an Open report.
- Existing conversations about closed reports may show a short report reference for the non-owner because closed reports are intentionally private.
- This is not proof of physical handover; only use approval after verifying ownership.

## Phase 4 inbox names + Lost report responses
- **Publish the updated `firestore.rules`** (adds `/publicNames/{uid}` with only a display name; emails remain private).
- Each account should log out and log in once after deployment to publish its display name. Existing accounts without a published name show “Student (name unavailable)” until they log in.
- The inbox shows the other participant's display name and the associated report title. The active chat shows the name and report context.
- On another person's open **Lost** report, click **I found this item**. This opens a private conversation with a suggested **unsent** draft message; the student must press Send.
- On another person's open **Found** report, the original **Claim this item** flow remains.
- No changes to message privacy or claim ownership rules.


## Profile tab (Phase 4 enhancement)
- Added `profile.html` and `profile.js`. Signed-in students can view their own email and update their display name.
- Names are saved to the existing private `users` document and the name-only `publicNames` document, so inbox participants can see the latest name.
- The My Profile link is available in the authenticated dashboard navigation.
- Uses the existing Firestore rules; no new Firebase service or security-rule changes are required.
- Test with two accounts: edit a name, reload the inbox, and confirm the other account sees the new name.


## Profile fields
Full name, email (read-only), PICT (read-only), branch, academic year and roll number. Only name is public for messaging. Publish updated firestore.rules before saving.


## Signed-in dashboard (Phase 4 workspace enhancement)
- After successful email/password or Google login/signup, Find Circle opens `dashboard.html` instead of the crowded public landing page. If signed-in students open the public `index.html`, they are taken to their dashboard.
- The desktop sidebar and the mobile hamburger drawer contain **Dashboard Home, My Profile, My Reports, Claims, Messages, Recently Reported**.
- **Log out** is visible in the desktop sidebar and the top navigation (including on phones). Signing out returns to `login.html`.
- `dashboard.html` is now the dashboard home. The old report management page and all its functionality moved to `my-reports.html`.
- `recent.html` lists open items with search, category, and Lost/Found filters. The landing page remains available to visitors who are not logged in.
- On dashboard home, counts for your own reports, your open reports, pending claims to review, and your conversations are read live from Firestore. Campus reports are available under the dedicated Recently Reported tab.
- `app-shell.js` supplies consistent navigation on all authenticated pages, including report creation. On item details (`item.html`), the shell appears only for signed-in students, preserving guest read-only access to open public reports.
- No additional Firebase collections, indexes, rules, credentials, or migrations are required: all dashboard queries reuse the existing Phase 4 collections and query patterns.
- Test on desktop and mobile: sign in; navigate all six sections; open a report, send a message and return; log out from both screen sizes; verify visiting dashboard pages signed out sends you to login.


## Homepage cleanup (Phase 4 dashboard refinement)
- The public `index.html` landing page no longer contains the global statistics bar, **Explore Find Circle** category filters, or a **Recently reported** item feed.
- `dashboard.html` no longer shows a **Campus updates / Recently reported** preview. Its welcome, your activity statistics, your own latest reports, and quick report actions are unchanged.
- Campus listings, category filters, and Lost/Found filters remain on the existing **Recently Reported** page (`recent.html`), reached from the signed-in dashboard sidebar (desktop/mobile).
- The landing page's hero search now opens `recent.html?q=...` instead of scrolling to a deleted section. `recent.js` initializes its search field from `q` when present.
- No Firestore security rules, collections, authentication configuration, messaging, claims, or reporting features were changed in this update.
- The browsing page is sign-in protected; signed-out visitors accessing `recent.html` are sent to login.
- Test on desktop and mobile, reload with `Ctrl+Shift+R` if stale cached assets appear.


## Landing page simplification (latest update)
- Removed the **Search items** box from the landing-page hero.
- Removed the **Find what matters / Explore Find Circle**, category filters, report statistics, and **Recently reported** feed from the landing page (carried forward from the clean-homepage update).
- The landing page keeps the motto, introductory description, **Report Lost Item** and **Report Found Item** buttons, How Find Circle works, and About sections.
- Browsing and searching active reports is available after login from the dashboard sidebar's **Recently Reported** option (`recent.html`). Its search and category filters are unchanged.
- No Firebase configuration, Firestore rules, authentication, messaging, or claim logic was changed.
- Replace the full existing project folder with this ZIP and hard-refresh your browser (`Ctrl + Shift + R`).


## Privacy & Security page (Phase 4 dashboard extension)
The workspace sidebar includes **Privacy & Security** on desktop and mobile, opening `privacy.html`.

### Publish the new Firestore rules (required)
Replace the project's full rules in Firebase Console > Firestore Database > Rules with `firestore.rules` and **Publish**. A signed-in user may read a `publicNames` document only when its owner allows profile display (or it is an older name-only record); email is shared only with explicit consent. Private `users/{uid}` fields remain owner-only. Old name-only public records behave as profile-visible/email-hidden until the owner changes the switch.

### Feature behavior
- **Show my profile** (default ON): controls whether others can read your public name in messaging; does not hide previously sent messages or your public lost/found reports.
- **Show my email address** (default OFF): requires Show my profile. When enabled, any signed-in Firebase user of Find Circle can technically read your email from the publicNames record (and existing conversation participants see it beside your chat name). PICT affiliation is not yet verified. Never add email to item descriptions.
- **Change password:** supported for accounts with Email/Password; requires current password reauthentication and a new password of at least 8 characters. Google-only accounts use Google Account security. Firebase Authentication must have these providers enabled.
- **Download my data:** creates a JSON file in your browser for private/public profiles, personally owned items, submitted/received claims, and conversations/messages you can access. Exports may contain the other participant's messages, so keep the JSON private. Export does not contain media files stored at Cloudinary URLs.
- **Delete my Account:** after entering DELETE, confirming, and reauthenticating, removes your `users` and `publicNames` records and owned `items` (up to 400 reports) in a Firestore batch, then deletes your Firebase Authentication account. If Firestore cleanup fails, your login is NOT deleted. **Shared conversations/messages, claim history and Cloudinary-hosted files are not erased by this static front-end implementation.** Firebase login deletion and Firestore deletion are not one transaction; if Auth deletion fails after Firestore cleanup, the account may need admin help. For complete data erasure (including media and shared records), implement a trusted Firebase Cloud Function or administrator deletion workflow before production deployment. This project does not advertise full deletion of all records.

### Quick test plan
1. Sign in as A; change switches, Save. Sign in as B and open the conversation with A; verify A's name disappears if Show my profile is off, then appears when turned on again. Verify email appears only when both toggles are on.
2. Sign in with an email/password test account, change the password; sign out, sign back in with the new one. Google-only accounts should see a Google security link instead of the password form.
3. Download JSON; verify profile, reports, claims and messages using a TEST account.
4. Delete only a disposable TEST account with no sensitive/critical reports. Verify that Firebase login no longer works and the private profile/owned reports were removed. Keep in mind retained shared records/media require administrator cleanup.


## Phase 4 visual refresh (no new features)
The visual refresh is intentionally CSS-only: more consistent spacing and typography, refreshed landing hero, clearer dashboard navigation, polished report cards and messaging, focus indicators, and reduced-motion handling. Dashboard tabs, logged-in behavior, Firestore queries and rules, forms and IDs are unchanged. Existing landing-page search and public report listings remain removed. Replace the entire project folder or copy `style.css` into the current working project; use Ctrl+Shift+R to clear cached CSS.

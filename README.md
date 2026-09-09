# Public academy website

This folder is a standalone static Vercel project. It intentionally contains no database credentials or server code.

## Configure an academy

Edit `site-config.js`:

```js
window.PUBLIC_SITE_CONFIG = Object.freeze({
  academySlug: 'academy-slug-from-admin',
  apiBaseUrl: 'https://your-admin-portal.vercel.app',
  adminPortalUrl: 'https://your-admin-portal.vercel.app'
});
```

- `academySlug` must match the slug saved for that owner in the Admin Portal.
- `apiBaseUrl` is the central Admin Portal deployment, without a trailing slash.
- `adminPortalUrl` is where the Admin Login buttons should open.

## Deploy

1. For another academy, copy this entire folder into a new repository or branch.
2. Change the three values in `site-config.js`.
3. Import it into Vercel, or choose `public-site` as the Vercel Root Directory.
4. No environment variables are required in the public project.

Do not copy the Admin Portal API or `MONGODB_URI` into a public project.

## Test passport-photo registration locally

1. Run the Admin Portal with Vercel's local development server and provide `MONGODB_URI`,
   `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_PUBLIC_KEY`, and `IMAGEKIT_URL_ENDPOINT` in its local
   server environment.
2. Set `apiBaseUrl` in `site-config.js` to that local Vercel URL.
3. Serve this folder from `http://localhost` and submit the registration form with a current
   academy authentication code and a JPG, JPEG, PNG, or WebP photo no larger than 2 MB. The browser converts it to a JPEG below 50 KB before upload.
4. Confirm the asset appears under `/academy/student-photos/` in ImageKit and the MongoDB
   student record contains `photoUrl`, `imageKitFileId`, and `imageKitFilePath`.

For Vercel, add the four server-only variables to the central Admin Portal project, redeploy
the Admin Portal, then deploy this public site. The browser receives only ImageKit's public
key and short-lived upload parameters; it never receives the private key.

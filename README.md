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

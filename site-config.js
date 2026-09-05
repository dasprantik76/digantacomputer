/**
 * Configuration for one independently deployed public academy website.
 * Copy the public-site folder for a new academy and change these three values.
 */
const isLocalAcademyPreview =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.protocol === 'file:';

window.PUBLIC_SITE_CONFIG = Object.freeze({
  academySlug: 'prantik',
  apiBaseUrl: 'https://academy-admin-portal.vercel.app',
  adminPortalUrl: isLocalAcademyPreview
    ? '../admin-portal/index.html'
    : 'https://academy-admin-portal.vercel.app'
});

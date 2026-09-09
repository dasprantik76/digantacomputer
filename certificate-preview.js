/* Standalone preview. Never reads or modifies student records. */
(() => {
  const form = document.getElementById('sampleData');
  const key = 'certificate-preview-sample';
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || '{}');
    for (const input of form.elements) {
      if (typeof saved[input.name] === 'string') input.value = saved[input.name];
    }
  } catch { /* Storage is optional. */ }

  function render() {
    const data = Object.fromEntries(new FormData(form));
    try { sessionStorage.setItem(key, JSON.stringify(data)); } catch {}
    window.CertificateCanvas.render(data, { title: data.courseTitle, duration: data.courseDuration });
  }
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', render);
  document.getElementById('btnPrintCertificate').addEventListener('click', () => window.print());
  render();

  // Plain HTTP servers can preview saved edits without a build tool or extension.
  // Watch only on local hosts; deployed previews do not poll the server.
  if (!['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) return;
  const files = ['certificate-canvas.js', 'site-config.js', 'certificate-preview.html', 'certificate-preview.js'];
  let previous;
  async function watch() {
    try {
      const sources = await Promise.all(files.map(async file => {
        const response = await fetch(file, { cache: 'no-store' });
        if (!response.ok) throw new Error('Preview source unavailable');
        return response.text();
      }));
      const signature = JSON.stringify(sources);
      if (previous && signature !== previous) {
        location.reload();
        return;
      }
      previous = signature;
    } catch { /* Retry after temporary server interruptions. */ }
    setTimeout(watch, 1000);
  }
  watch();
})();

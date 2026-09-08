/* Positions use the supplied 1920 × 1280 preview; output is always 3722 × 2480. */
(() => {
  'use strict';
  const canvas = document.getElementById('certificateCanvas');
  const ctx = canvas.getContext('2d');
  const status = document.getElementById('certCanvasStatus');
  const print = document.getElementById('btnPrintCertificate');
  const download = document.getElementById('btnDownloadCertificate');
  let revision = 0;
  let filename = 'certificate';
  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image could not be loaded.'));
      img.src = url;
    });
  }
  function date(value) {
    if (!value) return '';
    const parsed = new Date(String(value).slice(0, 10) + 'T00:00:00');
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toLocaleDateString('en-GB');
  }
  function field(value, x, y, width, size = 30) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (!text) return;
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y - size - 4, width, size + 10);
    ctx.fillStyle = '#142d4e';
    do { ctx.font = `600 ${size--}px Georgia, serif`; }
    while (ctx.measureText(text).width > width - 12 && size > 15);
    ctx.textAlign = 'center';
    ctx.fillText(text, x + width / 2, y, width - 12);
    ctx.restore();
  }
  function clear() {
    revision++;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    print.disabled = download.disabled = true;
    status.textContent = '';
  }
  async function render(student, course) {
    clear();
    const current = revision;
    status.textContent = 'Preparing certificate…';
    try {
      const background = await loadImage(window.PUBLIC_SITE_CONFIG.certificateTemplateUrl);
      if (current !== revision) return;
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(canvas.width / 1920, 0, 0, canvas.height / 1280, 0, 0);
      // Always remove the example portrait, including when no student photo exists.
      ctx.fillStyle = '#fff';
      ctx.fillRect(1524, 650, 228, 264);
      field(student.certificateSerial || student.id, 275, 533, 490, 27);
      field(date(student.certificateIssueDate), 1640, 533, 200, 25);
      field(student.name || student.fullName, 860, 650, 605);
      field(student.fatherName, 442, 712, 514);
      field(course?.title, 355, 773, 1055);
      field(course?.duration, 571, 909, 420);
      const period = [date(student.joinDate), date(student.completionDate)].filter(Boolean).join(' – ');
      field(period, 1088, 909, 366, 26);
      field(student.grade, 706, 970, 252);
      let photoFailed = false;
      if (student.photoUrl) {
        try {
          const photo = await loadImage(student.photoUrl);
          if (current !== revision) return;
          const scale = Math.max(228 / photo.width, 264 / photo.height);
          const sw = 228 / scale, sh = 264 / scale;
          ctx.drawImage(photo, (photo.width - sw) / 2, (photo.height - sh) / 2, sw, sh, 1524, 650, 228, 264);
        } catch { photoFailed = true; }
      }
      if (current !== revision) return;
      canvas.setAttribute('aria-label', `Completion certificate for ${student.name || student.fullName}, ${course?.title || ''}, student ID ${student.id || ''}`);
      filename = `certificate-${String(student.id || 'student').replace(/[^a-z0-9_-]/gi, '-')}`;
      print.disabled = download.disabled = false;
      status.textContent = photoFailed ? 'Certificate ready. Student photo could not be loaded.' : 'Certificate ready.';
    } catch {
      if (current !== revision) return;
      status.textContent = 'The certificate template could not be loaded. Please contact the centre.';
    }
  }
  download.addEventListener('click', () => {
    const current = revision;
    try {
      canvas.toBlob(blob => {
        if (!blob || current !== revision) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.png`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, 'image/png');
    } catch {
      status.textContent = 'Download failed. Certificate images must allow cross-origin access.';
    }
  });
  window.CertificateCanvas = { render, clear };
})();

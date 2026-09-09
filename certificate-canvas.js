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
  const PHOTO_BOX = { x: 1525, y: 649, width: 227, height: 268 };
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
  function monthYear(value) {
    if (!value) return '';
    const parsed = new Date(String(value).slice(0, 10) + 'T00:00:00');
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toLocaleDateString('en-GB', {
      month: 'short',
      year: 'numeric'
    });
  }
  function field(value, x, y, width, size = 37, align = 'center') {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (!text) return;
    ctx.save();
    ctx.fillStyle = '#142d4e';
    do { ctx.font = `700 ${size--}px "SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, Arial, sans-serif`; }
    while (ctx.measureText(text).width > width - 12 && size > 15);
    ctx.textAlign = align;
    const textX = align === 'left' ? x : x + width / 2;
    ctx.fillText(text, textX, y, width - 12);
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
      const background = await loadImage(window.PUBLIC_SITE_CONFIG?.certificateTemplateUrl || 'assets/diganta-certificate-template.jpg');
      if (current !== revision) return;
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(canvas.width / 1920, 0, 0, canvas.height / 1280, 0, 0);
      field(student.certificateSerial || student.id, 284, 533, 481, 34, 'left');
      field(date(student.certificateIssueDate), 1640, 533, 200, 34, 'left');
      field(student.name || student.fullName, 860, 642, 605);
      field(student.fatherName, 442, 704, 514);
      field(course?.title, 355, 765, 1055);
      field(course?.duration, 583, 901, 326);
      const period = [monthYear(student.joinDate), monthYear(student.completionDate)].filter(Boolean).join(' - ');
      field(period, 1007, 901, 437, 33);
      field(student.grade, 706, 962, 252);
      let photoFailed = false;
      if (student.photoUrl) {
        try {
          const photo = await loadImage(student.photoUrl);
          if (current !== revision) return;
          const scale = Math.max(PHOTO_BOX.width / photo.width, PHOTO_BOX.height / photo.height);
          const sw = PHOTO_BOX.width / scale;
          const sh = PHOTO_BOX.height / scale;
          ctx.drawImage(
            photo,
            (photo.width - sw) / 2,
            Math.max(0, (photo.height - sh) * 0.3),
            sw,
            sh,
            PHOTO_BOX.x,
            PHOTO_BOX.y,
            PHOTO_BOX.width,
            PHOTO_BOX.height
          );
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

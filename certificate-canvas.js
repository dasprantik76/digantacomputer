/* Positions use the supplied 1920 × 1280 preview; output is always 3722 × 2480. */
(() => {
  'use strict';
  const canvas = document.getElementById('certificateCanvas');
  const status = document.getElementById('certCanvasStatus');
  const print = document.getElementById('btnPrintCertificate');
  const download = document.getElementById('btnDownloadCertificate');
  const MASTER_WIDTH = 3722;
  const MASTER_HEIGHT = 2480;

  let revision = 0;
  let filename = 'certificate';
  let activeBuffer = null;

  const PHOTO_BOX = { x: 1525, y: 649, width: 227, height: 268 };
  const QR_BOX = { x: 390, y: 1058, size: 124 };
  const DISPLAY_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

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
    return Number.isNaN(parsed.getTime()) ? '' : `${parsed.getDate()} ${DISPLAY_MONTHS[parsed.getMonth()]}, ${parsed.getFullYear()}`;
  }

  function monthYear(value) {
    if (!value) return '';
    const parsed = new Date(String(value).slice(0, 10) + 'T00:00:00');
    return Number.isNaN(parsed.getTime()) ? '' : `${DISPLAY_MONTHS[parsed.getMonth()]} ${parsed.getFullYear()}`;
  }

  function drawField(ctx, value, x, y, width, size = 37, align = 'center', weight = 500) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (!text) return;
    ctx.save();
    ctx.fillStyle = '#111111';
    do { ctx.font = `${weight} ${size--}px "SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, Arial, sans-serif`; }
    while (ctx.measureText(text).width > width - 12 && size > 15);
    ctx.textAlign = align;
    const textX = align === 'left' ? x : x + width / 2;
    ctx.fillText(text, textX, y, width - 12);
    ctx.restore();
  }

  function updateVisibleCanvas() {
    if (!activeBuffer || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const displayWidth = rect.width || canvas.clientWidth || (canvas.parentElement ? canvas.parentElement.clientWidth : 0) || 720;
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);
    const targetWidth = Math.max(300, Math.round(displayWidth * dpr));
    const targetHeight = Math.round(targetWidth * (MASTER_HEIGHT / MASTER_WIDTH));

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }
    const visibleCtx = canvas.getContext('2d');
    visibleCtx.setTransform(1, 0, 0, 1, 0, 0);
    visibleCtx.imageSmoothingEnabled = true;
    visibleCtx.imageSmoothingQuality = 'high';
    visibleCtx.clearRect(0, 0, canvas.width, canvas.height);
    visibleCtx.drawImage(activeBuffer, 0, 0, activeBuffer.width, activeBuffer.height, 0, 0, canvas.width, canvas.height);
  }

  function clear() {
    revision++;
    activeBuffer = null;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (print) print.disabled = true;
    if (download) download.disabled = true;
    if (status) {
      status.textContent = '';
      status.removeAttribute('data-state');
    }
  }

  async function render(student, course) {
    clear();
    const current = revision;
    if (status) status.textContent = 'Preparing certificate…';

    const buffer = document.createElement('canvas');
    buffer.width = MASTER_WIDTH;
    buffer.height = MASTER_HEIGHT;
    const ctx = buffer.getContext('2d');
    const field = (...args) => drawField(ctx, ...args);

    try {
      const background = await loadImage(window.PUBLIC_SITE_CONFIG?.certificateTemplateUrl || 'assets/diganta-certificate-template.jpg?v=4');
      if (current !== revision) return;
      ctx.drawImage(background, 0, 0, MASTER_WIDTH, MASTER_HEIGHT);
      ctx.setTransform(MASTER_WIDTH / 1920, 0, 0, MASTER_HEIGHT / 1280, 0, 0);
      field(student.certificateSerial || student.id, 284, 533, 481, 34, 'left', 400);
      field(date(student.certificateIssueDate), 1640, 533, 200, 34, 'left', 400);
      field(student.name || student.fullName, 860, 642, 605);
      field(student.fatherName, 442, 704, 514);
      field(course?.title, 355, 765, 1055);
      field(course?.duration, 583, 901, 326);
      const period = [
        monthYear(student.certificateCourseStartDate),
        monthYear(student.certificateCourseEndDate)
      ].filter(Boolean).join(' - ');
      field(period, 1007, 901, 437, 33);
      field(student.grade, 706, 962, 252);

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
          ctx.save();
          ctx.strokeStyle = '#168bbb';
          ctx.lineWidth = 3;
          ctx.strokeRect(
            PHOTO_BOX.x + 1.5,
            PHOTO_BOX.y + 1.5,
            PHOTO_BOX.width - 3,
            PHOTO_BOX.height - 3
          );
          ctx.restore();
        } catch {}
      }

      if (window.QRious && student.id) {
        const rawSlug = (window.PUBLIC_SITE_CONFIG?.academySlug || student.academySlug || 'diganta').toLowerCase().trim();
        const slug = (rawSlug && !rawSlug.includes('@') && rawSlug !== 'rcavirup' && rawSlug !== 'prantik') ? rawSlug : 'diganta';
        const verificationUrl = `https://${slug}.pixelsetu.com/#certificate?c=${encodeURIComponent(student.id || student.regNo || '')}`;
        const qrCanvas = document.createElement('canvas');
        new window.QRious({
          element: qrCanvas,
          value: verificationUrl,
          size: 256,
          level: 'L',
          padding: 8,
          foreground: '#111111',
          background: '#ffffff'
        });
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(QR_BOX.x - 4, QR_BOX.y - 4, QR_BOX.size + 8, QR_BOX.size + 8);
        ctx.drawImage(qrCanvas, QR_BOX.x, QR_BOX.y, QR_BOX.size, QR_BOX.size);
        ctx.restore();
      }

      if (current !== revision) return;
      activeBuffer = buffer;

      updateVisibleCanvas();

      if (canvas) {
        canvas.setAttribute('aria-label', `Completion certificate for ${student.name || student.fullName}, ${course?.title || ''}, student ID ${student.id || ''}`);
      }
      filename = `certificate-${String(student.id || 'student').replace(/[^a-z0-9_-]/gi, '-')}`;
      if (print) print.disabled = false;
      if (download) download.disabled = false;
      if (status) {
        status.dataset.state = 'success';
        status.textContent = `Congratulations, ${student.name || student.fullName || 'Student'}! Your certificate is ready.`;
      }
    } catch {
      if (current !== revision) return;
      if (status) {
        status.dataset.state = 'error';
        status.textContent = 'The certificate template could not be loaded. Please contact the centre.';
      }
    }
  }

  if (download) {
    download.addEventListener('click', () => {
      const current = revision;
      const exportCanvas = activeBuffer || canvas;
      try {
        exportCanvas.toBlob(blob => {
          if (!blob || current !== revision) return;
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}.png`;
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }, 'image/png');
      } catch {
        if (status) {
          status.textContent = 'Download failed. Certificate images must allow cross-origin access.';
        }
      }
    });
  }

  // Preserve full 300DPI physical print resolution
  window.addEventListener('beforeprint', () => {
    if (activeBuffer && canvas) {
      canvas.width = MASTER_WIDTH;
      canvas.height = MASTER_HEIGHT;
      const printCtx = canvas.getContext('2d');
      printCtx.setTransform(1, 0, 0, 1, 0, 0);
      printCtx.drawImage(activeBuffer, 0, 0);
    }
  });

  window.addEventListener('afterprint', () => {
    if (activeBuffer && canvas) {
      updateVisibleCanvas();
    }
  });

  if (typeof ResizeObserver !== 'undefined' && canvas && canvas.parentElement) {
    const ro = new ResizeObserver(() => {
      if (activeBuffer && (!canvas.hidden || canvas.offsetParent !== null)) {
        updateVisibleCanvas();
      }
    });
    ro.observe(canvas.parentElement);
  } else {
    window.addEventListener('resize', () => {
      if (activeBuffer && (!canvas.hidden || canvas.offsetParent !== null)) {
        updateVisibleCanvas();
      }
    });
  }

  window.CertificateCanvas = { render, clear, updateVisibleCanvas };
})();

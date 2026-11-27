/* Application Form Canvas Engine: Clean Tabular Format & Non-distorted Photo (2550 × 3606, 300 DPI) */
(() => {
  'use strict';

  const MASTER_WIDTH = 2550;
  const MASTER_HEIGHT = 3606;
  const DESIGN_WIDTH = 850;
  const DESIGN_HEIGHT = 1202;

  const imageCache = new Map();

  const ASSET_URLS = {
    template: 'assets/Form-blank-canvas.jpg',
    templateFallback: 'https://ik.imagekit.io/d3ycnoiwd/academy/student-certificate/Form-blank-canvas.jpg',
    logo: 'https://ik.imagekit.io/d3ycnoiwd/academy/logo%20digu%20h.png'
  };

  function loadImage(url) {
    if (!url) return Promise.reject(new Error('No URL provided'));
    if (imageCache.has(url)) return Promise.resolve(imageCache.get(url));
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageCache.set(url, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error('Image could not be loaded: ' + url));
      img.src = url;
    });
  }

  async function loadTemplate() {
    try {
      return await loadImage(ASSET_URLS.template);
    } catch {
      return await loadImage(ASSET_URLS.templateFallback);
    }
  }

  function formatDate(d) {
    if (!d) return '—';
    if (typeof d === 'string') {
      const trimmed = d.trim();
      if (/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(trimmed)) {
        const parts = trimmed.split(/[/-]/);
        return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
      }
      if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
        const [year, month, day] = trimmed.slice(0, 10).split('-');
        return `${day}/${month}/${year}`;
      }
    }
    const parsed = new Date(d);
    if (isNaN(parsed.getTime())) return String(d);
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function formatAadhar(value) {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 12);
    if (!digits) return '—';
    return (digits.match(/.{1,4}/g) || []).join('-');
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, width, height, radius);
    } else {
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.arcTo(x + width, y, x + width, y + radius, radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
      ctx.lineTo(x + radius, y + height);
      ctx.arcTo(x, y + height, x, y + height - radius, radius);
      ctx.lineTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
    }
    ctx.closePath();
  }

  // Draw clean tabular row: Label | Value
  function drawTableRow(ctx, label, value, x, y, totalWidth, rowHeight, labelWidth) {
    // Value cell background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, totalWidth, rowHeight);

    // Label cell background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x, y, labelWidth, rowHeight);

    // Border and vertical divider
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, totalWidth, rowHeight);

    ctx.beginPath();
    ctx.moveTo(x + labelWidth, y);
    ctx.lineTo(x + labelWidth, y + rowHeight);
    ctx.stroke();

    // Label text
    ctx.textAlign = 'left';
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText(label, x + 14, y + Math.round(rowHeight / 2) + 4);

    // Value text
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px Arial, sans-serif';
    const cleanVal = String(value || '—').trim();
    const maxValueWidth = totalWidth - labelWidth - 28;

    let displayVal = cleanVal;
    if (ctx.measureText(displayVal).width > maxValueWidth) {
      while (displayVal.length > 4 && ctx.measureText(displayVal + '...').width > maxValueWidth) {
        displayVal = displayVal.slice(0, -1);
      }
      displayVal += '...';
    }
    ctx.fillText(displayVal, x + labelWidth + 14, y + Math.round(rowHeight / 2) + 4);
  }

  // Section Banner in Table (Classification Heading - Refined Soft Accent)
  function drawSectionBanner(ctx, title, x, y, totalWidth, bannerHeight) {
    ctx.fillStyle = '#cfe0f4';
    ctx.fillRect(x, y, totalWidth, bannerHeight);

    ctx.strokeStyle = '#b0c7e2';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, totalWidth, bannerHeight);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#173b69';
    ctx.font = 'bold 15.5px Arial, sans-serif';
    ctx.fillText(title.toUpperCase(), x + 14, y + Math.round(bannerHeight / 2) + 5.5);
  }

  // Draw passport photo without distortion (aspect ratio cover crop)
  function drawPassportPhoto(ctx, img, studentName, photoX, photoY, photoW, photoH) {
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#173b69';
    ctx.lineWidth = 1.5;
    roundRect(ctx, photoX, photoY, photoW, photoH, 6);
    ctx.fill();
    ctx.stroke();

    const bottomStripH = 22;
    const contentH = photoH - bottomStripH;

    if (img) {
      ctx.save();
      roundRect(ctx, photoX + 1, photoY + 1, photoW - 2, contentH - 1, 5);
      ctx.clip();

      const imgW = img.naturalWidth || img.width;
      const imgH = img.naturalHeight || img.height;
      const imgRatio = imgW / imgH;
      const targetW = photoW - 2;
      const targetH = contentH - 1;
      const targetRatio = targetW / targetH;

      let sx, sy, sw, sh;
      if (imgRatio > targetRatio) {
        // Image is wider than target frame: crop sides equally
        sh = imgH;
        sw = imgH * targetRatio;
        sx = (imgW - sw) / 2;
        sy = 0;
      } else {
        // Image is taller than target frame: crop top/bottom equally
        sw = imgW;
        sh = imgW / targetRatio;
        sx = 0;
        sy = (imgH - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, photoX + 1, photoY + 1, targetW, targetH);
      ctx.restore();
    } else {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 36px Arial, sans-serif';
      const initials = (studentName || 'ST').slice(0, 2).toUpperCase();
      ctx.fillText(initials, photoX + photoW / 2, photoY + Math.round(contentH / 2) + 12);
    }

    // Bottom strip label
    ctx.fillStyle = '#173b69';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(photoX, photoY + photoH - bottomStripH, photoW, bottomStripH, [0, 0, 5, 5]);
    } else {
      ctx.rect(photoX, photoY + photoH - bottomStripH, photoW, bottomStripH);
    }
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px Arial, sans-serif';
    ctx.fillText('PASSPORT PHOTO', photoX + photoW / 2, photoY + photoH - 7);
  }

  async function renderToBuffer(student, course) {
    const buffer = document.createElement('canvas');
    buffer.width = MASTER_WIDTH;
    buffer.height = MASTER_HEIGHT;
    const ctx = buffer.getContext('2d');

    const [templateImg, logoImg, photoImg] = await Promise.all([
      loadTemplate(),
      loadImage(ASSET_URLS.logo).catch(() => null),
      student?.photoUrl ? loadImage(student.photoUrl).catch(() => null) : Promise.resolve(null)
    ]);

    // 1. Draw template background (contains authentic outer frame border)
    ctx.drawImage(templateImg, 0, 0, MASTER_WIDTH, MASTER_HEIGHT);

    // 2. Set scale transform (exact 3.0x from 850x1202 design space to 2550x3606)
    ctx.setTransform(MASTER_WIDTH / DESIGN_WIDTH, 0, 0, MASTER_HEIGHT / DESIGN_HEIGHT, 0, 0);

    const profile = window.store?.getAcademyProfile?.() || window.publicApp?.academyProfile || {};
    const academyName = profile?.academyName || 'DIGANTA COMPUTER CENTRE';
    const regNo = student.id || student.regNo || 'DCC/SMP/00000';
    const studentName = student.name || student.fullName || 'Student Name';
    const courseTitle = course?.title || 'Diploma in Computer Applications (DCA)';
    const courseDuration = course?.duration || '6 Months';

    // 3. Draw Top Logo (Left side)
    if (logoImg) {
      ctx.drawImage(logoImg, 38, 28, 92, 92);

      // TM text badge on top-right of logo
      const tmX = 124;
      const tmY = 34;
      const tmRadius = 8.5;
      ctx.save();
      ctx.beginPath();
      ctx.arc(tmX, tmY, tmRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.3;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = '800 9px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TM', tmX, tmY + 0.5);
      ctx.restore();
    }

    // 4. Header Institution Typography (Spacious & Balanced)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#173b69';
    ctx.font = 'bold 31px Georgia, serif';
    ctx.fillText(academyName.toUpperCase(), 435, 52);

    ctx.fillStyle = '#334155';
    ctx.font = '12px Arial, sans-serif';
    ctx.fillText('has been independently assessed by PQC and found to comply with the requirement of', 435, 74);

    ctx.font = 'bold 13.5px Arial, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText('(Quality Management System)  ISO 9001:2015', 435, 94);

    ctx.font = '12px Arial, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Government Registration Certificate No. - QW-48825/1124', 435, 114);

    // Location with colored dots
    ctx.fillStyle = '#173b69';
    ctx.font = 'bold 18px Georgia, serif';
    const locCenterY = 138;
    const p1 = 'Gujarpur  ';
    const p2 = '  Shyampur  ';
    const p3 = '  Howrah';
    const dot = '●';
    const wP1 = ctx.measureText(p1).width;
    const wP2 = ctx.measureText(p2).width;
    const wP3 = ctx.measureText(p3).width;
    ctx.font = 'bold 13px Arial, sans-serif';
    const wDot = ctx.measureText(dot).width;
    ctx.font = 'bold 18px Georgia, serif';
    const totalLocW = wP1 + wDot + wP2 + wDot + wP3;
    let currLocX = 435 - totalLocW / 2;

    ctx.textAlign = 'left';
    ctx.fillText(p1, currLocX, locCenterY);
    currLocX += wP1;
    ctx.fillStyle = '#1684d5';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText(dot, currLocX, locCenterY - 1);
    currLocX += wDot;
    ctx.fillStyle = '#173b69';
    ctx.font = 'bold 18px Georgia, serif';
    ctx.fillText(p2, currLocX, locCenterY);
    currLocX += wP2;
    ctx.fillStyle = '#1684d5';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText(dot, currLocX, locCenterY - 1);
    currLocX += wDot;
    ctx.fillStyle = '#173b69';
    ctx.font = 'bold 18px Georgia, serif';
    ctx.fillText(p3, currLocX, locCenterY);

    // 5. Title Banner (Spaced with breathing room below header block)
    const bannerY = 176;
    const bannerH = 42;
    const bannerX = 44;
    const bannerW = 762;
    ctx.fillStyle = '#173b69';
    roundRect(ctx, bannerX, bannerY, bannerW, bannerH, 6);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 19px Arial, sans-serif';
    ctx.fillText('STUDENT ADMISSION APPLICATION FORM', 425, bannerY + 27);

    // 6. Meta Bar with STUDENT ID (Larger & More Readable)
    const metaY = 228;
    const metaH = 40;
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.2;
    roundRect(ctx, 44, metaY, 762, metaH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 11.5px Arial, sans-serif';
    ctx.fillText('STUDENT ID:', 58, metaY + 25);

    ctx.fillStyle = '#173b69';
    ctx.font = 'bold 15px Arial, sans-serif';
    ctx.fillText(regNo, 148, metaY + 25);

    // Right: REGISTRATION DATE (Status removed)
    const regDateVal = formatDate(student.joinDate || student.createdAt);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#173b69';
    ctx.font = 'bold 15px Arial, sans-serif';
    ctx.fillText(regDateVal, 792, metaY + 25);

    const regDateWidth = ctx.measureText(regDateVal).width;
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 11.5px Arial, sans-serif';
    ctx.fillText('REGISTRATION DATE: ', 792 - regDateWidth - 4, metaY + 25);

    // ==========================================
    // TABULAR FORMAT (One info in one line: Label | Value)
    // ==========================================
    const tableX = 44;
    const fullTableW = 762;
    const labelW = 210;

    // SECTION 1: BASIC DETAILS (with non-distorted Passport Photo beside rows 1 to 5)
    let currentY = 280;
    const sec1BannerH = 34;
    drawSectionBanner(ctx, '1. Basic Details', tableX, currentY, fullTableW, sec1BannerH);
    currentY += sec1BannerH;

    // Photo parameters: 144 × 185 with breathing margins on all sides
    const photoW = 144;
    const photoH = 185;
    const photoX = 650;
    const photoY = currentY + 10;

    // Rows 1 to 5 beside photo (width = 586px)
    const topRowW = 586;
    const topRowH = 41;

    drawTableRow(ctx, 'Full Name', studentName, tableX, currentY, topRowW, topRowH, labelW);
    currentY += topRowH;

    drawTableRow(ctx, 'Date of Birth', formatDate(student.dob), tableX, currentY, topRowW, topRowH, labelW);
    currentY += topRowH;

    drawTableRow(ctx, "Father's Name", student.fatherName || '—', tableX, currentY, topRowW, topRowH, labelW);
    currentY += topRowH;

    drawTableRow(ctx, "Mother's Name", student.motherName || '—', tableX, currentY, topRowW, topRowH, labelW);
    currentY += topRowH;

    drawTableRow(ctx, 'Aadhar Number', formatAadhar(student.aadhar), tableX, currentY, topRowW, topRowH, labelW);
    currentY += topRowH;

    // Draw Passport Photo on the right with aspect-ratio preserving crop (NO DISTORTION)
    drawPassportPhoto(ctx, photoImg, studentName, photoX, photoY, photoW, photoH);

    // Rows 6 to 11 across full width (762px)
    const standardRowH = 36;

    drawTableRow(ctx, 'Gender', student.gender || '—', tableX, currentY, fullTableW, standardRowH, labelW);
    currentY += standardRowH;

    drawTableRow(ctx, 'Marital Status', student.maritalStatus || '—', tableX, currentY, fullTableW, standardRowH, labelW);
    currentY += standardRowH;

    drawTableRow(ctx, 'Category', student.category || '—', tableX, currentY, fullTableW, standardRowH, labelW);
    currentY += standardRowH;

    drawTableRow(ctx, 'Religion', student.religion || '—', tableX, currentY, fullTableW, standardRowH, labelW);
    currentY += standardRowH;

    drawTableRow(ctx, 'Highest Qualification', student.qualification || '—', tableX, currentY, fullTableW, standardRowH, labelW);
    currentY += standardRowH + 20;

    // SECTION 2: CONTACT DETAILS
    drawSectionBanner(ctx, '2. Contact Details', tableX, currentY, fullTableW, sec1BannerH);
    currentY += sec1BannerH;

    drawTableRow(ctx, 'Mobile Number', student.phone || '—', tableX, currentY, fullTableW, standardRowH, labelW);
    currentY += standardRowH;

    drawTableRow(ctx, 'Email Address', student.email || '—', tableX, currentY, fullTableW, standardRowH, labelW);
    currentY += standardRowH + 20;

    // SECTION 3: ADDRESS DETAILS
    drawSectionBanner(ctx, '3. Address Details', tableX, currentY, fullTableW, sec1BannerH);
    currentY += sec1BannerH;

    drawTableRow(ctx, 'State', student.state || '—', tableX, currentY, fullTableW, standardRowH, labelW);
    currentY += standardRowH;

    drawTableRow(ctx, 'District', student.district || '—', tableX, currentY, fullTableW, standardRowH, labelW);
    currentY += standardRowH;

    drawTableRow(ctx, 'Pin Code', student.pinCode || '—', tableX, currentY, fullTableW, standardRowH, labelW);
    currentY += standardRowH;

    const addressRowH = 42;
    drawTableRow(ctx, 'Full Permanent Address', student.address || '—', tableX, currentY, fullTableW, addressRowH, labelW);
    currentY += addressRowH + 20;

    // SECTION 4: COURSE SELECTION & ENROLLMENT
    drawSectionBanner(ctx, '4. Course Selection & Enrollment', tableX, currentY, fullTableW, sec1BannerH);
    currentY += sec1BannerH;

    drawTableRow(ctx, 'Enrolled Course', courseTitle, tableX, currentY, fullTableW, standardRowH, labelW);
    currentY += standardRowH;

    drawTableRow(ctx, 'Course Duration', courseDuration, tableX, currentY, fullTableW, standardRowH, labelW);
    currentY += standardRowH;

    return buffer;
  }

  // Create lightweight, standard 1-page A4 PDF embedding the 300 DPI image (no external libraries required)
  function createPdfFromJpegBlob(jpegBlob, width, height) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const jpegBytes = new Uint8Array(reader.result);

          // A4 portrait in standard PDF points (72 pt per inch: 595.28 x 841.89 pt)
          const pageW = 595.28;
          const pageH = 841.89;
          const contentStream = `q ${pageW.toFixed(2)} 0 0 ${pageH.toFixed(2)} 0 0 cm /Im0 Do Q`;

          const encoder = new TextEncoder();
          const parts = [];
          let totalLength = 0;
          const offsets = [];

          function addStr(str) {
            offsets.push(totalLength);
            const encoded = encoder.encode(str);
            parts.push(encoded);
            totalLength += encoded.length;
          }

          function addRaw(encoded) {
            parts.push(encoded);
            totalLength += encoded.length;
          }

          // PDF Header
          const header = encoder.encode('%PDF-1.4\n');
          parts.push(header);
          totalLength += header.length;

          // Object 1: Catalog
          addStr('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

          // Object 2: Pages root
          addStr('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

          // Object 3: Page definition
          addStr(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`);

          // Object 4: Image XObject (JPEG / DCTDecode at 300 DPI)
          const imgHeaderStr = `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`;
          const imgFooterStr = '\nendstream\nendobj\n';
          offsets.push(totalLength);
          addRaw(encoder.encode(imgHeaderStr));
          addRaw(jpegBytes);
          addRaw(encoder.encode(imgFooterStr));

          // Object 5: Content stream placing the image
          const csStr = `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`;
          addStr(csStr);

          // Cross-reference table
          const startXref = totalLength;
          let xref = 'xref\n0 6\n0000000000 65535 f \n';
          for (let i = 0; i < 5; i++) {
            xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
          }
          const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;
          addRaw(encoder.encode(xref + trailer));

          const pdfBlob = new Blob(parts, { type: 'application/pdf' });
          resolve(pdfBlob);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image binary for PDF generation'));
      reader.readAsArrayBuffer(jpegBlob);
    });
  }

  async function downloadApplicationForm(student, course) {
    if (!student) throw new Error('Student data is missing');
    const buffer = await renderToBuffer(student, course);

    // Generate high-quality JPEG blob from canvas buffer (0.96 quality for pristine clarity)
    const jpegBlob = await new Promise((resolve, reject) => {
      buffer.toBlob(blob => {
        if (!blob) reject(new Error('Failed to generate image from canvas'));
        else resolve(blob);
      }, 'image/jpeg', 0.96);
    });

    // Wrap the image into an authentic A4 PDF file
    const pdfBlob = await createPdfFromJpegBlob(jpegBlob, MASTER_WIDTH, MASTER_HEIGHT);

    const cleanId = String(student.id || 'Student').replace(/[^a-zA-Z0-9_-]/g, '-');
    const cleanName = (student.name || 'Application').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
    const filename = `Application_Form-${cleanId}-${cleanName}.pdf`;

    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
    return filename;
  }

  window.ApplicationFormCanvas = {
    renderToBuffer,
    downloadApplicationForm
  };
})();

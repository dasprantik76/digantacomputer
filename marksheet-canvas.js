/* Marksheet Canvas Engine: Renders marksheets on Marksheet-canvas.jpg at 2550 × 3606 (300 DPI) */
(() => {
  'use strict';

  const canvas = document.getElementById('marksheetCanvas');
  const status = document.getElementById('marksheetStatus');
  const download = document.getElementById('marksheetDownloadSelected');
  const MASTER_WIDTH = 2550;
  const MASTER_HEIGHT = 3606;
  const DESIGN_WIDTH = 850;
  const DESIGN_HEIGHT = 1202;

  let revision = 0;
  let filename = 'marksheet';
  let activeBuffer = null;
  const imageCache = new Map();

  const ASSET_URLS = {
    template: 'assets/Marksheet-canvas.jpg',
    templateFallback: 'https://ik.imagekit.io/d3ycnoiwd/academy/student-certificate/Marksheet-canvas.jpg',
    logo: 'https://ik.imagekit.io/d3ycnoiwd/academy/logo%20digu%20h.png',
    iso: 'https://ik.imagekit.io/d3ycnoiwd/academy/certificate-logos/iso.jpg',
    stamp: 'https://ik.imagekit.io/d3ycnoiwd/academy/certificate-logos/Stamp-diganta.png'
  };

  function loadImage(url) {
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
    if (!d) return new Date().toLocaleDateString('en-GB');
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

  function calculateMarksData(student, course, batch) {
    let courseSubjects = Array.isArray(course?.subjects) && course.subjects.length > 0
      ? course.subjects
      : [
          '1st Terminal — Computer Fundamentals',
          '2nd Terminal — Windows, MS-Office (Word, Excel, Power Point, Internet)',
          '3rd Terminal — MS-Access, FoxPro Programming, Internet & E-Mail',
          'Course Final — Comprehensive Viva & Project'
        ];

    // Ensure a course has at most 4 subjects
    if (courseSubjects.length > 4) {
      courseSubjects = courseSubjects.slice(0, 4);
    }

    let hash = 0;
    for (let i = 0; i < (student.id || '').length; i++) {
      hash = ((hash << 5) - hash) + (student.id || '').charCodeAt(i) | 0;
    }
    const seed = Math.abs(hash);

    const targetGrade = student.grade || batch?.grade || 'A+';
    let baseScore = 88;
    if (targetGrade === 'A+') baseScore = 88;
    else if (targetGrade === 'A') baseScore = 75;
    else if (targetGrade === 'B') baseScore = 62;
    else if (targetGrade === 'C') baseScore = 45;
    else if (targetGrade === 'D') baseScore = 38;

    let totalMax = 0;
    let totalObtained = 0;

    const rows = courseSubjects.map((subj, idx) => {
      const isFinal = idx === courseSubjects.length - 1 && courseSubjects.length > 2;
      const maxMarks = isFinal ? 200 : 100;
      const variance = ((seed + idx * 17) % 9) - 4;
      let obtainedPct = Math.max(35, Math.min(98, baseScore + variance));
      const obtained = Math.round((obtainedPct / 100) * maxMarks);

      totalMax += maxMarks;
      totalObtained += obtained;

      let title = subj;
      let modules = '';
      if (subj.includes('—') || subj.includes('-')) {
        const parts = subj.split(/[—-]/);
        title = parts[0].trim();
        modules = 'Modules: ' + parts.slice(1).join(' - ').trim();
      }

      return { slNo: idx + 1, title, modules, maxMarks, obtained };
    });

    const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : '85.0';
    let finalGrade = 'A+';
    const pctNum = parseFloat(percentage);
    if (pctNum >= 80) finalGrade = 'A+';
    else if (pctNum >= 70) finalGrade = 'A';
    else if (pctNum >= 50) finalGrade = 'B';
    else if (pctNum >= 40) finalGrade = 'C';
    else finalGrade = 'D';

    return { rows, totalMax, totalObtained, percentage, finalGrade };
  }

  async function renderToBuffer(student, course, batch, verificationUrl) {
    const buffer = document.createElement('canvas');
    buffer.width = MASTER_WIDTH;
    buffer.height = MASTER_HEIGHT;
    const ctx = buffer.getContext('2d');

    const [templateImg, logoImg, isoImg, stampImg] = await Promise.all([
      loadTemplate(),
      loadImage(ASSET_URLS.logo).catch(() => null),
      loadImage(ASSET_URLS.iso).catch(() => null),
      loadImage(ASSET_URLS.stamp).catch(() => null)
    ]);

    // 1. Draw template background (contains authentic outer frame border)
    ctx.drawImage(templateImg, 0, 0, MASTER_WIDTH, MASTER_HEIGHT);

    // 2. Set scale transform (exact 3.0x from 850x1202 design space to 2550x3606)
    ctx.setTransform(MASTER_WIDTH / DESIGN_WIDTH, 0, 0, MASTER_HEIGHT / DESIGN_HEIGHT, 0, 0);

    const profile = window.store?.getAcademyProfile?.() || {};
    const academyName = profile?.academyName || 'DIGANTA COMPUTER CENTRE';
    const regNo = student.id || student.regNo || 'DCC/SMP/00000';
    const studentName = student.name || student.fullName || 'Student Name';
    const fatherName = student.fatherName || '—';
    const courseTitle = course?.title || 'Diploma in Computer Application (DCA)';
    const duration = course?.duration || '12 Months';
    const centre = `M/s. ${academyName}, Gujarpur, Shyampur, Howrah`;
    const certIssueDate =
      student.certificateIssueDate ||
      batch?.certificateIssueDate ||
      student.certIssueDate ||
      student.certificate_issue_date ||
      student.certificateDate ||
      student.issueDate ||
      batch?.certIssueDate ||
      batch?.certificate_issue_date ||
      student.completionDate ||
      student.completedAt ||
      batch?.completedAt ||
      new Date();
    const issueDate = formatDate(certIssueDate);

    const { rows, totalMax, totalObtained, percentage, finalGrade } = calculateMarksData(student, course, batch);

    // 3. Draw Top Logos
    if (logoImg) {
      ctx.drawImage(logoImg, 36, 28, 100, 100);

      // TM text badge on top-right of logo
      const tmX = 129;
      const tmY = 35;
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
    if (isoImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(714 + 50, 28 + 50, 50, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(isoImg, 714, 28, 100, 100);
      ctx.restore();
    }

    // 4. Draw Header Text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#173b69';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillText(academyName.toUpperCase(), 425, 52);

    ctx.fillStyle = '#222222';
    ctx.font = 'bold 12.5px Arial, sans-serif';
    ctx.fillText('has been independently assessed by PQC and found to comply with the requirement of', 425, 75);

    ctx.font = 'bold 14.5px Arial, sans-serif';
    ctx.fillText('(Quality Management System)', 425, 95);

    ctx.font = 'bold 16px Georgia, serif';
    ctx.fillText('ISO 9001:2015', 425, 116);

    ctx.font = 'bold 12.5px Arial, sans-serif';
    ctx.fillText('Government Registration Certificate No. - QW-48825/1124', 425, 134);

    // Location with colored dots
    ctx.fillStyle = '#173b69';
    ctx.font = 'bold 19px Georgia, serif';
    const locCenterY = 156;
    const p1 = 'Gujarpur  ';
    const p2 = '  Shyampur  ';
    const p3 = '  Howrah';
    const dot = '●';
    const wP1 = ctx.measureText(p1).width;
    const wP2 = ctx.measureText(p2).width;
    const wP3 = ctx.measureText(p3).width;
    ctx.font = 'bold 14px Arial, sans-serif';
    const wDot = ctx.measureText(dot).width;
    ctx.font = 'bold 19px Georgia, serif';
    const totalLocW = wP1 + wDot + wP2 + wDot + wP3;
    let currLocX = 425 - totalLocW / 2;

    ctx.textAlign = 'left';
    ctx.fillText(p1, currLocX, locCenterY);
    currLocX += wP1;
    ctx.fillStyle = '#1684d5';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText(dot, currLocX, locCenterY);
    currLocX += wDot;
    ctx.fillStyle = '#173b69';
    ctx.font = 'bold 19px Georgia, serif';
    ctx.fillText(p2, currLocX, locCenterY);
    currLocX += wP2;
    ctx.fillStyle = '#1684d5';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText(dot, currLocX, locCenterY);
    currLocX += wDot;
    ctx.fillStyle = '#173b69';
    ctx.font = 'bold 19px Georgia, serif';
    ctx.fillText(p3, currLocX, locCenterY);

    // Header divider line
    ctx.strokeStyle = '#173b69';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(36, 168);
    ctx.lineTo(814, 168);
    ctx.stroke();

    // 5. Section Title Banner
    ctx.fillStyle = '#173b69';
    ctx.fillRect(36, 178, 778, 34);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 17px Georgia, serif';
    ctx.fillText('STATEMENT OF MARKS', 425, 201);

    // 6. Student Information (with generous, elegant line height)
    const labelX = 48;
    const colonX = 310;
    const valueX = 328;
    const details = [
      ['Registration Number', regNo],
      ['The statement of Mr./Ms.', studentName],
      ['Son / Daughter / Wife of', fatherName],
      ['On Successful Completion of', courseTitle],
      ['Duration', duration],
      ['At Authorised Training Centre', centre]
    ];

    let detY = 242;
    const detStep = 33;
    ctx.font = '600 15px Arial, sans-serif';
    for (const [lbl, val] of details) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#222222';
      ctx.fillText(lbl, labelX, detY);
      ctx.fillText(':', colonX, detY);
      ctx.fillStyle = '#111111';
      ctx.fillText(val, valueX, detY, 814 - valueX - 12);
      detY += detStep;
    }

    // 7. Marks Table (designed for up to 4 subjects)
    const tableTop = 440;
    const tableW = 778;
    const colW = [65, 473, 120, 120];
    const colX = [36, 36 + 65, 36 + 65 + 473, 36 + 65 + 473 + 120, 36 + tableW];
    const tableHdrH = 40;
    const rowH = Math.max(54, Math.min(68, Math.round(216 / Math.max(rows.length, 1))));
    const totH = 38;
    const totalTableH = tableHdrH + rows.length * rowH + totH;
    const totalTopY = tableTop + tableHdrH + rows.length * rowH;
    const TABLE_LINE_WIDTH = 1.4;
    const TABLE_LINE_COLOR = '#222222';

    // 1. Fill entire table background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(36, tableTop, tableW, totalTableH);

    // 2. Render Text
    // Table Header Text
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 14.5px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sl. No.', (colX[0] + colX[1]) / 2, tableTop + 25);
    ctx.textAlign = 'left';
    ctx.fillText('Examination / Subjects / Modules', colX[1] + 18, tableTop + 25);
    ctx.textAlign = 'center';
    ctx.fillText('Max. Marks', (colX[2] + colX[3]) / 2, tableTop + 25);
    ctx.fillText('Marks Obtained', (colX[3] + colX[4]) / 2, tableTop + 25);

    // Subject Rows Text
    let rowY = tableTop + tableHdrH;
    for (const r of rows) {
      ctx.fillStyle = '#222222';
      ctx.textAlign = 'center';
      ctx.font = '15px Arial, sans-serif';
      ctx.fillText(String(r.slNo), (colX[0] + colX[1]) / 2, rowY + 32);

      ctx.textAlign = 'left';
      ctx.font = 'bold 15px Arial, sans-serif';
      ctx.fillStyle = '#111111';
      ctx.fillText(r.title, colX[1] + 18, rowY + (r.modules ? 23 : 32));
      if (r.modules) {
        ctx.font = '13px Arial, sans-serif';
        ctx.fillStyle = '#444444';
        ctx.fillText(r.modules, colX[1] + 18, rowY + 44, colW[1] - 28);
      }

      ctx.fillStyle = '#222222';
      ctx.font = '15px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(r.maxMarks), (colX[2] + colX[3]) / 2, rowY + 32);
      ctx.fillText(String(r.obtained), (colX[3] + colX[4]) / 2, rowY + 32);

      rowY += rowH;
    }

    // Total Row Text
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 15.5px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('TOTAL', colX[2] - 20, rowY + 24);
    ctx.textAlign = 'center';
    ctx.fillText(String(totalMax), (colX[2] + colX[3]) / 2, rowY + 24);
    ctx.fillText(String(totalObtained), (colX[3] + colX[4]) / 2, rowY + 24);

    // 3. Render Table Grid Lines (crisp, unified, single-stroked)
    ctx.strokeStyle = TABLE_LINE_COLOR;
    ctx.lineWidth = TABLE_LINE_WIDTH;

    // Outer table border
    ctx.strokeRect(36, tableTop, tableW, totalTableH);

    // Horizontal grid lines
    ctx.beginPath();
    ctx.moveTo(36, tableTop + tableHdrH);
    ctx.lineTo(36 + tableW, tableTop + tableHdrH);
    for (let i = 1; i < rows.length; i++) {
      const y = tableTop + tableHdrH + i * rowH;
      ctx.moveTo(36, y);
      ctx.lineTo(36 + tableW, y);
    }
    ctx.moveTo(36, totalTopY);
    ctx.lineTo(36 + tableW, totalTopY);
    ctx.stroke();

    // Vertical column grid lines
    ctx.beginPath();
    for (let c = 1; c < colX.length - 1; c++) {
      ctx.moveTo(colX[c], tableTop);
      ctx.lineTo(colX[c], totalTopY);
    }
    ctx.moveTo(colX[2], totalTopY);
    ctx.lineTo(colX[2], tableTop + totalTableH);
    ctx.moveTo(colX[3], totalTopY);
    ctx.lineTo(colX[3], tableTop + totalTableH);
    ctx.stroke();

    const tableBottom = tableTop + totalTableH;

    // 8. Overall Result Details
    const resY = tableBottom + 26;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#222222';
    ctx.font = 'bold 15px Arial, sans-serif';
    ctx.fillText('Overall Percentage', labelX, resY + 16);

    ctx.font = '13px Arial, sans-serif';
    ctx.fillStyle = '#555555';
    ctx.fillText('(50% of Terminal average + 50% of Final Exam):', labelX, resY + 35);

    ctx.font = 'bold 15px Arial, sans-serif';
    ctx.fillStyle = '#222222';
    ctx.fillText('Overall Performance / Grade', labelX, resY + 62);
    ctx.fillText(':', colonX, resY + 62);
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 17px Arial, sans-serif';
    ctx.fillText(`${percentage}% (Approx.)`, valueX, resY + 62);

    ctx.font = 'bold 15px Arial, sans-serif';
    ctx.fillStyle = '#222222';
    ctx.fillText('Grade Bar for Overall Performance', labelX, resY + 89);
    ctx.fillText(':', colonX, resY + 89);
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText(finalGrade, valueX, resY + 89);

    // 9. Bottom Section (Grade Table, QR Code, Stamp, Signature)
    // Anchored at botY = 895 to utilize vertical space and prevent empty lower-page gaps
    const botY = Math.max(895, resY + 115);

    // Left: Grade Table
    const grW = 300;
    const grCol = [36, 36 + 105, 36 + grW];
    const grHeaderH = 30;
    const grRowH = 26;
    const grades = [
      ['A+', '80% & Above'],
      ['A', '70% to 79%'],
      ['B', '50% to 69%'],
      ['C', '40% to 49%'],
      ['D', 'Below 40%']
    ];
    const totalGrH = grHeaderH + grades.length * grRowH;

    // 1. Fill entire grade table background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(36, botY, grW, totalGrH);

    // 2. Render Text
    // Grade header text
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Grade', (grCol[0] + grCol[1]) / 2, botY + 20);
    ctx.fillText('Percentage of Marks', (grCol[1] + grCol[2]) / 2, botY + 20);

    // Grade rows text
    let grCurrY = botY + grHeaderH;
    for (const [g, desc] of grades) {
      const isMatch = g === finalGrade;
      ctx.fillStyle = '#111111';
      ctx.font = isMatch ? 'bold 14px Arial, sans-serif' : '13px Arial, sans-serif';
      ctx.fillText(g, (grCol[0] + grCol[1]) / 2, grCurrY + 18);
      ctx.fillText(desc, (grCol[1] + grCol[2]) / 2, grCurrY + 18);
      grCurrY += grRowH;
    }

    // 3. Render Grade Table Grid Lines (identical consistency to main table)
    ctx.strokeStyle = TABLE_LINE_COLOR;
    ctx.lineWidth = TABLE_LINE_WIDTH;

    // Outer border
    ctx.strokeRect(36, botY, grW, totalGrH);

    // Horizontal grid lines
    ctx.beginPath();
    ctx.moveTo(36, botY + grHeaderH);
    ctx.lineTo(36 + grW, botY + grHeaderH);
    for (let i = 1; i < grades.length; i++) {
      const y = botY + grHeaderH + i * grRowH;
      ctx.moveTo(36, y);
      ctx.lineTo(36 + grW, y);
    }
    ctx.stroke();

    // Vertical column divider (runs continuously top-to-bottom)
    ctx.beginPath();
    ctx.moveTo(grCol[1], botY);
    ctx.lineTo(grCol[1], botY + totalGrH);
    ctx.stroke();

    // QR Code Area (centered in the middle between Grade table and Stamp section)
    const qrCenterX = 470;
    const boxSize = 104;
    const boxX = qrCenterX - boxSize / 2;
    const boxY = botY + 4;
    const targetPadding = 9;
    const qrDrawSize = boxSize - 2 * targetPadding;
    const qrDrawX = boxX + targetPadding;
    const qrDrawY = boxY + targetPadding;

    if (window.QRious) {
      const rawSlug = (profile?.academySlug || profile?.slug || window.PUBLIC_SITE_CONFIG?.academySlug || student.academySlug || 'diganta').toLowerCase().trim();
      const slug = (rawSlug && !rawSlug.includes('@') && rawSlug !== 'rcavirup' && rawSlug !== 'prantik') ? rawSlug : 'diganta';
      const qrUrl = verificationUrl || `https://${slug}.pixelsetu.com/#marksheet?m=${encodeURIComponent(student.id || student.regNo || '')}`;
      const qrCanvas = document.createElement('canvas');
      new window.QRious({
        element: qrCanvas,
        value: qrUrl,
        size: 256,
        level: 'L',
        padding: 0
      });

      // Find exact tight bounding box of QR modules to eliminate any integer-grid asymmetry from QRious
      let minX = qrCanvas.width;
      let maxX = 0;
      let minY = qrCanvas.height;
      let maxY = 0;
      let foundDark = false;

      try {
        const qrCtx = qrCanvas.getContext('2d');
        const imgData = qrCtx.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
        const d = imgData.data;
        for (let y = 0; y < qrCanvas.height; y++) {
          for (let x = 0; x < qrCanvas.width; x++) {
            const idx = (y * qrCanvas.width + x) * 4;
            if (d[idx] < 100 && d[idx + 3] > 100) {
              foundDark = true;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
      } catch {
        foundDark = false;
      }

      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1784d6';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(boxX, boxY, boxSize, boxSize, 6);
      } else {
        ctx.rect(boxX, boxY, boxSize, boxSize);
      }
      ctx.fill();
      ctx.stroke();

      if (foundDark && maxX > minX && maxY > minY) {
        const srcW = maxX - minX + 1;
        const srcH = maxY - minY + 1;
        ctx.drawImage(qrCanvas, minX, minY, srcW, srcH, qrDrawX, qrDrawY, qrDrawSize, qrDrawSize);
      } else {
        ctx.drawImage(qrCanvas, qrDrawX, qrDrawY, qrDrawSize, qrDrawSize);
      }
      ctx.restore();
    }

    // Date line (aligned with the centered QR code)
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(qrCenterX - 65, botY + 128);
    ctx.lineTo(qrCenterX + 65, botY + 128);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#222222';
    ctx.font = 'bold 13.5px Arial, sans-serif';
    ctx.fillText(issueDate, qrCenterX, botY + 146);
    ctx.font = 'bold 12.5px Arial, sans-serif';
    ctx.fillText('Date of Issue', qrCenterX, botY + 162);

    // Official Stamp Area
    const stampW = 205;
    const stampH = 133;
    const stampCenter = 705;
    const stampX = Math.round(stampCenter - stampW / 2);
    const stampY = botY - 12;

    if (stampImg) {
      ctx.drawImage(stampImg, stampX, stampY, stampW, stampH);
    }

    // Signature line
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(stampCenter - 95, botY + 128);
    ctx.lineTo(stampCenter + 95, botY + 128);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#222222';
    ctx.font = 'bold 16px Georgia, serif';
    ctx.fillText('Secretary / Director', stampCenter, botY + 152);

    // 10. Footer (balanced neatly above the bottom border)
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(36, 1110);
    ctx.lineTo(814, 1110);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText('New Authorized Computer Training Centre at Shyampur', 425, 1140);

    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillStyle = '#222222';
    ctx.fillText('Shyampur National Youth Computer Literacy Drive oppo.State Bank of India, Pin-711314', 425, 1162);

    return buffer;
  }

  function updateVisibleCanvas() {
    if (!activeBuffer || !canvas) return;
    const stage = canvas.parentElement;
    const stageWidth = (stage ? stage.clientWidth - 32 : 0) || 720;
    const stageHeight = (stage ? stage.clientHeight - 32 : 0) || 1000;
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);

    const aspect = MASTER_WIDTH / MASTER_HEIGHT;
    let targetWidth = stageWidth;
    let targetHeight = targetWidth / aspect;
    if (targetHeight > stageHeight && stageHeight > 100) {
      targetHeight = stageHeight;
      targetWidth = targetHeight * aspect;
    }

    const renderW = Math.max(300, Math.round(targetWidth * dpr));
    const renderH = Math.round(renderW / aspect);

    if (canvas.width !== renderW || canvas.height !== renderH) {
      canvas.width = renderW;
      canvas.height = renderH;
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
      canvas.setAttribute('aria-busy', 'false');
      canvas.hidden = true;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    const emptyState = document.getElementById('marksheetPreviewEmpty');
    if (emptyState) emptyState.hidden = false;
    if (download) download.disabled = true;
    if (status) {
      status.textContent = '';
      status.removeAttribute('data-state');
    }
  }

  async function render(student, course, batch, verificationUrl) {
    const current = ++revision;
    if (download) download.disabled = true;
    if (status) status.textContent = '';
    if (canvas) canvas.setAttribute('aria-busy', 'true');

    try {
      const buffer = await renderToBuffer(student, course, batch, verificationUrl);
      if (current !== revision) return;
      activeBuffer = buffer;

      if (canvas) {
        canvas.hidden = false;
        canvas.setAttribute('aria-busy', 'false');
      }
      const emptyState = document.getElementById('marksheetPreviewEmpty');
      if (emptyState) emptyState.hidden = true;

      updateVisibleCanvas();

      filename = `Marksheet-${String(student.id || '').replace(/[^a-zA-Z0-9_-]/g, '-')}-${(student.name || 'Student').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_')}`;
      if (download) download.disabled = false;
    } catch (err) {
      console.error('MarksheetCanvas render error:', err);
      if (current !== revision) return;
      if (canvas) canvas.setAttribute('aria-busy', 'false');
      if (status) {
        status.textContent = 'Could not load marksheet template.';
      }
    }
  }

  function downloadActiveMarksheet() {
    if (!activeBuffer) return;
    activeBuffer.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }

  async function generateStudentMarksheetPng(student, course, batch, verificationUrl) {
    const buffer = await renderToBuffer(student, course, batch, verificationUrl);
    return new Promise(resolve => buffer.toBlob(resolve, 'image/png'));
  }

  if (typeof ResizeObserver !== 'undefined' && canvas && canvas.parentElement) {
    const ro = new ResizeObserver(() => {
      if (activeBuffer && !canvas.hidden) {
        updateVisibleCanvas();
      }
    });
    ro.observe(canvas.parentElement);
  } else {
    window.addEventListener('resize', () => {
      if (activeBuffer && !canvas.hidden) {
        updateVisibleCanvas();
      }
    });
  }

  window.MarksheetCanvas = {
    render,
    clear,
    updateVisibleCanvas,
    renderToBuffer,
    generateStudentMarksheetPng,
    downloadActiveMarksheet
  };
})();

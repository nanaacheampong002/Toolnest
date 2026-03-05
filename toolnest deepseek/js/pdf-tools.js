// ToolNest PDF Tools — works locally in Edge (file://) and when hosted
// Requires: pdf.js, pdf-lib, jszip (already loaded in pdf-tools.html)

// ---------------------------
// Library guards
// ---------------------------
const hasPdfJs = !!window.pdfjsLib;
const hasPdfLib = !!window.PDFLib;
const hasZip = !!window.JSZip;

if (hasPdfJs) {
  // Worker can be blocked under file:// in some browsers. We still set workerSrc,
  // but we also use disableWorker:true for reliability.
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
  } catch {}
} else {
  console.warn('[PDF Tools] pdf.js missing. Thumbnails & PDF→Images will not work.');
}

const { PDFDocument, degrees } = (hasPdfLib ? window.PDFLib : {});
if (!PDFDocument) {
  console.warn('[PDF Tools] pdf-lib missing. Merge/Split/Rotate/etc will not work.');
}
if (!hasZip) {
  console.warn('[PDF Tools] JSZip missing. Split/PDF→Images ZIP downloads will not work.');
}

// ---------------------------
// Small DOM helpers
// ---------------------------
const $ = (id) => document.getElementById(id);

function show(el, on = true) {
  if (!el) return;
  el.style.display = on ? 'block' : 'none';
}

function humanSize(bytes) {
  if (!Number.isFinite(bytes)) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function downloadPdfBytes(bytes, filename) {
  downloadBlob(new Blob([bytes], { type: 'application/pdf' }), filename);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[m]));
}

function fileItemHTML(name, icon = 'description') {
  return `
    <div class="file-item">
      <span class="material-icons">${icon}</span>
      <span>${escapeHtml(name)}</span>
    </div>
  `;
}

// ---------------------------
// Accordion (tool open/close)
// ---------------------------
// main.js might define toggleTool too; we define it here so PDF page always works.
window.toggleTool = function toggleTool(header) {
  const card = header.closest('.tool-card');
  if (!card) return;
  const content = card.querySelector('.tool-content');
  const icon = header.querySelector('.expand-icon');

  const expanded = !card.classList.contains('expanded');
  card.classList.toggle('expanded', expanded);
  if (content) content.style.display = expanded ? 'block' : 'none';
  if (icon) icon.textContent = expanded ? 'expand_less' : 'expand_more';
};

// Drag helpers used by HTML
window.handleDragOver = function handleDragOver(e) {
  e.preventDefault();
  if (e.currentTarget) e.currentTarget.classList.add('drag-over');
};
window.handleDragLeave = function handleDragLeave(e) {
  e.preventDefault();
  if (e.currentTarget) e.currentTarget.classList.remove('drag-over');
};

// ---------------------------
// Page range parser
// ---------------------------
function parseRanges(text, totalPages) {
  const cleaned = String(text || '').replace(/\s+/g, '');
  if (!cleaned) return [];
  const out = new Set();
  for (const part of cleaned.split(',')) {
    if (!part) continue;
    if (part.includes('-')) {
      const [aRaw, bRaw] = part.split('-');
      const a = parseInt(aRaw, 10);
      const b = parseInt(bRaw, 10);
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
      const start = Math.max(1, Math.min(a, b));
      const end = Math.min(totalPages, Math.max(a, b));
      for (let i = start; i <= end; i++) out.add(i - 1);
    } else {
      const n = parseInt(part, 10);
      if (Number.isFinite(n) && n >= 1 && n <= totalPages) out.add(n - 1);
    }
  }
  return Array.from(out).sort((x, y) => x - y);
}

// ---------------------------
// MERGE
// ---------------------------
let mergeFiles = [];

window.handleMergeDrop = function handleMergeDrop(e) {
  e.preventDefault();
  if (e.currentTarget) e.currentTarget.classList.remove('drag-over');
  window.handleMergeFiles(e.dataTransfer?.files);
};

window.handleMergeFiles = function handleMergeFiles(fileList) {
  const files = Array.from(fileList || []).filter((f) => f && /\.pdf$/i.test(f.name));
  if (!files.length) return alert('Please select PDF files.');
  mergeFiles = mergeFiles.concat(files);
  renderMergeList();
};

window.removeMergeFile = function removeMergeFile(i) {
  mergeFiles.splice(i, 1);
  renderMergeList();
};

function renderMergeList() {
  const el = $('merge-file-list');
  if (!el) return;
  el.innerHTML = mergeFiles
    .map(
      (f, i) => `
      <div class="file-item">
        <span class="material-icons">description</span>
        <span>${escapeHtml(f.name)}</span>
        <button class="btn-icon" type="button" onclick="removeMergeFile(${i})" aria-label="Remove">
          <span class="material-icons">close</span>
        </button>
      </div>
    `
    )
    .join('');
}

window.mergePDFs = async function mergePDFs() {
  if (!PDFDocument) return alert('PDF library failed to load.');
  if (mergeFiles.length < 2) return alert('Please add at least 2 PDFs to merge.');

  try {
    const out = await PDFDocument.create();
    for (const file of mergeFiles) {
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes);
      const pages = await out.copyPages(src, src.getPageIndices());
      pages.forEach((p) => out.addPage(p));
    }
    downloadPdfBytes(await out.save(), 'merged.pdf');
  } catch (err) {
    console.error(err);
    alert('Merge failed. Try another PDF.');
  }
};

// ---------------------------
// SPLIT (Ranges or Every X)
// ---------------------------
let splitFile = null;

window.handleSplitDrop = function handleSplitDrop(e) {
  e.preventDefault();
  if (e.currentTarget) e.currentTarget.classList.remove('drag-over');
  const file = Array.from(e.dataTransfer?.files || []).find((f) => f && /\.pdf$/i.test(f.name));
  if (file) window.handleSplitFile(file);
};

window.handleSplitFile = function handleSplitFile(file) {
  if (!file || !/\.pdf$/i.test(file.name)) return alert('Please upload a PDF.');
  splitFile = file;
  const list = $('split-file-list');
  if (list) list.innerHTML = fileItemHTML(file.name);
};

window.splitPDF = async function splitPDF() {
  if (!PDFDocument) return alert('PDF library failed to load.');
  if (!hasZip) return alert('ZIP library failed to load.');
  if (!splitFile) return alert('Please upload a PDF first.');

  const rangesText = $('split-ranges')?.value || '';
  const every = parseInt($('split-every')?.value || '', 10);

  try {
    const bytes = await splitFile.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const total = pdf.getPageCount();

    let groups = [];
    if (rangesText.trim()) {
      const pages = parseRanges(rangesText, total);
      if (!pages.length) return alert('Enter valid ranges like 1-3,5');
      groups = [pages];
    } else if (Number.isFinite(every) && every > 0) {
      for (let start = 0; start < total; start += every) {
        const g = [];
        for (let i = start; i < Math.min(total, start + every); i++) g.push(i);
        groups.push(g);
      }
    } else {
      return alert('Enter page ranges OR “split every X pages”.');
    }

    const zip = new JSZip();
    let part = 1;
    for (const pages of groups) {
      const out = await PDFDocument.create();
      const copied = await out.copyPages(pdf, pages);
      copied.forEach((p) => out.addPage(p));
      zip.file(`split_part_${String(part).padStart(2, '0')}.pdf`, await out.save());
      part++;
    }

    downloadBlob(await zip.generateAsync({ type: 'blob' }), 'split_pdfs.zip');
  } catch (err) {
    console.error(err);
    alert('Split failed. Try another PDF.');
  }
};

// ---------------------------
// REORDER
// ---------------------------
let reorderFile = null;
let reorderSrcDoc = null;
let reorderState = []; // array of { pageNumber, selected }

async function getPdfJsDoc(bytes) {
  if (!hasPdfJs) throw new Error('pdf.js missing');
  // Always disable worker for local reliability
  return await pdfjsLib.getDocument({ data: bytes, disableWorker: true }).promise;
}

window.handleReorderDrop = function handleReorderDrop(e) {
  e.preventDefault();
  if (e.currentTarget) e.currentTarget.classList.remove('drag-over');
  const file = Array.from(e.dataTransfer?.files || []).find((f) => f && /\.pdf$/i.test(f.name));
  if (file) window.handleReorderFile(file);
};

window.handleReorderFile = async function handleReorderFile(file) {
  if (!PDFDocument) return alert('PDF library failed to load.');
  if (!file || !/\.pdf$/i.test(file.name)) return alert('Please upload a PDF.');

  reorderFile = file;
  const list = $('reorder-file-list');
  if (list) list.innerHTML = fileItemHTML(file.name);

  try {
    const bytes = await file.arrayBuffer();
    reorderSrcDoc = await PDFDocument.load(bytes);
    const total = reorderSrcDoc.getPageCount();
    reorderState = Array.from({ length: total }, (_, i) => ({ pageNumber: i + 1, selected: true }));
    show($('reorder-preview'), true);
    await renderThumbnails();
  } catch (err) {
    console.error(err);
    alert('Could not read this PDF. Try another one.');
  }
};

async function renderThumbnails() {
  const grid = $('page-thumbnails');
  if (!grid || !reorderFile || !hasPdfJs) return;
  grid.innerHTML = '';

  const bytes = await reorderFile.arrayBuffer();
  const doc = await getPdfJsDoc(bytes);

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 0.7 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;

    const state = reorderState.find((p) => p.pageNumber === i);
    const selected = state ? state.selected : true;

    const thumb = document.createElement('div');
    thumb.className = `page-thumbnail ${selected ? 'selected' : ''}`;
    thumb.dataset.page = String(i);
    thumb.innerHTML = `
      <div class="thumbnail-header">
        <span>Page ${i}</span>
        <span class="material-icons">${selected ? 'check_circle' : 'radio_button_unchecked'}</span>
      </div>
    `;
    thumb.appendChild(canvas);

    thumb.addEventListener('click', () => {
      const s = reorderState.find((p) => p.pageNumber === i);
      if (!s) return;
      s.selected = !s.selected;
      thumb.classList.toggle('selected', s.selected);
      const icon = thumb.querySelector('.thumbnail-header .material-icons');
      if (icon) icon.textContent = s.selected ? 'check_circle' : 'radio_button_unchecked';
    });

    grid.appendChild(thumb);
  }
}

window.selectAllPages = async function selectAllPages() {
  reorderState.forEach((p) => (p.selected = true));
  await renderThumbnails();
};

window.deselectAllPages = async function deselectAllPages() {
  reorderState.forEach((p) => (p.selected = false));
  await renderThumbnails();
};

window.reverseOrder = async function reverseOrder() {
  reorderState.reverse();
  await renderThumbnails();
};

window.unreverseOrder = async function unreverseOrder() {
  reorderState.sort((a, b) => a.pageNumber - b.pageNumber);
  await renderThumbnails();
};

window.applyReorder = async function applyReorder() {
  if (!PDFDocument) return alert('PDF library failed to load.');
  if (!reorderSrcDoc) return alert('Upload a PDF first.');

  const indices = reorderState.filter((p) => p.selected).map((p) => p.pageNumber - 1);
  if (!indices.length) return alert('Select at least one page.');

  try {
    const out = await PDFDocument.create();
    const pages = await out.copyPages(reorderSrcDoc, indices);
    pages.forEach((p) => out.addPage(p));
    downloadPdfBytes(await out.save(), 'reordered.pdf');
  } catch (err) {
    console.error(err);
    alert('Reorder failed.');
  }
};

// ---------------------------
// COMPRESS
// ---------------------------
let compressFile = null;

window.handleCompressDrop = function handleCompressDrop(e) {
  e.preventDefault();
  if (e.currentTarget) e.currentTarget.classList.remove('drag-over');
  const file = Array.from(e.dataTransfer?.files || []).find((f) => f && /\.pdf$/i.test(f.name));
  if (file) window.handleCompressFile(file);
};

window.handleCompressFile = function handleCompressFile(file) {
  if (!file || !/\.pdf$/i.test(file.name)) return alert('Please upload a PDF.');
  compressFile = file;
  const list = $('compress-file-list');
  if (list) list.innerHTML = fileItemHTML(`${file.name} (${humanSize(file.size)})`);
};

window.compressPDF = async function compressPDF() {
  if (!PDFDocument) return alert('PDF library failed to load.');
  if (!compressFile) return alert('Upload a PDF first.');
  try {
    const bytes = await compressFile.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    downloadPdfBytes(await pdf.save({ useObjectStreams: true }), 'compressed.pdf');
  } catch (err) {
    console.error(err);
    alert('Compress failed.');
  }
};

// ---------------------------
// PDF → IMAGES
// ---------------------------
let pdfToImagesFile = null;

window.handlePdfToImagesDrop = function handlePdfToImagesDrop(e) {
  e.preventDefault();
  if (e.currentTarget) e.currentTarget.classList.remove('drag-over');
  const file = Array.from(e.dataTransfer?.files || []).find((f) => f && /\.pdf$/i.test(f.name));
  if (file) window.handlePdfToImagesFile(file);
};

window.handlePdfToImagesFile = function handlePdfToImagesFile(file) {
  if (!file || !/\.pdf$/i.test(file.name)) return alert('Please upload a PDF.');
  pdfToImagesFile = file;
  const list = $('pdf-to-images-file-list');
  if (list) list.innerHTML = fileItemHTML(file.name);
};

window.pdfToImages = async function pdfToImages() {
  if (!hasPdfJs) return alert('pdf.js failed to load.');
  if (!hasZip) return alert('ZIP library failed to load.');
  if (!pdfToImagesFile) return alert('Upload a PDF first.');

  const format = ($('pdf-to-images-format')?.value || 'png').toLowerCase();
  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const ext = format === 'jpeg' ? 'jpg' : 'png';

  try {
    const bytes = await pdfToImagesFile.arrayBuffer();
    const doc = await getPdfJsDoc(bytes);
    const zip = new JSZip();

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale: 1.6 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
      const blob = await new Promise((res) => canvas.toBlob(res, mime, 0.92));
      zip.file(`page_${String(i).padStart(3, '0')}.${ext}`, await blob.arrayBuffer());
    }

    downloadBlob(await zip.generateAsync({ type: 'blob' }), `pdf_images_${ext}.zip`);
  } catch (err) {
    console.error(err);
    alert('PDF → Images failed.');
  }
};

// ---------------------------
// PROTECT (Light watermark)
// ---------------------------
let protectFile = null;

window.handleProtectDrop = function handleProtectDrop(e) {
  e.preventDefault();
  if (e.currentTarget) e.currentTarget.classList.remove('drag-over');
  const file = Array.from(e.dataTransfer?.files || []).find((f) => f && /\.pdf$/i.test(f.name));
  if (file) window.handleProtectFile(file);
};

window.handleProtectFile = function handleProtectFile(file) {
  if (!file || !/\.pdf$/i.test(file.name)) return alert('Please upload a PDF.');
  protectFile = file;
  const list = $('protect-file-list');
  if (list) list.innerHTML = fileItemHTML(file.name);
};

window.protectPDF = async function protectPDF() {
  if (!PDFDocument) return alert('PDF library failed to load.');
  if (!protectFile) return alert('Upload a PDF first.');

  const pw = ($('protect-password')?.value || '').trim();
  if (!pw) return alert('Enter a password.');

  try {
    const bytes = await protectFile.arrayBuffer();
    const src = await PDFDocument.load(bytes);
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => {
      out.addPage(p);
      const { height } = p.getSize();
      p.drawText('PROTECTED COPY', { x: 18, y: height - 28, size: 12, opacity: 0.35 });
      p.drawText(`Password hint: ${pw}`, { x: 18, y: height - 44, size: 9, opacity: 0.35 });
    });
    downloadPdfBytes(await out.save(), 'protected_copy.pdf');
  } catch (err) {
    console.error(err);
    alert('Protect PDF failed.');
  }
};

// ---------------------------
// ROTATE / EXTRACT / DELETE / IMAGES→PDF
// ---------------------------
let rotateFile = null;
window.handleRotateDrop = function handleRotateDrop(e) {
  e.preventDefault();
  if (e.currentTarget) e.currentTarget.classList.remove('drag-over');
  const file = Array.from(e.dataTransfer?.files || []).find((f) => f && /\.pdf$/i.test(f.name));
  if (file) window.handleRotateFile(file);
};
window.handleRotateFile = function handleRotateFile(file) {
  if (!file || !/\.pdf$/i.test(file.name)) return alert('Please upload a PDF.');
  rotateFile = file;
  const list = $('rotate-file-list');
  if (list) list.innerHTML = fileItemHTML(file.name);
};
window.rotatePages = async function rotatePages() {
  if (!PDFDocument) return alert('PDF library failed to load.');
  if (!rotateFile) return alert('Upload a PDF first.');
  const deg = parseInt($('rotate-deg')?.value || '90', 10);
  try {
    const bytes = await rotateFile.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    pdf.getPages().forEach((p) => {
      const cur = (p.getRotation()?.angle || 0) % 360;
      p.setRotation(degrees((cur + deg) % 360));
    });
    downloadPdfBytes(await pdf.save(), 'rotated.pdf');
  } catch (err) {
    console.error(err);
    alert('Rotate failed.');
  }
};

let extractFile = null;
window.handleExtractDrop = function handleExtractDrop(e) {
  e.preventDefault();
  if (e.currentTarget) e.currentTarget.classList.remove('drag-over');
  const file = Array.from(e.dataTransfer?.files || []).find((f) => f && /\.pdf$/i.test(f.name));
  if (file) window.handleExtractFile(file);
};
window.handleExtractFile = function handleExtractFile(file) {
  if (!file || !/\.pdf$/i.test(file.name)) return alert('Please upload a PDF.');
  extractFile = file;
  const list = $('extract-file-list');
  if (list) list.innerHTML = fileItemHTML(file.name);
};
window.extractPages = async function extractPages() {
  if (!PDFDocument) return alert('PDF library failed to load.');
  if (!extractFile) return alert('Upload a PDF first.');
  try {
    const bytes = await extractFile.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const pages = parseRanges($('extract-ranges')?.value || '', pdf.getPageCount());
    if (!pages.length) return alert('Enter page ranges like 1-2,5');
    const out = await PDFDocument.create();
    const copied = await out.copyPages(pdf, pages);
    copied.forEach((p) => out.addPage(p));
    downloadPdfBytes(await out.save(), 'extracted_pages.pdf');
  } catch (err) {
    console.error(err);
    alert('Extract failed.');
  }
};

let deleteFile = null;
window.handleDeleteDrop = function handleDeleteDrop(e) {
  e.preventDefault();
  if (e.currentTarget) e.currentTarget.classList.remove('drag-over');
  const file = Array.from(e.dataTransfer?.files || []).find((f) => f && /\.pdf$/i.test(f.name));
  if (file) window.handleDeleteFile(file);
};
window.handleDeleteFile = function handleDeleteFile(file) {
  if (!file || !/\.pdf$/i.test(file.name)) return alert('Please upload a PDF.');
  deleteFile = file;
  const list = $('delete-file-list');
  if (list) list.innerHTML = fileItemHTML(file.name);
};
window.deletePages = async function deletePages() {
  if (!PDFDocument) return alert('PDF library failed to load.');
  if (!deleteFile) return alert('Upload a PDF first.');
  try {
    const bytes = await deleteFile.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const total = pdf.getPageCount();
    const del = new Set(parseRanges($('delete-ranges')?.value || '', total));
    if (!del.size) return alert('Enter pages to delete like 1,3-4');
    const keep = [];
    for (let i = 0; i < total; i++) if (!del.has(i)) keep.push(i);
    if (!keep.length) return alert('You cannot delete all pages.');
    const out = await PDFDocument.create();
    const copied = await out.copyPages(pdf, keep);
    copied.forEach((p) => out.addPage(p));
    downloadPdfBytes(await out.save(), 'pages_deleted.pdf');
  } catch (err) {
    console.error(err);
    alert('Delete failed.');
  }
};

let img2pdfFiles = [];
window.handleImg2PdfDrop = function handleImg2PdfDrop(e) {
  e.preventDefault();
  if (e.currentTarget) e.currentTarget.classList.remove('drag-over');
  window.handleImg2PdfFiles(e.dataTransfer?.files);
};
window.handleImg2PdfFiles = function handleImg2PdfFiles(fileList) {
  img2pdfFiles = Array.from(fileList || []).filter((f) => f && f.type?.startsWith('image/'));
  if (!img2pdfFiles.length) return alert('Please select images.');
  const el = $('img2pdf-file-list');
  if (el) el.innerHTML = img2pdfFiles.map((f) => fileItemHTML(f.name, 'image')).join('');
};
window.imagesToPDF = async function imagesToPDF() {
  if (!PDFDocument) return alert('PDF library failed to load.');
  if (!img2pdfFiles.length) return alert('Select images first.');
  try {
    const pdf = await PDFDocument.create();
    for (const f of img2pdfFiles) {
      const bytes = await f.arrayBuffer();
      const isPng = (f.type || '').toLowerCase().includes('png');
      const img = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
      const { width, height } = img.scale(1);
      const page = pdf.addPage([width, height]);
      page.drawImage(img, { x: 0, y: 0, width, height });
    }
    downloadPdfBytes(await pdf.save(), 'images.pdf');
  } catch (err) {
    console.error(err);
    alert('Images → PDF failed.');
  }
};

// ---------------------------
// Init: keep everything collapsed by default
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tool-card').forEach((card) => {
    const content = card.querySelector('.tool-content');
    if (content) content.style.display = 'none';
    card.classList.remove('expanded');
  });
});

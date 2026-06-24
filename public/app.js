// DOM Element References
const filesListEl = document.getElementById('files-list');
const markdownEditorEl = document.getElementById('markdown-editor');
const activeFileTitleEl = document.getElementById('active-file-title');
const btnSaveFileEl = document.getElementById('btn-save-file');
const btnLayoutSlidesEl = document.getElementById('btn-layout-slides');
const btnLayoutDocEl = document.getElementById('btn-layout-doc');
const btnExportPdfEl = document.getElementById('btn-export-pdf');
const interactivePreviewEl = document.getElementById('interactive-preview');
const printViewportEl = document.getElementById('print-viewport');
const previewModeBadgeEl = document.getElementById('preview-mode-badge');
const themeSelectors = document.querySelectorAll('.theme-selector');

// Toolbar & Upload Elements
const toolbarButtons = document.querySelectorAll('.tb-btn');
const imageUploadInput = document.getElementById('image-upload-input');
const editorDropZone = document.getElementById('editor-drop-zone');
const statsWordsEl = document.getElementById('editor-stats-words');
const statsCharsEl = document.getElementById('editor-stats-chars');
const statusInfoEl = document.getElementById('editor-status-info');

// Advanced Toggles Elements
const chkCombineFilesEl = document.getElementById('chk-combine-files');
const chkAutoTocEl = document.getElementById('chk-auto-toc');

// Presenter Mode Elements (New)
const btnPresentEl = document.getElementById('btn-present');

// Application State
let files = [];
let activeFile = null;
let currentContent = '';
let currentLayout = 'slides'; // 'slides' or 'doc'
let currentTheme = 'midnight-tech';

let isCombinedMode = false;
let isAutoTOCEnabled = false;
let lastSelectedSingleFile = null;

// Fullscreen Presenter Mode State (New)
let isFullscreenPresenter = false;
let activeFullscreenSlideIndex = 0;
let totalFullscreenSlidesCount = 0;

// API Endpoints
const API_BASE = '/api';

// Initialize App
async function init() {
  setupEventListeners();
  setupToolbarListeners();
  setupDragAndDrop();
  setupAdvancedListeners();
  setupPresenterMode();
  await fetchFiles();
  
  // Select first file if available
  if (files.length > 0) {
    await selectFile(files[0].name);
  }
}

// Fetch lists of markdown files
async function fetchFiles() {
  try {
    const res = await fetch(`${API_BASE}/files`);
    if (!res.ok) throw new Error('Không thể tải danh sách file');
    files = await res.json();
    renderFilesList();
  } catch (err) {
    console.error(err);
    filesListEl.innerHTML = `<li class="loading-item error-text"><i class="fa-solid fa-triangle-exclamation"></i> Lỗi: ${err.message}</li>`;
  }
}

// Render files in sidebar
function renderFilesList() {
  if (files.length === 0) {
    filesListEl.innerHTML = '<li class="loading-item">Không tìm thấy file .md</li>';
    return;
  }
  
  filesListEl.innerHTML = files.map(file => `
    <li class="${!isCombinedMode && activeFile && activeFile.name === file.name ? 'active' : ''} ${isCombinedMode ? 'disabled-item' : ''}" data-name="${file.name}">
      <i class="fa-regular fa-file-lines"></i>
      <span>${file.name}</span>
    </li>
  `).join('');
  
  if (isCombinedMode) return;
  
  // Re-attach listeners
  filesListEl.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      const fileName = li.getAttribute('data-name');
      selectFile(fileName);
    });
  });
}

// Select and fetch a file
async function selectFile(name) {
  try {
    const res = await fetch(`${API_BASE}/files/${name}`);
    if (!res.ok) throw new Error('Không thể đọc nội dung file');
    activeFile = await res.json();
    currentContent = activeFile.content;
    lastSelectedSingleFile = name;
    
    // Update active class in sidebar
    renderFilesList();
    
    // Update UI state
    activeFileTitleEl.textContent = activeFile.name;
    markdownEditorEl.value = currentContent;
    markdownEditorEl.disabled = false;
    btnSaveFileEl.disabled = true;
    
    // Enable Toolbar & Presenter button
    toolbarButtons.forEach(btn => btn.disabled = false);
    btnPresentEl.disabled = false;
    
    // Update Stats and Render Live Preview
    updateStats();
    renderPreview();
    updateStatus('Sẵn sàng', 'success');
  } catch (err) {
    alert(`Lỗi khi tải file: ${err.message}`);
  }
}

// Save active file changes
async function saveFile() {
  if (!activeFile) return;
  
  btnSaveFileEl.disabled = true;
  updateStatus('Đang lưu file...', 'saving');
  
  try {
    const res = await fetch(`${API_BASE}/files/${activeFile.name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: currentContent })
    });
    
    if (!res.ok) throw new Error('Không thể lưu file');
    
    updateStatus('Đã lưu thành công', 'success');
    setTimeout(() => {
      updateStatus('Sẵn sàng', 'success');
    }, 2000);
    
    if (activeFile.name === 'combined_master.md') {
      await fetchFiles();
    }
  } catch (err) {
    alert(`Lỗi khi lưu file: ${err.message}`);
    updateStatus('Lỗi khi lưu file', 'error');
    btnSaveFileEl.disabled = false;
  }
}

// Update Status Bar info
function updateStatus(message, type = 'default') {
  let icon = '<i class="fa-solid fa-circle-check"></i>';
  statusInfoEl.className = '';
  
  if (type === 'saving') {
    icon = '<i class="fa-solid fa-spinner fa-spin"></i>';
    statusInfoEl.classList.add('saving');
  } else if (type === 'error') {
    icon = '<i class="fa-solid fa-circle-exclamation"></i>';
    statusInfoEl.classList.add('error-text');
  } else if (type === 'success') {
    statusInfoEl.classList.add('success-text');
  }
  
  statusInfoEl.innerHTML = `${icon} ${message}`;
}

// Update Word and Char stats
function updateStats() {
  const text = markdownEditorEl.value || '';
  const charCount = text.length;
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  
  statsWordsEl.textContent = `Từ: ${wordCount}`;
  statsCharsEl.textContent = `Kí tự: ${charCount}`;
}

// Markdown to Slide Converter Engine
function splitMarkdownIntoSlides(markdown) {
  if (markdown.match(/\r?\n---\r?\n/)) {
    return markdown.split(/\r?\n---\r?\n/).map(s => s.trim()).filter(Boolean);
  }
  
  const lines = markdown.split(/\r?\n/);
  const slides = [];
  let currentSlideLines = [];
  
  for (let line of lines) {
    if (line.startsWith('## ') || line.startsWith('##\t') || line === '##') {
      if (currentSlideLines.length > 0) {
        slides.push(currentSlideLines.join('\n').trim());
      }
      currentSlideLines = [line];
    } else {
      currentSlideLines.push(line);
    }
  }
  
  if (currentSlideLines.length > 0) {
    slides.push(currentSlideLines.join('\n').trim());
  }
  
  return slides.filter(Boolean);
}

// Helper to extract clean titles for slides
function extractSlideTitle(slideMd, index) {
  const lines = slideMd.split(/\r?\n/);
  for (let line of lines) {
    if (line.startsWith('## ')) {
      return line.substring(3).trim();
    } else if (line.startsWith('# ')) {
      return line.substring(2).trim();
    }
  }
  return `Phần thuyết trình ${index + 1}`;
}

// Process parsed slide HTML to auto-split large lists into columns (New)
function processSlideListLayout(slideHtml) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = slideHtml;
  
  // Find all bullet/number lists
  tempDiv.querySelectorAll('ul, ol').forEach(list => {
    // If list has 4 or more list items, display in grid column layout
    if (list.querySelectorAll('li').length >= 4) {
      list.classList.add('split-list');
    }
  });
  
  return tempDiv.innerHTML;
}

// Render Markdown contents depending on layout selected
function renderPreview() {
  if (!currentContent) {
    interactivePreviewEl.innerHTML = '<div class="loading-item">Không có nội dung hiển thị</div>';
    printViewportEl.innerHTML = '';
    return;
  }
  
  if (currentLayout === 'slides') {
    // Hide Document layout classes
    btnPresentEl.style.display = 'inline-flex';
    
    let slideMarkdowns = splitMarkdownIntoSlides(currentContent);
    let totalSlides = slideMarkdowns.length;
    
    // Inject Agenda Slide (Auto TOC)
    let agendaSlideHtml = '';
    if (isAutoTOCEnabled && totalSlides > 1) {
      const slideTitles = slideMarkdowns.map((slideMd, idx) => extractSlideTitle(slideMd, idx));
      
      agendaSlideHtml += `
        <div class="slide agenda-slide">
          <span class="slide-brand-logo">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Markdown2PDF
          </span>
          <h2 class="agenda-title"><i class="fa-solid fa-list-ol"></i> Mục lục chương trình</h2>
          <div class="agenda-grid">
      `;
      slideTitles.forEach((title, idx) => {
        agendaSlideHtml += `
          <div class="agenda-item">
            <span class="agenda-number">${idx + 1}</span>
            <span>${title}</span>
          </div>
        `;
      });
      agendaSlideHtml += `
          </div>
          <span class="slide-footer-marker">Mục lục</span>
        </div>
      `;
      
      totalSlides += 1;
    }
    
    let htmlContent = '<div class="slides-container">';
    
    slideMarkdowns.forEach((slideMd, index) => {
      const parsedHtml = marked.parse(slideMd);
      const processedHtml = processSlideListLayout(parsedHtml);
      const isTitleSlide = index === 0 && !slideMd.startsWith('##');
      const slideClass = isTitleSlide ? 'slide title-slide' : 'slide';
      
      // Calculate current slide page number (adds 1 to slide index if Auto TOC slide is injected at index 1)
      const displayPageNum = index + 1 + (isAutoTOCEnabled && index > 0 ? 1 : 0);
      
      htmlContent += `
        <div class="${slideClass}">
          <span class="slide-brand-logo">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Markdown2PDF
          </span>
          <div class="rendered-markdown">
            ${processedHtml}
          </div>
          <span class="slide-footer-marker">Trang ${displayPageNum} / ${totalSlides}</span>
        </div>
      `;
      
      // Inject Agenda Slide as Slide 2 (index 1)
      if (isAutoTOCEnabled && index === 0) {
        htmlContent += agendaSlideHtml;
      }
    });
    
    htmlContent += '</div>';
    
    interactivePreviewEl.innerHTML = htmlContent;
    printViewportEl.innerHTML = htmlContent;
    previewModeBadgeEl.textContent = `Slide Deck (${totalSlides} trang)`;
    
    // Sync presenter mode count
    totalFullscreenSlidesCount = totalSlides;
    
  } else {
    // Document layout mode - Custom cover page layout + page numbering footer (New)
    btnPresentEl.style.display = 'none'; // Hide presentation option in doc mode
    
    let parsedHtml = marked.parse(currentContent);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = parsedHtml;
    
    // 1. Cover Page Generation
    const firstH1 = tempDiv.querySelector('h1');
    let coverPageHtml = '';
    
    if (firstH1) {
      const title = firstH1.textContent;
      
      // Extract paragraphs/meta details preceding the first H2
      let sibling = firstH1.nextElementSibling;
      const metaStrings = [];
      
      while (sibling && !['H1', 'H2', 'H3'].includes(sibling.tagName)) {
        if (sibling.tagName === 'P') {
          metaStrings.push(sibling.outerHTML);
        }
        sibling = sibling.nextElementSibling;
      }
      
      coverPageHtml = `
        <div class="doc-cover-page">
          <h1>${title}</h1>
          <div class="doc-cover-subtitle">Tài liệu giới thiệu giải pháp & Sales Kit</div>
          <div class="doc-cover-meta">
            ${metaStrings.join('') || '<span>Đơn vị phát hành: <strong>Markdown2PDF Kit</strong></span>'}
            <span>Ngày xuất bản: <strong>${new Date().toLocaleDateString('vi-VN')}</strong></span>
          </div>
        </div>
      `;
      
      // Remove these elements from original DOM so they don't replicate in sections
      firstH1.remove();
      tempDiv.querySelectorAll('p').forEach(p => {
        let isBeforeH2 = true;
        let sib = p;
        while (sib) {
          if (sib.tagName === 'H2' || sib.tagName === 'H1') {
            isBeforeH2 = false;
            break;
          }
          sib = sib.previousElementSibling;
        }
        if (isBeforeH2 && p.parentNode === tempDiv) {
          p.remove();
        }
      });
    }
    
    // 2. Segment document elements into pages divided by H2
    const children = Array.from(tempDiv.children);
    const pages = [];
    let currentPageList = [];
    
    children.forEach((child) => {
      if (child.tagName === 'H2') {
        if (currentPageList.length > 0) {
          pages.push(currentPageList);
        }
        currentPageList = [child];
      } else {
        currentPageList.push(child);
      }
    });
    if (currentPageList.length > 0) {
      pages.push(currentPageList);
    }
    
    // 3. Table of Contents (TOC) page calculation
    let tocPageHtml = '';
    if (isAutoTOCEnabled && pages.length > 0) {
      const sectionTitles = [];
      pages.forEach((pageEls) => {
        const h2 = pageEls.find(el => el.tagName === 'H2');
        if (h2) {
          sectionTitles.push(h2.textContent);
        }
      });
      
      tocPageHtml += `
        <div class="doc-section-page">
          <div class="table-of-contents">
            <h3><i class="fa-solid fa-list-ol"></i> Mục lục tài liệu</h3>
            <ul class="toc-list">
      `;
      sectionTitles.forEach((title, idx) => {
        // TOC is Page 2, so first H2 page is Page 3
        const targetPageNum = idx + 3;
        tocPageHtml += `
          <li class="toc-item toc-item-h2">
            <a href="#section-${idx}" class="toc-link">
              <span class="toc-title">${title}</span>
              <span class="toc-dots"></span>
              <span class="toc-page">Trang ${targetPageNum}</span>
            </a>
          </li>
        `;
      });
      tocPageHtml += `
            </ul>
          </div>
          <div class="doc-page-footer">
            <span class="doc-page-footer-title">Markdown2PDF</span>
            <span>Trang 2</span>
          </div>
        </div>
      `;
    }
    
    // 4. Assemble the pages with headers & footers
    let finalDocHtml = coverPageHtml + tocPageHtml;
    
    pages.forEach((pageEls, index) => {
      // Inject index as H2 ID for anchors
      const h2 = pageEls.find(el => el.tagName === 'H2');
      if (h2) {
        h2.id = `section-${index}`;
      }
      
      const elementsHtml = pageEls.map(el => el.outerHTML).join('');
      // Calculate dynamic page number offset
      const pageNum = index + 2 + (isAutoTOCEnabled ? 1 : 0);
      
      finalDocHtml += `
        <div class="doc-section-page">
          <div class="rendered-markdown">
            ${elementsHtml}
          </div>
          <div class="doc-page-footer">
            <span class="doc-page-footer-title">Markdown2PDF Kit</span>
            <span>Trang ${pageNum}</span>
          </div>
        </div>
      `;
    });
    
    interactivePreviewEl.innerHTML = `
      <div class="document-mode">
        ${finalDocHtml}
      </div>
    `;
    printViewportEl.innerHTML = finalDocHtml;
    previewModeBadgeEl.textContent = `Sales Proposal (A4 Portrait)`;
  }
}

// Load and combine all Markdown files in the directory
async function loadAndCombineFiles() {
  updateStatus('Đang ghép các file...', 'saving');
  try {
    const sortedFiles = [...files]
      .filter(f => f.name !== 'combined_master.md')
      .sort((a, b) => a.name.localeCompare(b.name));
      
    if (sortedFiles.length === 0) {
      throw new Error('Không có file nào để ghép.');
    }
    
    const contents = [];
    for (let file of sortedFiles) {
      const res = await fetch(`${API_BASE}/files/${file.name}`);
      if (res.ok) {
        const data = await res.json();
        contents.push(data.content.trim());
      }
    }
    
    const combinedContent = contents.join('\n\n---\n\n');
    
    activeFile = {
      name: 'combined_master.md',
      content: combinedContent
    };
    currentContent = combinedContent;
    
    activeFileTitleEl.textContent = '[Tổng Hợp] combined_master.md';
    markdownEditorEl.value = currentContent;
    markdownEditorEl.disabled = false;
    btnSaveFileEl.disabled = false;
    
    toolbarButtons.forEach(btn => btn.disabled = false);
    btnPresentEl.disabled = false;
    
    renderFilesList();
    updateStats();
    renderPreview();
    updateStatus('Ghép file hoàn tất', 'success');
    setTimeout(() => updateStatus('Sẵn sàng', 'success'), 2000);
  } catch (err) {
    alert(`Lỗi ghép file: ${err.message}`);
    updateStatus('Lỗi ghép file', 'error');
    chkCombineFilesEl.checked = false;
    isCombinedMode = false;
    renderFilesList();
  }
}

// Insert Text Formatting at cursor position
function insertTextAtCursor(before, after = '') {
  const textarea = markdownEditorEl;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selectedText = text.substring(start, end);
  const replacement = before + selectedText + after;
  
  textarea.value = text.substring(0, start) + replacement + text.substring(end);
  
  textarea.selectionStart = start + before.length;
  textarea.selectionEnd = start + before.length + selectedText.length;
  textarea.focus();
  
  currentContent = textarea.value;
  btnSaveFileEl.disabled = false;
  updateStats();
  renderPreview();
}

// Handle Image Upload Action
async function handleImageUpload(file) {
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    alert('Vui lòng chỉ tải lên tệp tin định dạng ảnh!');
    return;
  }
  
  updateStatus('Đang tải ảnh lên...', 'saving');
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Lỗi tải ảnh lên server');
    }
    
    const data = await res.json();
    const altText = file.name.split('.')[0] || 'Image';
    insertTextAtCursor(`![${altText}](${data.url})`);
    
    updateStatus('Tải ảnh thành công!', 'success');
    setTimeout(() => {
      updateStatus('Sẵn sàng', 'success');
    }, 2000);
  } catch (err) {
    alert(`Lỗi tải ảnh: ${err.message}`);
    updateStatus('Tải ảnh thất bại', 'error');
  }
}

// Setup Toolbar button clicks
function setupToolbarListeners() {
  document.querySelectorAll('.editor-toolbar .tb-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (markdownEditorEl.disabled) return;
      
      const action = btn.getAttribute('data-action');
      
      switch (action) {
        case 'h2':
          insertTextAtCursor('## ', '');
          break;
        case 'h3':
          insertTextAtCursor('### ', '');
          break;
        case 'bold':
          insertTextAtCursor('**', '**');
          break;
        case 'italic':
          insertTextAtCursor('*', '*');
          break;
        case 'quote':
          insertTextAtCursor('> ', '');
          break;
        case 'ul':
          insertTextAtCursor('- ', '');
          break;
        case 'ol':
          insertTextAtCursor('1. ', '');
          break;
        case 'table':
          const tableTemplate = `\n| Nhóm | Đặc điểm | Chi tiết |\n|---|---|---|\n| Cột 1 | Nội dung 1 | Chi tiết 1 |\n| Cột 2 | Nội dung 2 | Chi tiết 2 |\n`;
          insertTextAtCursor(tableTemplate, '');
          break;
        case 'hr':
          insertTextAtCursor('\n---\n', '');
          break;
        case 'link':
          insertTextAtCursor('[Mô tả liên kết](', ')');
          break;
        case 'image':
          imageUploadInput.click();
          break;
      }
    });
  });
  
  imageUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
      imageUploadInput.value = '';
    }
  });
}

// Setup Drag & Drop File drop zone inside editor
function setupDragAndDrop() {
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    editorDropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });
  
  ['dragenter', 'dragover'].forEach(eventName => {
    editorDropZone.addEventListener(eventName, () => {
      if (!markdownEditorEl.disabled) {
        editorDropZone.classList.add('drag-over');
      }
    }, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    editorDropZone.addEventListener(eventName, () => {
      editorDropZone.classList.remove('drag-over');
    }, false);
  });
  
  editorDropZone.addEventListener('drop', (e) => {
    if (markdownEditorEl.disabled) return;
    
    const dt = e.dataTransfer;
    const file = dt.files[0];
    
    if (file) {
      handleImageUpload(file);
    }
  }, false);
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
}

// Advanced switches click listeners
function setupAdvancedListeners() {
  chkCombineFilesEl.addEventListener('change', async (e) => {
    isCombinedMode = e.target.checked;
    
    if (isCombinedMode) {
      await loadAndCombineFiles();
    } else {
      if (lastSelectedSingleFile && lastSelectedSingleFile !== 'combined_master.md') {
        await selectFile(lastSelectedSingleFile);
      } else if (files.length > 0) {
        const first = files.find(f => f.name !== 'combined_master.md') || files[0];
        await selectFile(first.name);
      }
    }
  });
  
  chkAutoTocEl.addEventListener('change', (e) => {
    isAutoTOCEnabled = e.target.checked;
    renderPreview();
  });
}

// Fullscreen Presenter Mode Engine (New)
function setupPresenterMode() {
  btnPresentEl.addEventListener('click', () => {
    if (currentLayout !== 'slides') return;
    
    if (interactivePreviewEl.requestFullscreen) {
      interactivePreviewEl.requestFullscreen();
    } else if (interactivePreviewEl.webkitRequestFullscreen) {
      interactivePreviewEl.webkitRequestFullscreen();
    }
  });
  
  // Fullscreen change events detection
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
}

function handleFullscreenChange() {
  const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
  
  if (fullscreenElement === interactivePreviewEl) {
    isFullscreenPresenter = true;
    activeFullscreenSlideIndex = 0;
    
    // Toggle active slide class
    updateFullscreenSlideView();
  } else {
    isFullscreenPresenter = false;
    
    // Clear fullscreen slide classes
    const slides = interactivePreviewEl.querySelectorAll('.slide');
    slides.forEach(slide => slide.classList.remove('active-fullscreen-slide'));
  }
}

function updateFullscreenSlideView() {
  const slides = interactivePreviewEl.querySelectorAll('.slide');
  slides.forEach((slide, idx) => {
    if (idx === activeFullscreenSlideIndex) {
      slide.classList.add('active-fullscreen-slide');
    } else {
      slide.classList.remove('active-fullscreen-slide');
    }
  });
}

function navigatePresenterSlide(direction) {
  if (!isFullscreenPresenter) return;
  
  if (direction === 'next' && activeFullscreenSlideIndex < totalFullscreenSlidesCount - 1) {
    activeFullscreenSlideIndex++;
    updateFullscreenSlideView();
  } else if (direction === 'prev' && activeFullscreenSlideIndex > 0) {
    activeFullscreenSlideIndex--;
    updateFullscreenSlideView();
  }
}

// Set up UI Theme class
function changeTheme(themeName) {
  document.body.className = '';
  document.body.classList.add(`theme-${themeName}`);
  updatePrintLayoutClass();
  currentTheme = themeName;
  
  themeSelectors.forEach(btn => {
    if (btn.getAttribute('data-theme') === themeName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function updatePrintLayoutClass() {
  document.body.classList.remove('layout-slides-active', 'layout-doc-active');
  if (currentLayout === 'slides') {
    document.body.classList.add('layout-slides-active');
  } else {
    document.body.classList.add('layout-doc-active');
  }
}

// Event Listeners setup
function setupEventListeners() {
  // Live Editor input synchronization
  markdownEditorEl.addEventListener('input', (e) => {
    currentContent = e.target.value;
    btnSaveFileEl.disabled = false;
    updateStats();
    renderPreview();
  });
  
  // Keyboard Navigation: Esc, Arrow keys, Space
  window.addEventListener('keydown', (e) => {
    // 1. Fullscreen presenter arrow key sliding
    if (isFullscreenPresenter) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        navigatePresenterSlide('next');
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        navigatePresenterSlide('prev');
      }
      return; // Skip normal shortcuts while presenting
    }
    
    // 2. Normal Editor Shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (!btnSaveFileEl.disabled && activeFile) {
        saveFile();
      }
    }
    
    if (document.activeElement === markdownEditorEl) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        insertTextAtCursor('**', '**');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        insertTextAtCursor('*', '*');
      }
    }
  });
  
  // Layout toggles
  btnLayoutSlidesEl.addEventListener('click', () => {
    currentLayout = 'slides';
    btnLayoutSlidesEl.classList.add('active');
    btnLayoutDocEl.classList.remove('active');
    updatePrintLayoutClass();
    renderPreview();
  });
  
  btnLayoutDocEl.addEventListener('click', () => {
    currentLayout = 'doc';
    btnLayoutDocEl.classList.add('active');
    btnLayoutSlidesEl.classList.remove('active');
    updatePrintLayoutClass();
    renderPreview();
  });
  
  // Theme selectors
  themeSelectors.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme');
      changeTheme(theme);
    });
  });
  
  // Export PDF Button
  btnExportPdfEl.addEventListener('click', () => {
    window.print();
  });
  
  // Initially disable elements before file selection
  toolbarButtons.forEach(btn => btn.disabled = true);
  btnPresentEl.disabled = true;
}

// Start application
document.addEventListener('DOMContentLoaded', init);
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  init();
}

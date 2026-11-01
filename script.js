/**
 * Lucas Daniel de Melo Borges - Personal Resume
 * Language switcher, dynamic age/experience calculation, & PDF export modal
 */

(function () {
  'use strict';

  // Elements
  const btnLangPt = document.getElementById('btn-lang-pt');
  const btnLangEn = document.getElementById('btn-lang-en');
  const contentPt = document.getElementById('content-pt');
  const contentEn = document.getElementById('content-en');
  const headerSubtitle = document.getElementById('header-subtitle');
  const btnOpenPdfModal = document.getElementById('btn-open-pdf-modal');
  const pdfModalBackdrop = document.getElementById('pdf-modal-backdrop');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnExportFull = document.getElementById('btn-export-full');
  const btnExportSimplified = document.getElementById('btn-export-simplified');

  const titles = {
    pt: 'Lucas Daniel de Melo Borges - Currículo',
    en: 'Lucas Daniel de Melo Borges - Resume'
  };

  /**
   * Calculate and update age and years of experience dynamically
   * Birth date: 20/10/1998
   * Experience start: August 2022 (01/08/2022)
   */
  function updateDynamicDates() {
    const today = new Date();

    // 1. Calculate Age (20/10/1998 - month is 0-indexed: 9 = October)
    const birthDate = new Date(1998, 9, 20);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // 2. Calculate Years of Experience from August 2022 (month 7 = August)
    const expStartDate = new Date(2022, 7, 1);
    let expYears = today.getFullYear() - expStartDate.getFullYear();
    const expMonthDiff = today.getMonth() - expStartDate.getMonth();
    if (expMonthDiff < 0 || (expMonthDiff === 0 && today.getDate() < expStartDate.getDate())) {
      expYears--;
    }
    expYears = Math.max(4, expYears);

    // Apply to DOM
    document.querySelectorAll('.profile-age').forEach(function (el) {
      el.textContent = age;
    });

    document.querySelectorAll('.exp-years').forEach(function (el) {
      el.textContent = expYears;
    });
  }

  /**
   * Set active language
   * @param {'pt' | 'en'} lang
   * @param {boolean} updateUrl
   */
  function setLanguage(lang, updateUrl = true) {
    const isEn = lang === 'en';
    const targetLang = isEn ? 'en' : 'pt';

    // Update HTML lang attribute
    document.documentElement.lang = isEn ? 'en' : 'pt-BR';

    // Update page title
    document.title = titles[targetLang];

    // Toggle button active states
    if (btnLangPt && btnLangEn) {
      btnLangPt.classList.toggle('active', !isEn);
      btnLangPt.setAttribute('aria-pressed', !isEn ? 'true' : 'false');
      btnLangEn.classList.toggle('active', isEn);
      btnLangEn.setAttribute('aria-pressed', isEn ? 'true' : 'false');
    }

    // Toggle content blocks
    if (contentPt && contentEn) {
      contentPt.classList.toggle('active', !isEn);
      contentEn.classList.toggle('active', isEn);
    }

    // Toggle header subtitle text
    if (headerSubtitle) {
      const ptSpan = headerSubtitle.querySelector('.text-pt');
      const enSpan = headerSubtitle.querySelector('.text-en');
      if (ptSpan) ptSpan.style.display = isEn ? 'none' : 'inline';
      if (enSpan) enSpan.style.display = isEn ? 'inline' : 'none';
    }

    // Store preference in localStorage
    try {
      localStorage.setItem('preferred_resume_lang', targetLang);
    } catch (e) {
      // Ignore
    }

    // Sync URL parameter (?lang=pt or ?lang=en)
    if (updateUrl && window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', targetLang);
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
  }

  /**
   * Determine initial language from URL, localStorage or browser language
   */
  function getInitialLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramLang = urlParams.get('lang');
    if (paramLang === 'en' || paramLang === 'pt') {
      return paramLang;
    }

    const hash = window.location.hash.toLowerCase();
    if (hash.includes('en')) return 'en';
    if (hash.includes('pt')) return 'pt';

    try {
      const stored = localStorage.getItem('preferred_resume_lang');
      if (stored === 'en' || stored === 'pt') return stored;
    } catch (e) {
      // Ignore
    }

    return 'pt';
  }

  // Language buttons event listeners
  if (btnLangPt) {
    btnLangPt.addEventListener('click', function () {
      setLanguage('pt');
    });
  }

  if (btnLangEn) {
    btnLangEn.addEventListener('click', function () {
      setLanguage('en');
    });
  }

  // ==========================================================================
  // Modal Management (Always in Portuguese)
  // ==========================================================================
  function openModal() {
    if (!pdfModalBackdrop) return;
    pdfModalBackdrop.classList.add('is-open');
    pdfModalBackdrop.removeAttribute('hidden');
    pdfModalBackdrop.style.display = 'flex';
    pdfModalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (btnExportSimplified) btnExportSimplified.focus();
  }

  function closeModal() {
    if (!pdfModalBackdrop) return;
    pdfModalBackdrop.classList.remove('is-open');
    pdfModalBackdrop.setAttribute('hidden', '');
    pdfModalBackdrop.style.display = 'none';
    pdfModalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (btnOpenPdfModal) btnOpenPdfModal.focus();
  }

  if (btnOpenPdfModal) {
    btnOpenPdfModal.addEventListener('click', openModal);
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', closeModal);
  }

  // Close modal when clicking on the backdrop
  if (pdfModalBackdrop) {
    pdfModalBackdrop.addEventListener('click', function (e) {
      if (e.target === pdfModalBackdrop) {
        closeModal();
      }
    });
  }

  // Keyboard navigation: Escape closes modal
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && pdfModalBackdrop && pdfModalBackdrop.classList.contains('is-open')) {
      closeModal();
    }
  });

  // ==========================================================================
  // PDF Export Handlers (Full vs Simplified)
  // ==========================================================================
  function triggerPrintExport(mode) {
    closeModal();

    const isEn = document.documentElement.lang.startsWith('en');
    const originalTitle = document.title;

    // Reset classes
    document.body.classList.remove('print-mode-full', 'print-mode-simplified');

    if (mode === 'simplified') {
      document.body.classList.add('print-mode-simplified');
      document.title = isEn ? 'Lucas_Daniel_Melo_Resume' : 'Lucas_Daniel_Melo_Curriculo';
    } else {
      document.body.classList.add('print-mode-full');
      document.title = isEn ? 'Lucas_Daniel_Melo_Resume' : 'Lucas_Daniel_Melo_Curriculo';
    }

    // Trigger browser print
    window.print();

    // Reset after print
    function cleanup() {
      document.body.classList.remove('print-mode-full', 'print-mode-simplified');
      document.title = originalTitle;
      window.removeEventListener('afterprint', cleanup);
    }

    window.addEventListener('afterprint', cleanup);

    // Fallback timeout in case afterprint does not fire
    setTimeout(cleanup, 2000);
  }

  if (btnExportFull) {
    btnExportFull.addEventListener('click', function () {
      triggerPrintExport('full');
    });
  }

  if (btnExportSimplified) {
    btnExportSimplified.addEventListener('click', function () {
      triggerPrintExport('simplified');
    });
  }

  // Initialize Language & Dynamic Calculations
  updateDynamicDates();
  setLanguage(getInitialLanguage(), false);
})();

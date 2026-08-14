// pdf-viewer.js
// Simple PDF modal viewer (vanilla JS)
document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('pdf-modal');
    const modalIframe = document.getElementById('pdf-modal-iframe');
    const closeBtn = document.getElementById('pdf-modal-close');
    let lastFocused = null;

    function openPdfViewer(pdfPath, title = '') {
        if (!modal || !modalIframe) return;
        lastFocused = document.activeElement;
        // Set iframe src (path should be already encoded)
        modalIframe.src = pdfPath;
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('active');
        // prevent background scroll
        document.documentElement.style.overflow = 'hidden';
        // focus close button for accessibility
        if (closeBtn) closeBtn.focus();
    }

    function closePdfViewer() {
        if (!modal || !modalIframe) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        // clear iframe to stop PDF loading
        modalIframe.src = '';
        document.documentElement.style.overflow = '';
        if (lastFocused) lastFocused.focus();
    }

    // Delegate click from any element with data-pdf attribute
    document.body.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-pdf]');
        if (!btn) return;
        e.preventDefault();
        const pdf = btn.getAttribute('data-pdf');
        if (pdf) openPdfViewer(pdf);
    });

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', function () { closePdfViewer(); });
    }

    // Close when clicking outside modal content
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closePdfViewer();
        });
    }

    // Close with Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const isActive = modal && modal.classList.contains('active');
            if (isActive) closePdfViewer();
        }
    });

    // Expose functions for debugging if needed
    window.openPdfViewer = openPdfViewer;
    window.closePdfViewer = closePdfViewer;
});

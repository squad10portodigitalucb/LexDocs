(function () {
    const modal = document.getElementById('gerenciadorModal');
    const modalContent = modal ? modal.querySelector('.upload-modal-content') : null;
    const modalTitle = document.getElementById('gerenciadorModalTitle');
    if (!modal || !modalContent || !modalTitle) return;

    const openModal = () => {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    };

    const setAppearanceFromCard = (card) => {
        const label = card.dataset.cardPopup || card.textContent.trim();
        modalTitle.textContent = label;
        modalContent.style.background = getComputedStyle(card).backgroundColor;
    };

    document.querySelectorAll('[data-card-popup]').forEach((card) => {
        card.addEventListener('click', () => {
            setAppearanceFromCard(card);
            openModal();
        });
    });

    modal.querySelectorAll('[data-close-modal]').forEach((el) => {
        el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
})();

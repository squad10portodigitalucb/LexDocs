(function () {
    const uploadBox = document.querySelector('.upload-box');
    const modal = document.getElementById('uploadModal');
    const modalContent = modal ? modal.querySelector('.upload-modal-content') : null;
    const modalTitle = document.getElementById('uploadModalTitle');
    if (!modal || !modalContent || !modalTitle) return;

    const setModalAppearanceForCard = (card) => {
        if (!card) return;
        const label = card.dataset.cardPopup || card.textContent.trim();
        modalTitle.textContent = label;

        if (card.classList.contains('financeiro')) {
            modalContent.style.background = 'var(--green-soft)';
        } else if (card.classList.contains('processos')) {
            modalContent.style.background = 'var(--blue-soft)';
        } else if (card.classList.contains('clientes')) {
            modalContent.style.background = 'var(--red-soft)';
        } else {
            modalContent.style.background = '#E7ECF0';
        }
    };

    const resetModalAppearance = () => {
        modalTitle.textContent = 'Upload';
        modalContent.style.background = '#E7ECF0';
        modal.classList.remove('folder-mode');
    };

    const openModal = () => {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        resetModalAppearance();
    };

    if (uploadBox) {
        uploadBox.addEventListener('click', () => {
            resetModalAppearance();
            openModal();
        });
    }

    document.querySelectorAll('[data-card-popup]').forEach((card) => {
        card.addEventListener('click', () => {
            setModalAppearanceForCard(card);
            modal.classList.add('folder-mode');
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

    const fileTagsContainer = modal.querySelector('#fileTags');

    const syncFileTag = (tagElement) => {
        if (!fileTagsContainer) return;
        if (modal.classList.contains('folder-mode')) return;

        const label = tagElement.textContent.trim();
        if (!label) return;

        const existing = Array.from(fileTagsContainer.children)
            .find((child) => child.textContent.trim() === label);

        if (tagElement.classList.contains('is-selected')) {
            if (!existing) {
                const clone = tagElement.cloneNode(true);
                clone.classList.remove('is-selected');
                fileTagsContainer.appendChild(clone);
            }
        } else if (existing) {
            fileTagsContainer.removeChild(existing);
        }
    };

    modal.querySelectorAll('.tag, .cliente-tag').forEach((tag) => {
        tag.addEventListener('click', (e) => {
            e.preventDefault();
            tag.classList.toggle('is-selected');
            syncFileTag(tag);
        });
    });
})();

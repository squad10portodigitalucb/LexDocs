(function () {
    // --- CONFIGURAÇÕES DA API ---
    const API_BASE_URL = 'https://api-ucb.bsb.br.saveincloud.net.br/doc_manager_api';
    
    // [IMPORTANTE]: Substitua os números abaixo pelos IDs reais das pastas no seu banco de dados
    const FOLDER_MAP = {
        'Financeiro': 3,
        'Processos': 4,
        'Clientes': 5
    };

    // --- SELEÇÃO DE ELEMENTOS DOM ---
    const uploadBox = document.querySelector('.upload-box');
    const modal = document.getElementById('uploadModal');
    const modalContent = modal ? modal.querySelector('.upload-modal-content') : null;
    const modalTitle = document.getElementById('uploadModalTitle');
    const tableBody = modal ? modal.querySelector('.upload-modal-table-body') : null; // Área onde os arquivos serão listados
    const fileTagsContainer = modal ? modal.querySelector('#fileTags') : null;

    if (!modal || !modalContent || !modalTitle) return;

    // --- FUNÇÕES DE API E RENDERIZAÇÃO (NOVAS) ---

    // Função para limpar e preencher a tabela
    const renderTable = (documents, isLoading = false, error = null) => {
        if (!tableBody) return;
        tableBody.innerHTML = ''; // Limpa tabela

        if (isLoading) {
            tableBody.innerHTML = '<div class="upload-modal-row"><div style="width:100%; text-align:center; padding: 20px;">Carregando arquivos...</div></div>';
            return;
        }

        if (error) {
            tableBody.innerHTML = `<div class="upload-modal-row"><div style="width:100%; text-align:center; padding: 20px; color: var(--red-soft);">Erro: ${error}</div></div>`;
            return;
        }

        if (!documents || documents.length === 0) {
            tableBody.innerHTML = '<div class="upload-modal-row"><div style="width:100%; text-align:center; padding: 20px;">Nenhum arquivo encontrado.</div></div>';
            return;
        }

        documents.forEach(doc => {
            const row = document.createElement('div');
            row.className = 'upload-modal-row file-row-upload';

            // Tratamento de dados (ajuste conforme o retorno real da sua API)
            const nome = doc.name || doc.filename || 'Sem nome';
            // Converte bytes para KB se existir, senão mostra traço
            const tamanho = doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : '--';
            const tipo = doc.type || 'Arquivo';

            row.innerHTML = `
                <div>${nome}</div>
                <div>${tamanho}</div>
                <div>${tipo}</div>
            `;
            tableBody.appendChild(row);
        });
    };

    // Função para buscar documentos na API
    const fetchDocuments = async (folderName) => {
        const folderId = FOLDER_MAP[folderName];

        if (!folderId) {
            console.error(`ID não configurado para: ${folderName}`);
            renderTable([], false, "Pasta não configurada no sistema");
            return;
        }

        renderTable([], true); // Mostra loading

        try {
            /*const token = localStorage.getItem('userToken');
            if (!token) {
                alert("Sessão expirada. Faça login novamente.");
                window.location.href = '/login.html'; // Ajuste para sua url de login
                return;
            }*/

            const response = await fetch(`${API_BASE_URL}/folders/${folderId}/documents`, {
                method: 'GET',
                headers: {
                    //'Authorization': `Bearer ${token}`, // Verifique se sua API usa Bearer ou outro header
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error(`Erro API: ${response.status}`);

            const data = await response.json();
            console.log(data);
            renderTable(data.documents || []); // Renderiza sucesso
            console.log("FIM");
        } catch (err) {
            console.error(err);
            renderTable([], false, "Falha ao conectar com o servidor");
        }
    };

    // --- FUNÇÕES DE UI (EXISTENTES) ---

    const setModalAppearanceForCard = (card) => {
        if (!card) return;
        const label = card.dataset.cardPopup || card.textContent.trim();
        modalTitle.textContent = label;

        if (card.classList.contains('financeiro')) {
            modalContent.style.background = 'var(--green-soft)'; // Ajuste as cores CSS se necessário
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
        
        // Quando reseta (modo upload), podemos limpar a tabela ou restaurar placeholders
        // Aqui optei por limpar para não mostrar dados antigos
        if(tableBody) tableBody.innerHTML = ''; 
    };

    const openModal = () => {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        // Garante que o CSS de display esteja correto para o modal abrir
        modal.style.display = 'flex'; 
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none'; // Esconde ao fechar
        resetModalAppearance();
    };

    // --- EVENT LISTENERS ---

    // Listener do botão de Upload (Abre modal vazio/padrão)
    if (uploadBox) {
        uploadBox.addEventListener('click', () => {
            resetModalAppearance();
            openModal();
            // Aqui você pode recriar os placeholders de upload se quiser
            if(tableBody) {
                 tableBody.innerHTML = `
                    <div class="upload-modal-row placeholder"></div>
                    <div class="upload-modal-row placeholder"></div>
                    <div class="upload-modal-row placeholder"></div>
                 `;
            }
        });
    }

    // Listener dos Cards (Financeiro, Processos, Clientes)
    document.querySelectorAll('[data-card-popup]').forEach((card) => {
        card.addEventListener('click', () => {
            // 1. Ajusta visual
            setModalAppearanceForCard(card);
            modal.classList.add('folder-mode');
            openModal();

            // 2. Chama a API
            const categoryName = card.dataset.cardPopup; // Ex: "Financeiro"
            fetchDocuments(categoryName);
        });
    });

    // Fechar Modal
    modal.querySelectorAll('[data-close-modal]').forEach((el) => {
        el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });

    // --- LÓGICA DE TAGS (Mantida do original) ---
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
class LoginAuth {
    constructor() {
        this.form = document.getElementById('formLoginBtn');
        this.btnLogin = document.querySelector('#btn-login button');
        
        // URL BASE da sua API (Retirada do seu link)
        this.baseUrl = 'https://api-ucb.bsb.br.saveincloud.net.br/doc_manager_api';
        
        // [ATENÇÃO]: Verifique no Swagger qual é o endpoint exato de login.
        // Geralmente é algo como '/auth/login', '/usuarios/login' ou '/token'.
        this.endpoint = '/login'; 

        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        } else {
            console.error("Formulário de login não encontrado!");
        }
    }

    async handleSubmit(event) {
        event.preventDefault(); // Impede o recarregamento da página
        
        // Captura os dados dos inputs (baseado no 'name' do HTML)
        const formData = new FormData(this.form);
        const usuarioInput = formData.get('usuario');
        const senhaInput = formData.get('senha');



        // Validação simples no front-end
        if (!usuarioInput || !senhaInput) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        this.setLoading(true); // Desabilita botão e muda texto

        try {
            await this.realizarLogin(usuarioInput, senhaInput);
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao conectar com o servidor. Tente novamente mais tarde.');
        } finally {
            this.setLoading(false); // Reabilita o botão
        }
    }

    async realizarLogin(usuario, senha) {
        // [ATENÇÃO]: Verifique no Swagger quais as chaves JSON que a API espera.
        // Estou assumindo que seja 'username' e 'password'. 
        // Se a API esperar 'email', troque 'username' por 'email' abaixo.
        const payload = {
            email: usuario, 
            password: senha
        };

        const response = await fetch(`${this.baseUrl}${this.endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const dados = await response.json();
            
            // Sucesso!
            // Geralmente a API retorna um Token. É boa prática salvá-lo.
            if (dados.token) {
                localStorage.setItem('userToken', dados.token);
            }
            
            // Redireciona para a página principal
            window.location.href = '/index.html';
        } else {
            // Tratamento de erro (ex: 401 Não Autorizado)
            if (response.status === 401 || response.status === 403) {
                alert('Usuário ou senha inválidos!');
            } else {
                alert(`Ocorreu um erro: ${response.statusText}`);
            }
        }
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.btnLogin.innerText = 'Entrando...';
            this.btnLogin.disabled = true;
            this.btnLogin.style.cursor = 'wait';
        } else {
            this.btnLogin.innerText = 'Entrar';
            this.btnLogin.disabled = false;
            this.btnLogin.style.cursor = 'pointer';
        }
    }
}

// Inicializa a classe quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new LoginAuth();
});
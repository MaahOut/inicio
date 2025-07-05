document.addEventListener('DOMContentLoaded', function() {
    // Array vazio que será preenchido com os produtos do JSON
    let produtos = [];
    
    // Carrinho de compras
    let carrinho = [];
    
    // Elementos da DOM
    const loginBtn = document.getElementById('login-btn');
    const carrinhoBtn = document.getElementById('carrinho-btn');
    const carrinhoCount = document.getElementById('carrinho-count');
    const loginModal = document.getElementById('login-modal');
    const cadastroModal = document.getElementById('cadastro-modal');
    const closeButtons = document.querySelectorAll('.close');
    const cadastroLink = document.getElementById('cadastro-link');
    const produtosAgricolasGrid = document.querySelector('#produtos-agricolas .produtos-grid');
    const produtosMaquinariosGrid = document.querySelector('#produtos-maquinarios .produtos-grid');
    
    // Função para carregar produtos do JSON
    async function carregarProdutos() {
        try {
            const response = await fetch('data/produtos.json');
            
            if (!response.ok) {
                throw new Error('Erro ao carregar os produtos');
            }
            
            const data = await response.json();
            produtos = data.produtos;
            renderizarProdutos();
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            // Exibe mensagem de erro para o usuário
            produtosAgricolasGrid.innerHTML = '<p class="erro-carregamento">Não foi possível carregar os produtos. Por favor, tente novamente mais tarde.</p>';
            produtosMaquinariosGrid.innerHTML = '<p class="erro-carregamento">Não foi possível carregar os produtos. Por favor, tente novamente mais tarde.</p>';
        }
    }
    
    // Função para renderizar os produtos na tela
    function renderizarProdutos() {
        // Limpa os grids antes de renderizar
        produtosAgricolasGrid.innerHTML = '';
        produtosMaquinariosGrid.innerHTML = '';
        
        // Verifica se há produtos para exibir
        if (produtos.length === 0) {
            produtosAgricolasGrid.innerHTML = '<p>Nenhum produto disponível no momento.</p>';
            produtosMaquinariosGrid.innerHTML = '<p>Nenhum produto disponível no momento.</p>';
            return;
        }
        
        // Filtra e renderiza produtos agrícolas
        const produtosAgricolas = produtos.filter(p => p.categoria === "agricolas");
        if (produtosAgricolas.length > 0) {
            produtosAgricolas.forEach(produto => {
                produtosAgricolasGrid.appendChild(criarCardProduto(produto));
            });
        } else {
            produtosAgricolasGrid.innerHTML = '<p>Nenhum produto agrícola disponível no momento.</p>';
        }
        
        // Filtra e renderiza produtos de maquinários
        const produtosMaquinarios = produtos.filter(p => p.categoria === "maquinarios");
        if (produtosMaquinarios.length > 0) {
            produtosMaquinarios.forEach(produto => {
                produtosMaquinariosGrid.appendChild(criarCardProduto(produto));
            });
        } else {
            produtosMaquinariosGrid.innerHTML = '<p>Nenhum maquinário disponível no momento.</p>';
        }
        
        // Adiciona eventos aos botões "Adicionar ao Carrinho"
        document.querySelectorAll('.adicionar-carrinho').forEach(btn => {
            btn.addEventListener('click', adicionarAoCarrinho);
        });
    }
    
    // Função auxiliar para criar um card de produto
    function criarCardProduto(produto) {
        const card = document.createElement('div');
        card.className = 'produto-card';
        
        card.innerHTML = `
            <div class="produto-imagem" style="background-image: url('${produto.imagem}')"></div>
            <div class="produto-info">
                <h3>${produto.nome}</h3>
                <p>${produto.descricao}</p>
                <div class="preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</div>
                <button class="btn btn-block adicionar-carrinho" 
                        data-id="${produto.id}" 
                        data-nome="${produto.nome}" 
                        data-preco="${produto.preco}">
                    Adicionar ao Carrinho
                </button>
            </div>
        `;
        
        return card;
    }
    
    // Função para adicionar produto ao carrinho
    function adicionarAoCarrinho(e) {
        const id = parseInt(e.target.dataset.id);
        const nome = e.target.dataset.nome;
        const preco = parseFloat(e.target.dataset.preco);
        
        const itemExistente = carrinho.find(item => item.id === id);
        
        if (itemExistente) {
            itemExistente.quantidade++;
        } else {
            carrinho.push({
                id,
                nome,
                preco,
                quantidade: 1
            });
        }
        
        atualizarCarrinho();
        
        // Feedback visual para o usuário
        e.target.textContent = '✔ Adicionado';
        e.target.style.backgroundColor = 'var(--secondary)';
        setTimeout(() => {
            e.target.textContent = 'Adicionar ao Carrinho';
            e.target.style.backgroundColor = 'var(--primary)';
        }, 1000);
    }
    
    // Função para atualizar o contador do carrinho
    function atualizarCarrinho() {
        const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
        carrinhoCount.textContent = totalItens;
        
        // Salva o carrinho no localStorage
        localStorage.setItem('carrinhoAgroMec', JSON.stringify(carrinho));
    }
    
    // Função para carregar o carrinho do localStorage
    function carregarCarrinho() {
        const carrinhoSalvo = localStorage.getItem('carrinhoAgroMec');
        if (carrinhoSalvo) {
            carrinho = JSON.parse(carrinhoSalvo);
            atualizarCarrinho();
        }
    }
    
    // Event Listeners
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.style.display = 'block';
    });
    
    carrinhoBtn.addEventListener('click', function(e) {
        e.preventDefault();
        // Implementação básica - pode ser melhorada com um modal de carrinho
        if (carrinho.length === 0) {
            alert('Seu carrinho está vazio');
        } else {
            const listaItens = carrinho.map(item => 
                `${item.nome} - ${item.quantidade}x R$ ${item.preco.toFixed(2)}`
            ).join('\n');
            alert(`Itens no carrinho:\n${listaItens}`);
        }
    });
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            loginModal.style.display = 'none';
            cadastroModal.style.display = 'none';
        });
    });
    
    cadastroLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.style.display = 'none';
        cadastroModal.style.display = 'block';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === cadastroModal) {
            cadastroModal.style.display = 'none';
        }
    });
    
    // Inicialização
    carregarCarrinho(); // Carrega o carrinho do localStorage
    carregarProdutos(); // Carrega os produtos do JSON
});
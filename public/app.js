// Configurações Globais
const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbzoYaeEXvl_Gv4el6z45aCmnECjtEVTJie45nm9SzmnxcXgswuNYoNUvZ52BpCZzc8AIA/exec',
    WHATSAPP: '5511984193457'
};

// Carrinho de compras
let carrinho = [];

// Função para carregar produtos da planilha
async function carregarProdutos() {
    try {
        const response = await fetch(CONFIG.API_URL + '?action=getProdutos');
        const data = await response.json();
        
        // Remove a primeira linha (cabeçalhos)
        const produtos = data.slice(1);
        
        const container = document.getElementById('produtos-container');
        produtos.forEach(produto => {
            const [nome, preco, imagem, categoria] = produto;
            container.innerHTML += `
                <div class="produto" data-categoria="${categoria}">
                    <img src="${imagem}" alt="${nome}">
                    <h3>${nome}</h3>
                    <p class="preco">R$ ${Number(preco).toFixed(2)}</p>
                    <button onclick="adicionarAoCarrinho('${nome}', ${preco})">
                        Adicionar ao Carrinho
                    </button>
                </div>
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

// Função para adicionar ao carrinho
function adicionarAoCarrinho(nome, preco) {
    const item = carrinho.find(i => i.nome === nome);
    if (item) {
        item.quantidade++;
    } else {
        carrinho.push({ nome, preco, quantidade: 1 });
    }
    atualizarCarrinho();
}

// Função para atualizar exibição do carrinho
function atualizarCarrinho() {
    const total = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    document.getElementById('carrinho-total').textContent = `R$ ${total.toFixed(2)}`;
    document.getElementById('carrinho-itens').textContent = carrinho.length;
}

// Função para enviar pedido
async function enviarPedido(event) {
    event.preventDefault();
    
    const pedido = {
        nome: document.getElementById('nome').value,
        telefone: document.getElementById('telefone').value,
        itens: carrinho.map(item => `${item.quantidade}x ${item.nome}`),
        total: carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0)
    };

    try {
        // Envia para a planilha
        await fetch(CONFIG.API_URL, {
            method: 'POST',
            body: JSON.stringify(pedido)
        });

        // Envia para WhatsApp
        const mensagem = `*PEDIDO BENTO MINEIRO* 🧀\n\n` +
                        `*Cliente:* ${pedido.nome}\n` +
                        `*Telefone:* ${pedido.telefone}\n\n` +
                        `*Itens:*\n${pedido.itens.join('\n')}\n\n` +
                        `*Total:* R$ ${pedido.total.toFixed(2)}`;

        window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(mensagem)}`, '_blank');
        
        // Limpa o carrinho
        carrinho = [];
        atualizarCarrinho();
        alert('Pedido enviado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao enviar pedido:', error);
        alert('Erro ao enviar pedido. Por favor, tente novamente.');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
});

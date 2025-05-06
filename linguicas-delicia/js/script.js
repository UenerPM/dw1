// Funções comuns
function getCarrinho() {
  return JSON.parse(localStorage.getItem("carrinho")) || {};
}

function salvarCarrinho(carrinho) {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function atualizarCarrinhoDOM() {
  const lista = document.getElementById("carrinho-lista");
  if (!lista) return;

  const carrinho = getCarrinho();
  lista.innerHTML = "";
  let total = 0;

  if (Object.keys(carrinho).length === 0) {
    lista.innerHTML = "<li>Carrinho vazio</li>";
    return;
  }

  Object.keys(carrinho).forEach(nome => {
    const qtd = carrinho[nome].quantidade;
    const preco = carrinho[nome].preco;
    const subtotal = preco * qtd;
    const li = document.createElement("li");
    li.textContent = `${nome} x${qtd} - R$ ${subtotal.toFixed(2)}`;
    lista.appendChild(li);
    total += subtotal;
  });

  const totalElemento = document.createElement("li");
  totalElemento.innerHTML = `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
  lista.appendChild(totalElemento);
}

// Página Index
document.addEventListener("DOMContentLoaded", function () {
  const botoesAdicionar = document.querySelectorAll(".adicionar");
  const botoesRemover = document.querySelectorAll(".remover");
  const linkConfirmar = document.getElementById("confirmar-pedido");

  // Controles de quantidade
  botoesAdicionar.forEach(botao => {
    botao.addEventListener("click", function () {
      const nome = this.dataset.nome;
      const preco = parseFloat(this.dataset.preco);
      const carrinho = getCarrinho();

      if (!carrinho[nome]) {
        carrinho[nome] = { quantidade: 0, preco: preco };
      }
      carrinho[nome].quantidade += 1;

      document.querySelector(`.quantidade[data-nome="${nome}"]`).textContent = carrinho[nome].quantidade;
      salvarCarrinho(carrinho);
      atualizarCarrinhoDOM();
    });
  });

  botoesRemover.forEach(botao => {
    botao.addEventListener("click", function () {
      const nome = this.dataset.nome;
      const carrinho = getCarrinho();

      if (carrinho[nome] && carrinho[nome].quantidade > 0) {
        carrinho[nome].quantidade -= 1;
        if (carrinho[nome].quantidade === 0) {
          delete carrinho[nome];
        }
      }

      const qtdElem = document.querySelector(`.quantidade[data-nome="${nome}"]`);
      if (qtdElem) {
        qtdElem.textContent = carrinho[nome]?.quantidade || 0;
      }

      salvarCarrinho(carrinho);
      atualizarCarrinhoDOM();
    });
  });

  // Validação do carrinho antes de confirmar
  if (linkConfirmar) {
    linkConfirmar.addEventListener("click", function (e) {
      const carrinho = getCarrinho();
      if (Object.keys(carrinho).length === 0) {
        e.preventDefault();
        alert("Adicione itens ao carrinho antes de confirmar!");
      }
    });
  }

  atualizarCarrinhoDOM();
});

// Página Confirmação
document.addEventListener("DOMContentLoaded", function () {
  const listaConfirmacao = document.getElementById("confirmacao-lista");
  const btnFinalizar = document.getElementById("btn-finalizar");

  if (listaConfirmacao) {
    const carrinho = getCarrinho();
    let total = 0;
    
    listaConfirmacao.innerHTML = "";
    
    if (Object.keys(carrinho).length === 0) {
      listaConfirmacao.innerHTML = "<li>Nenhum item no carrinho</li>";
    } else {
      Object.keys(carrinho).forEach(nome => {
        const item = carrinho[nome];
        const subtotal = item.preco * item.quantidade;
        const li = document.createElement("li");
        li.textContent = `${nome} x${item.quantidade} - R$ ${subtotal.toFixed(2)}`;
        listaConfirmacao.appendChild(li);
        total += subtotal;
      });

      const totalElemento = document.createElement("li");
      totalElemento.innerHTML = `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
      totalElemento.style.fontWeight = "bold";
      listaConfirmacao.appendChild(totalElemento);
    }
  }

  if (btnFinalizar) {
    btnFinalizar.addEventListener("click", function () {
      const carrinho = getCarrinho();
      if (Object.keys(carrinho).length === 0) {
        alert("Seu carrinho está vazio!");
        return;
      }

      const pagamentoSelecionado = document.querySelector('input[name="pagamento"]:checked');
      if (pagamentoSelecionado) {
        localStorage.setItem("formaPagamento", pagamentoSelecionado.value);
        window.location.href = "pagamento.html";
      } else {
        alert("Selecione uma forma de pagamento!");
      }
    });
  }
});

// Página Pagamento
document.addEventListener("DOMContentLoaded", function () {
  const titulo = document.getElementById("titulo-pagamento");
  const conteudo = document.getElementById("conteudo-pagamento");
  const btnConcluir = document.getElementById("btn-concluir");
  const mensagemFinal = document.getElementById("mensagem-final");

  if (titulo && conteudo && btnConcluir) {
    const metodo = localStorage.getItem("formaPagamento");
    const carrinho = getCarrinho();

    if (Object.keys(carrinho).length === 0) {
      titulo.innerText = "Carrinho vazio";
      conteudo.innerHTML = `<p>Retorne à página inicial e adicione itens ao carrinho</p>`;
      btnConcluir.style.display = "none";
      return;
    }

    if (metodo === "PIX") {
      titulo.innerText = "Pagamento via PIX";
      conteudo.innerHTML = `<p>Escaneie o QR Code abaixo:</p>
        <img src="../img/qrcode-pix.png" alt="QR Code PIX" style="width: 200px;">`;
    } else if (metodo === "Cartão de Crédito") {
      titulo.innerText = "Pagamento com Cartão";
      conteudo.innerHTML = `
        <form id="form-cartao">
          <input type="text" placeholder="Número do Cartão" required>
          <input type="text" placeholder="Nome Titular" required>
          <input type="text" placeholder="Validade (MM/AA)" required>
          <input type="text" placeholder="CVV" required>
        </form>`;
    }

    btnConcluir.addEventListener("click", function (e) {
      e.preventDefault();
      
      if (metodo === "Cartão de Crédito") {
        const inputs = document.querySelectorAll("#form-cartao input");
        let isValid = true;
        
        inputs.forEach(input => {
          if (!input.value.trim()) isValid = false;
        });

        if (!isValid) {
          alert("Preencha todos os campos do cartão!");
          return;
        }
      }

      mensagemFinal.style.display = "block";
      conteudo.style.display = "none";
      btnConcluir.style.display = "none";
      limparCarrinho();
    });
  }
});

function limparCarrinho() {
  localStorage.removeItem("carrinho");
  localStorage.removeItem("formaPagamento");
}

// Adiciona feedback visual ao adicionar itens
document.querySelectorAll(".adicionar").forEach(btn => {
  btn.addEventListener("click", function() {
    this.classList.add("item-adicionado");
    setTimeout(() => this.classList.remove("item-adicionado"), 500);
  });
});

// =============================================
// VERIFICAÇÃO DE PAGAMENTO
// =============================================

function verificarPagamento() {
  // Verifica se está na página de pagamento
  if (!document.getElementById('conteudo-pagamento')) return;

  const metodoPagamento = localStorage.getItem('formaPagamento');
  const carrinho = Carrinho.get();
  
  // Elementos da página
  const btnConcluir = document.getElementById('btn-concluir');
  const mensagemFinal = document.getElementById('mensagem-final');
  const formCartao = document.getElementById('form-cartao');

  if (btnConcluir) {
    btnConcluir.addEventListener('click', async function(e) {
      e.preventDefault();
      
      // Validação básica
      if (Carrinho.isEmpty()) {
        alert('Seu carrinho está vazio!');
        return;
      }

      // Verificação específica por método
      if (metodoPagamento === 'Cartão de Crédito') {
        if (formCartao) {
          const numeroCartao = formCartao.querySelector('input[type="text"]').value;
          if (!validarCartao(numeroCartao)) {
            alert('Número de cartão inválido!');
            return;
          }
        }
      }

      // Simulação de processamento
      btnConcluir.disabled = true;
      btnConcluir.textContent = 'Processando...';
      
      try {
        // Simula uma requisição assíncrona
        await simularRequisicaoPagamento();
        
        // Se chegou aqui, pagamento foi "aprovado"
        mensagemFinal.style.display = 'block';
        document.getElementById('conteudo-pagamento').style.display = 'none';
        btnConcluir.style.display = 'none';
        
        // Limpa o carrinho após sucesso
        Carrinho.clear();
        
        // Atualiza o histórico (opcional)
        atualizarHistoricoPedidos(carrinho);
        
      } catch (error) {
        console.error('Erro no pagamento:', error);
        alert('Pagamento falhou: ' + error.message);
        btnConcluir.disabled = false;
        btnConcluir.textContent = 'Tentar Novamente';
      }
    });
  }
}

// Funções auxiliares para validação
function validarCartao(numero) {
  // Implementação simples do algoritmo de Luhn
  const regex = /^[0-9]{13,19}$/;
  if (!regex.test(numero)) return false;
  
  let sum = 0;
  for (let i = 0; i < numero.length; i++) {
    let digit = parseInt(numero[i]);
    if ((numero.length - i) % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

function simularRequisicaoPagamento() {
  return new Promise((resolve, reject) => {
    // Simula um delay de 2 segundos para processamento
    setTimeout(() => {
      // 80% de chance de sucesso (para teste)
      if (Math.random() > 0.2) {
        resolve({ status: 'approved' });
      } else {
        reject(new Error('Transação recusada pelo processador de pagamento'));
      }
    }, 2000);
  });
}

function atualizarHistoricoPedidos(pedido) {
  try {
    const historico = JSON.parse(localStorage.getItem('historicoPedidos')) || [];
    historico.push({
      data: new Date().toISOString(),
      itens: pedido,
      total: Object.values(pedido).reduce((sum, item) => sum + (item.preco * item.quantidade), 0)
    });
    localStorage.setItem('historicoPedidos', JSON.stringify(historico));
  } catch (e) {
    console.error('Erro ao salvar histórico:', e);
  }
}

// Inicializa a verificação quando a página carrega
document.addEventListener('DOMContentLoaded', verificarPagamento);
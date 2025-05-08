// script.js — JavaScript principal do site Uener Linguço

// Recupera o carrinho armazenado em localStorage e o converte de volta em objeto JS
// localStorage é uma API Web que permite armazenar dados no navegador de forma persistente
// JSON.parse() transforma a string JSON armazenada de volta em um objeto JavaScript
function getCarrinho() {
  return JSON.parse(localStorage.getItem("carrinho")) || {};
}

// Salva o carrinho atual no localStorage como string JSON
// JSON.stringify() converte um objeto JavaScript em uma string JSON serializável
function salvarCarrinho(carrinho) {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// Remove carrinho e forma de pagamento do localStorage
// Ideal após a finalização da compra ou reinício do fluxo
function limparCarrinho() {
  localStorage.removeItem("carrinho");
  localStorage.removeItem("formaPagamento");
}

// Atualiza dinamicamente a interface (DOM) com os itens e o total do carrinho
// DOM = Document Object Model, representação do conteúdo HTML como objetos JavaScript
function atualizarCarrinhoDOM(listaSelector, totalSelector) {
  const lista = document.querySelector(listaSelector); // Seleciona elemento da lista com seletor CSS
  if (!lista) return;

  const carrinho = getCarrinho();
  lista.innerHTML = ""; // Limpa conteúdo atual
  let total = 0;

  // Se carrinho estiver vazio, exibe mensagem
  if (Object.keys(carrinho).length === 0) {
    lista.innerHTML = "<li>Carrinho vazio</li>";
    return;
  }

  // Para cada item no carrinho, adiciona uma linha e atualiza o total acumulado
  Object.entries(carrinho).forEach(([nome, item]) => {
    const subtotal = item.preco * item.quantidade;
    lista.innerHTML += `<li>${nome} x${item.quantidade} – R$ ${subtotal.toFixed(2)}</li>`;
    total += subtotal;
  });

  // Atualiza o campo total, se houver um seletor válido
  if (totalSelector) {
    document.querySelector(totalSelector).textContent = `R$ ${total.toFixed(2)}`;
  }
}

// Lógica da página inicial: permite adicionar e remover itens do carrinho
// Botões são identificados por classes CSS e associados a eventos de clique
function setupIndexPage() {
  const botoesAdicionar = document.querySelectorAll(".adicionar"); // NodeList de botões de adicionar
  const botoesRemover = document.querySelectorAll(".remover");     // NodeList de botões de remover
  const linkConfirmar = document.getElementById("confirmar-pedido"); // Link para próxima etapa

  // Ao clicar em adicionar, incrementa quantidade e atualiza o DOM e localStorage
  botoesAdicionar.forEach(btn => {
    btn.addEventListener("click", () => {
      const nome = btn.dataset.nome; // dataset = atributos personalizados data-* no HTML
      const preco = parseFloat(btn.dataset.preco);
      const carrinho = getCarrinho();

      carrinho[nome] = carrinho[nome] || { quantidade: 0, preco };
      carrinho[nome].quantidade++;
      salvarCarrinho(carrinho);

      // Atualiza a exibição da quantidade ao lado do botão
      document.querySelector(`.quantidade[data-nome="${nome}"]`).textContent = carrinho[nome].quantidade;
      atualizarCarrinhoDOM("#carrinho-lista");
    });
  });

  // Ao clicar em remover, reduz quantidade ou remove item do carrinho
  botoesRemover.forEach(btn => {
    btn.addEventListener("click", () => {
      const nome = btn.dataset.nome;
      const carrinho = getCarrinho();
      if (carrinho[nome]) {
        carrinho[nome].quantidade--;
        if (carrinho[nome].quantidade <= 0) delete carrinho[nome]; // remove item se zero
        salvarCarrinho(carrinho);
        document.querySelector(`.quantidade[data-nome="${nome}"]`).textContent = carrinho[nome]?.quantidade || 0;
        atualizarCarrinhoDOM("#carrinho-lista");
      }
    });
  });

  // Previne avanço se carrinho estiver vazio
  if (linkConfirmar) {
    linkConfirmar.addEventListener("click", e => {
      if (Object.keys(getCarrinho()).length === 0) {
        e.preventDefault(); // Impede link de funcionar
        alert("Adicione itens ao carrinho antes de confirmar!");
      }
    });
  }

  atualizarCarrinhoDOM("#carrinho-lista");
}

// Preenche o resumo do pedido na tela de confirmação e permite prosseguir para o pagamento
function setupConfirmacaoPage() {
  const lista = document.getElementById("confirmacao-lista");
  const btnFinalizar = document.getElementById("btn-finalizar");
  const carrinho = getCarrinho();
  let total = 0;

  // Exibe os itens no HTML conforme estrutura do carrinho
  if (lista) {
    lista.innerHTML = "";
    if (Object.keys(carrinho).length === 0) {
      lista.innerHTML = "<li>Nenhum item no carrinho</li>";
    } else {
      Object.entries(carrinho).forEach(([nome, item]) => {
        const subtotal = item.preco * item.quantidade;
        lista.innerHTML += `<li>${nome} x${item.quantidade} – R$ ${subtotal.toFixed(2)}</li>`;
        total += subtotal;
      });
      lista.innerHTML += `<li><strong>Total: R$ ${total.toFixed(2)}</strong></li>`;
    }
  }

  // Ao finalizar, armazena a forma de pagamento e redireciona para a próxima página
  if (btnFinalizar) {
    btnFinalizar.addEventListener("click", () => {
      if (Object.keys(carrinho).length === 0) {
        return alert("Carrinho vazio!");
      }
      const metodo = document.querySelector('input[name="pagamento"]:checked').value;
      localStorage.setItem("formaPagamento", metodo);
      window.location.href = "pagamento.html";
    });
  }
}


// Easter Egg: 17 cliques na imagem do logo desbloqueiam a Linguiça do Chefe
let cliqueLogo = 0;
const logoImg = document.getElementById("logo-img");

if (logoImg) {
  logoImg.addEventListener("click", () => {
    cliqueLogo++;
    if (cliqueLogo === 17) {
      if (!document.querySelector("[data-nome='Linguiça do Chefe']")) {
        const lista = document.querySelector(".produtos") || document.getElementById("lista-produtos");
        if (lista) {
          const item = document.createElement("div");
          item.className = "produto";
          item.innerHTML = `
          <img src="../img/uener.jpg" alt="Linguiça Apimentada" />
            <h3>Linguiça do Chefe 🔥</h3>
            <p>R$ 999,99</p>
                        <button class="remover" data-nome="Linguiça do Chefe">-</button>
                        <span class="quantidade" data-nome="Linguiça do Chefe">0</span>
                                    <button class="adicionar" data-nome="Linguiça do Chefe" data-preco="999.99">+</button>

          `;
          lista.appendChild(item);
          alert("🔥 Você desbloqueou a Linguiça do Chefe!");
          setupIndexPage(); // ativa eventos nos novos botões
        }
      }
    }
    if (cliqueLogo === 30) {
      if (!document.querySelector("[data-nome='Linguiça do Kid']")) {
        const lista = document.querySelector(".produtos") || document.getElementById("lista-produtos");
        if (lista) {
          const item = document.createElement("div");
          item.className = "produto";
          item.innerHTML = `
          <img src="../img/Kid.jpg" alt="Linguiça Apimentada" />
            <h3>Linguiça do Kid Bengala🔥(30cm)</h3>
            <p>R$ 999,99</p>
                                    <button class="remover" data-nome="Linguiça do Kid Bengala">-</button>
       <span class="quantidade" data-nome="Linguiça do Kid Bengala">0</span>
            <button class="adicionar" data-nome="Linguiça do Kid Bengala" data-preco="999.99">+</button>
          `;
          lista.appendChild(item);
          alert("🔥 Você desbloqueou a Linguiça do Kid Bengala!(30 cliques = 30 centimetros)");
          setupIndexPage(); // ativa eventos nos novos botões
        }
      }
    }
  });
}


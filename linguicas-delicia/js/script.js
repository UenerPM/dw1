// JS principal para todas as páginas: index, confirmação e pagamento

// Funções de carrinho
function getCarrinho() {
  return JSON.parse(localStorage.getItem("carrinho")) || {};
}

function salvarCarrinho(carrinho) {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function limparCarrinho() {
  localStorage.removeItem("carrinho");
  localStorage.removeItem("formaPagamento");
}

// Atualiza o DOM do carrinho (index e confirmação)
function atualizarCarrinhoDOM(listaSelector, totalSelector) {
  const lista = document.querySelector(listaSelector);
  if (!lista) return;

  const carrinho = getCarrinho();
  lista.innerHTML = "";
  let total = 0;

  if (Object.keys(carrinho).length === 0) {
    lista.innerHTML = "<li>Carrinho vazio</li>";
    return;
  }

  Object.entries(carrinho).forEach(([nome, item]) => {
    const subtotal = item.preco * item.quantidade;
    lista.innerHTML += `<li>${nome} x${item.quantidade} – R$ ${subtotal.toFixed(2)}</li>`;
    total += subtotal;
  });

  if (totalSelector) {
    document.querySelector(totalSelector).textContent = `R$ ${total.toFixed(2)}`;
  }
}

// Index: adiciona/remover itens e valida confirmação
function setupIndexPage() {
  const botoesAdicionar = document.querySelectorAll(".adicionar");
  const botoesRemover = document.querySelectorAll(".remover");
  const linkConfirmar = document.getElementById("confirmar-pedido");

  botoesAdicionar.forEach(btn => {
    btn.addEventListener("click", () => {
      const nome = btn.dataset.nome;
      const preco = parseFloat(btn.dataset.preco);
      const carrinho = getCarrinho();

      carrinho[nome] = carrinho[nome] || { quantidade: 0, preco };
      carrinho[nome].quantidade++;
      salvarCarrinho(carrinho);

      document.querySelector(`.quantidade[data-nome="${nome}"]`).textContent = carrinho[nome].quantidade;
      atualizarCarrinhoDOM("#carrinho-lista");
    });
  });

  botoesRemover.forEach(btn => {
    btn.addEventListener("click", () => {
      const nome = btn.dataset.nome;
      const carrinho = getCarrinho();
      if (carrinho[nome]) {
        carrinho[nome].quantidade--;
        if (carrinho[nome].quantidade <= 0) delete carrinho[nome];
        salvarCarrinho(carrinho);
        document.querySelector(`.quantidade[data-nome="${nome}"]`).textContent = carrinho[nome]?.quantidade || 0;
        atualizarCarrinhoDOM("#carrinho-lista");
      }
    });
  });

  if (linkConfirmar) {
    linkConfirmar.addEventListener("click", e => {
      if (Object.keys(getCarrinho()).length === 0) {
        e.preventDefault();
        alert("Adicione itens ao carrinho antes de confirmar!");
      }
    });
  }

  atualizarCarrinhoDOM("#carrinho-lista");
}

// Confirmação: mostra resumo e direciona ao pagamento
function setupConfirmacaoPage() {
  const lista = document.getElementById("confirmacao-lista");
  const btnFinalizar = document.getElementById("btn-finalizar");
  const carrinho = getCarrinho();
  let total = 0;

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

// Pagamento: carrega conteúdo, valida e conclui
function setupPagamentoPage() {
  const conteudo = document.getElementById("conteudo-pagamento");
  const btnConcluir = document.getElementById("btn-concluir");
  const mensagemFinal = document.getElementById("mensagem-final");
  const metodo = localStorage.getItem("formaPagamento");
  const carrinho = getCarrinho();

  if (!conteudo || !btnConcluir) return;

  // Se carrinho vazio
  if (Object.keys(carrinho).length === 0) {
    conteudo.innerHTML = "<p>Carrinho vazio. Volte e adicione itens.</p>";
    btnConcluir.style.display = "none";
    return;
  }

  // Exibe PIX ou formulário de cartão
  if (metodo === "PIX") {
    conteudo.innerHTML = `
      <div class="qrcode-container">
        <img src="../img/qrcode-pix.png" alt="QR Code PIX">
        <p>Use a chave:<br>123.456.789-00</p>
      </div>`;
  } else {
    conteudo.innerHTML = `
      <form id="form-cartao">
        <div class="form-group">
          <label for="numero-cartao">Número do Cartão:</label>
          <input type="text" id="numero-cartao" placeholder="0000 0000 0000 0000" maxlength="19" required>
        </div>
        <div class="form-group">
          <label for="validade">Validade (MM/AA):</label>
          <input type="text" id="validade" placeholder="MM/AA" maxlength="5" required>
        </div>
        <div class="form-group">
          <label for="cvv">CVV:</label>
          <input type="text" id="cvv" placeholder="123" maxlength="4" required>
        </div>
      </form>`;
  }

  btnConcluir.addEventListener("click", () => {
    // valida formulário cartão, se existir
    const form = document.getElementById("form-cartao");
    if (form) {
      const numero = document.getElementById("numero-cartao").value.trim();
      const validade = document.getElementById("validade").value.trim();
      const cvv = document.getElementById("cvv").value.trim();
      if (!numero || !validade || !cvv) {
        return alert("Preencha todos os campos do cartão!");
      }
    }

    // conclui pagamento
    limparCarrinho();
    conteudo.style.display = "none";
    btnConcluir.style.display = "none";
    mensagemFinal.style.display = "block";
  });
}

// Inicializa conforme a página
document.addEventListener("DOMContentLoaded", () => {
  setupIndexPage();
  setupConfirmacaoPage();
  setupPagamentoPage();
});

// ---------- Funções de Carrinho ----------
function getCarrinho() {
  return JSON.parse(localStorage.getItem("carrinho")) || {};
}

function salvarCarrinho(carrinho) {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function limparCarrinho() {
  localStorage.removeItem("carrinho");
  localStorage.removeItem("formaPagamento");
}

// ---------- DOM do Carrinho (Index/Confirmação) ----------
function atualizarCarrinhoDOM(listaSelector) {
  const lista = document.querySelector(listaSelector);
  if (!lista) return;
  const carrinho = getCarrinho();
  lista.innerHTML = "";
  if (Object.keys(carrinho).length === 0) {
    lista.innerHTML = "<li>Carrinho vazio</li>";
    return;
  }
  Object.entries(carrinho).forEach(([nome, item]) => {
    const subtotal = item.preco * item.quantidade;
    lista.innerHTML += `<li>${nome} x${item.quantidade} – R$ ${subtotal.toFixed(2)}</li>`;
  });
}

// ---------- Pág. Index ----------
function setupIndexPage() {
  document.querySelectorAll(".adicionar").forEach(btn => {
    btn.addEventListener("click", () => {
      const nome = btn.dataset.nome;
      const preco = parseFloat(btn.dataset.preco);
      const carrinho = getCarrinho();
      carrinho[nome] = carrinho[nome] || { quantidade: 0, preco };
      carrinho[nome].quantidade++;
      salvarCarrinho(carrinho);
      document.querySelector(`.quantidade[data-nome="${nome}"]`).textContent = carrinho[nome].quantidade;
      atualizarCarrinhoDOM("#carrinho-lista");
    });
  });
  document.querySelectorAll(".remover").forEach(btn => {
    btn.addEventListener("click", () => {
      const nome = btn.dataset.nome;
      const carrinho = getCarrinho();
      if (carrinho[nome]) {
        carrinho[nome].quantidade--;
        if (carrinho[nome].quantidade <= 0) delete carrinho[nome];
        salvarCarrinho(carrinho);
        document.querySelector(`.quantidade[data-nome="${nome}"]`).textContent = carrinho[nome]?.quantidade || 0;
        atualizarCarrinhoDOM("#carrinho-lista");
      }
    });
  });
  const linkConf = document.getElementById("confirmar-pedido");
  if (linkConf) {
    linkConf.addEventListener("click", e => {
      if (Object.keys(getCarrinho()).length === 0) {
        e.preventDefault();
        alert("Adicione itens ao carrinho antes de confirmar!");
      }
    });
  }
  atualizarCarrinhoDOM("#carrinho-lista");
}

// ---------- Pág. Confirmação ----------
function setupConfirmacaoPage() {
  const lista = document.getElementById("confirmacao-lista");
  const btnFin = document.getElementById("btn-finalizar");
  if (!lista || !btnFin) return;
  const carrinho = getCarrinho();
  let total = 0;
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
  btnFin.addEventListener("click", () => {
    if (Object.keys(carrinho).length === 0) {
      return alert("Carrinho vazio!");
    }
    const metodo = document.querySelector('input[name="pagamento"]:checked').value;
    localStorage.setItem("formaPagamento", metodo);
    window.location.href = "pagamento.html";
  });
}

// ---------- Validações de Cartão ----------
function somenteDigitos(e) {
  // permite somente Backspace (8), Delete (46) e dígitos (48–57)
  if (![8,46].includes(e.keyCode) && (e.keyCode < 48 || e.keyCode > 57)) {
    e.preventDefault();
  }
}

function luhnCheck(num) {
  let arr = (num + '')
    .split('')
    .reverse()
    .map(x => parseInt(x));
  let sum = arr.reduce((acc, val, idx) => {
    if (idx % 2) {
      val *= 2;
      if (val > 9) val -= 9;
    }
    return acc + val;
  }, 0);
  return sum % 10 === 0;
}

function validarValidade(valor) {
  const [mes, ano] = valor.split('/').map(Number);
  if (!mes || !ano || mes < 1 || mes > 12) return false;
  const agora = new Date();
  const anoAtual = agora.getFullYear() % 100;
  const mesAtual = agora.getMonth() + 1;
  return ano > anoAtual || (ano === anoAtual && mes >= mesAtual);
}

// ---------- Pág. Pagamento ----------
function setupPagamentoPage() {
  const conteudo = document.getElementById("conteudo-pagamento");
  const btnConcluir = document.getElementById("btn-concluir");
  const mensagemFinal = document.getElementById("mensagem-final");
  if (!conteudo || !btnConcluir) return;
  
  const metodo = localStorage.getItem("formaPagamento");
  const carrinho = getCarrinho();
  if (Object.keys(carrinho).length === 0) {
    conteudo.innerHTML = "<p>Carrinho vazio. Volte e adicione itens.</p>";
    btnConcluir.style.display = "none";
    return;
  }
  
  if (metodo === "PIX") {
    conteudo.innerHTML = `
      <div class="qrcode-container">
        <img src="../img/qrcode-pix.png" alt="QR Code PIX">
        <p>Use a chave:<br>123.456.789-00</p>
      </div>`;
  } else {
    conteudo.innerHTML = `
      <form id="form-cartao">
        <div class="form-group">
          <label for="numero-cartao">Número do Cartão:</label>
          <input type="text" id="numero-cartao" maxlength="19" placeholder="0000 0000 0000 0000" required>
        </div>
        <div class="form-group">
          <label for="validade">Validade (MM/AA):</label>
          <input type="text" id="validade" maxlength="5" placeholder="MM/AA" required>
        </div>
        <div class="form-group">
          <label for="cvv">CVV:</label>
          <input type="text" id="cvv" maxlength="4" placeholder="123" required>
        </div>
      </form>`;
      
    // aplica restrição de dígitos
    ["numero-cartao","validade","cvv"].forEach(id => {
      const inp = document.getElementById(id);
      inp.addEventListener("keydown", somenteDigitos);
      if (id === "validade") {
        // insere "/" após dois dígitos
        inp.addEventListener("input", e => {
          let v = e.target.value.replace(/\D/g,'').slice(0,4);
          if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2);
          e.target.value = v;
        });
      } else if (id === "numero-cartao") {
        inp.addEventListener("input", e => {
          let v = e.target.value.replace(/\D/g,'').slice(0,16);
          // agrupa em 4 em 4
          v = v.match(/.{1,4}/g)?.join(' ') || v;
          e.target.value = v;
        });
      }
    });
  }
  
  btnConcluir.addEventListener("click", () => {
    const form = document.getElementById("form-cartao");
    if (form) {
      const num = document.getElementById("numero-cartao").value.replace(/\s/g,'');
      const val = document.getElementById("validade").value;
      const cvv = document.getElementById("cvv").value;
      if (!luhnCheck(num)) {
        return alert("Número de cartão inválido!");
      }
      if (!validarValidade(val)) {
        return alert("Validade inválida ou expirada!");
      }
      if (!/^\d{3,4}$/.test(cvv)) {
        return alert("CVV inválido!");
      }
    }
    // finaliza pagamento
    limparCarrinho();
    conteudo.style.display = "none";
    btnConcluir.style.display = "none";
    mensagemFinal.style.display = "block";
  });
}

// ---------- Inicialização ----------
document.addEventListener("DOMContentLoaded", () => {
  setupIndexPage();
  setupConfirmacaoPage();
  setupPagamentoPage();
});

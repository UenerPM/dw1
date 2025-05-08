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

// Validações de cartão
function somenteDigitos(e) {
  if (![8, 46].includes(e.keyCode) && (e.keyCode < 48 || e.keyCode > 57)) {
    e.preventDefault();
  }
}

function luhnCheck(num) {
  let arr = num.split('').reverse().map(x => parseInt(x));
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

function validarCVV(cvv) {
  return /^\d{3,4}$/.test(cvv);
}

// Função CRC16 para gerar código de verificação
function crc16(payload) {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : (crc << 1);
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Função correta para gerar payload PIX no formato EMV
function montarPayloadPix(chave, valor, nome, cidade) {
  const format = (id, value) => {
    const len = String(value).length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  const gui = format('00', 'br.gov.bcb.pix') + format('01', chave);
  const merchantInfo = format('26', gui);

  const payload = [
    format('00', '01'),
    merchantInfo,
    format('52', '0000'),
    format('53', '986'),
    format('54', valor.toFixed(2)),
    format('58', 'BR'),
    format('59', nome.slice(0, 25)),
    format('60', cidade.slice(0, 15)),
    format('62', format('05', '***'))
  ].join('');

  const crcPayload = payload + '6304';
  const crc = crc16(crcPayload);
  return crcPayload + crc;
}

// Pagamento: carrega conteúdo, gera QR Code PIX com valor e conclui
function setupPagamentoPage() {
  const conteudo = document.getElementById("conteudo-pagamento");
  const btnConcluir = document.getElementById("btn-concluir");
  const mensagemFinal = document.getElementById("mensagem-final");
  const metodo = localStorage.getItem("formaPagamento");
  const carrinho = getCarrinho();

  if (!conteudo || !btnConcluir) return;

  if (Object.keys(carrinho).length === 0) {
    conteudo.innerHTML = "<p>Carrinho vazio. Volte e adicione itens.</p>";
    btnConcluir.style.display = "none";
    return;
  }

  const total = Object.values(carrinho).reduce((sum, item) => sum + item.preco * item.quantidade, 0);

  const totalFormattedEl = document.getElementById("total-formatted");
  if (totalFormattedEl) {
    totalFormattedEl.textContent = `R$ ${total.toFixed(2)}`;
  }

  if (metodo === "PIX") {
    const chavePix = "uperesmarcon@gmail.com";
    const nome = "Uener Linguucudo";
    const cidade = "CAMPO MOURAO";

    const payload = montarPayloadPix(chavePix, total, nome, cidade);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(payload)}&size=250x250`;

    const qrImg = document.getElementById("pix-qrcode");
    if (qrImg) {
      qrImg.src = qrUrl;
    }
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

    ["numero-cartao", "validade", "cvv"].forEach(id => {
      const inp = document.getElementById(id);
      inp.addEventListener("keydown", somenteDigitos);
      if (id === "validade") {
        inp.addEventListener("input", e => {
          let v = e.target.value.replace(/\D/g, '').slice(0, 4);
          if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
          e.target.value = v;
        });
      } else if (id === "numero-cartao") {
        inp.addEventListener("input", e => {
          let v = e.target.value.replace(/\D/g, '').slice(0, 16);
          v = v.match(/.{1,4}/g)?.join(' ') || v;
          e.target.value = v;
        });
      }
    });
  }

  btnConcluir.addEventListener("click", () => {
    const form = document.getElementById("form-cartao");
    if (form) {
      const num = document.getElementById("numero-cartao").value.replace(/\s/g, '');
      const val = document.getElementById("validade").value;
      const cvv = document.getElementById("cvv").value;
      if (!luhnCheck(num)) return alert("Número de cartão inválido!");
      if (!validarValidade(val)) return alert("Validade inválida ou expirada!");
      if (!validarCVV(cvv)) return alert("CVV inválido!");
    }

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

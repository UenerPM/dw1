// JS principal para todas as páginas: index, confirmação e pagamento

// Recupera o carrinho do localStorage ou retorna um objeto vazio
function getCarrinho() {
  return JSON.parse(localStorage.getItem("carrinho")) || {};
}

// Salva o carrinho no localStorage
function salvarCarrinho(carrinho) {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// Limpa o carrinho e a forma de pagamento do localStorage

function limparCarrinho() {
  localStorage.removeItem("carrinho");
  localStorage.removeItem("formaPagamento");
}

// Atualiza visualmente a lista de itens e o total no carrinho
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

  // Adiciona cada item do carrinho na lista
  Object.entries(carrinho).forEach(([nome, item]) => {
    const subtotal = item.preco * item.quantidade;
    lista.innerHTML += `<li>${nome} x${item.quantidade} – R$ ${subtotal.toFixed(2)}</li>`;
    total += subtotal;
  });

  // Atualiza o total se um seletor foi passado
  if (totalSelector) {
    document.querySelector(totalSelector).textContent = `R$ ${total.toFixed(2)}`;
  }
}

// Configura a página inicial (index.html) para manipular itens do carrinho
function setupIndexPage() {
  // Esvazia o carrinho apenas se o usuário recarregar a página (F5 ou Ctrl+R)
if (performance.getEntriesByType("navigation")[0].type === "reload") {
  limparCarrinho();
}

  const botoesAdicionar = document.querySelectorAll(".adicionar");
  const botoesRemover = document.querySelectorAll(".remover");
  const linkConfirmar = document.getElementById("confirmar-pedido");

  // Botão de adicionar item
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

  // Botão de remover item
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

  // Verifica se o carrinho está vazio ao confirmar
  if (linkConfirmar) {
    linkConfirmar.addEventListener("click", e => {
      if (Object.keys(getCarrinho()).length === 0) {
        e.preventDefault();
        alert("Adicione itens ao carrinho antes de confirmar!");
      }
    });
  }

  // Atualiza visualmente o carrinho
  atualizarCarrinhoDOM("#carrinho-lista");
}

// Configura a página de confirmação (confirmacao.html)
function setupConfirmacaoPage() {
  const lista = document.getElementById("confirmacao-lista");
  const btnFinalizar = document.getElementById("btn-finalizar");
  const carrinho = getCarrinho();
  let total = 0;

  // Mostra os itens do carrinho na tela
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

  // Finaliza o pedido e salva a forma de pagamento
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

// Permite apenas digitos numéricos em campos específicos
function somenteDigitos(e) {
  if (![8, 46].includes(e.keyCode) && (e.keyCode < 48 || e.keyCode > 57)) {
    e.preventDefault();
  }
}

// Valida número do cartão pelo algoritmo de Luhn
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

// Valida a data de validade do cartão
function validarValidade(valor) {
  const [mes, ano] = valor.split('/').map(Number);
  if (!mes || !ano || mes < 1 || mes > 12) return false;
  const agora = new Date();
  const anoAtual = agora.getFullYear() % 100;
  const mesAtual = agora.getMonth() + 1;
  return ano > anoAtual || (ano === anoAtual && mes >= mesAtual);
}

// Valida o código de segurança do cartão (CVV)
function validarCVV(cvv) {
  return /^\d{3,4}$/.test(cvv);
}

// Calcula o CRC16-CCITT para validação do payload PIX
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

// Monta o payload PIX seguindo o padrão EMV com CRC16
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

// Configura a página de pagamento (pagamento.html)
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

  // Atualiza valor do total na tela
  const totalFormattedEl = document.getElementById("total-formatted");
  if (totalFormattedEl) {
    totalFormattedEl.textContent = `R$ ${total.toFixed(2)}`;
  }

  // Se método for PIX, gera o QR Code
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
    // Se for cartão, exibe o formulário
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

    // Aplica máscara e restrição aos campos
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

  // Validação e finalização do pagamento
  btnConcluir.addEventListener("click", () => {
    const form = document.getElementById("form-cartao");
    if (form) {
      const num = document.getElementById("numero-cartao").value.replace(/\s/g, '');
      const val = document.getElementById("validade").value;
      const cvv = document.getElementById("cvv").value;

      // Valida número de cartão
      if (!num || num.length < 13 || !luhnCheck(num)) {
        return alert("Número de cartão inválido!");
      }
      // Valida validade
      if (!validarValidade(val)) {
        return alert("Validade inválida ou expirada!");
      }
      // Valida CVV
      if (!validarCVV(cvv)) {
        return alert("CVV inválido!");
      }
    }

    // Finaliza o pedido
    limparCarrinho();
    conteudo.style.display = "none";
    btnConcluir.style.display = "none";
    mensagemFinal.style.display = "block";
  });
}

// Inicializa os comportamentos conforme a página atual
document.addEventListener("DOMContentLoaded", () => {
  setupIndexPage();
  setupConfirmacaoPage();
  setupPagamentoPage();
});

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


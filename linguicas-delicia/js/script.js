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
  if (![8,46].includes(e.keyCode) && (e.keyCode < 48 || e.keyCode > 57)) {
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

// Pagamento: carrega conteúdo, gera QR Code PIX com valor e conclui
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

  // Cálculo do total da compra
  const total = Object.values(carrinho).reduce((sum, item) => sum + item.preco * item.quantidade, 0);

  if (metodo === "PIX") {
    // Função CRC16-IBM para EMV
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

    // Monta payload EMV completo com CRC16
    function montarPayloadPix(chave, valor) {
      const valorFmt = valor.toFixed(2).replace('.', '');
      let payload =
        "000201" +                                        // Início
        "26360014br.gov.bcb.pix" +                        // merchant info
        String(chave.length).padStart(2, '0') + chave +   // chave PIX
        "52040000" +                                      // merchant category
        "5303986" +                                       // moeda BRL
        "54" + String(valorFmt.length).padStart(2, '0') + valorFmt + // valor
        "5802BR" +                                        // país
        "59" + String("Uener Linguço".length).padStart(2, '0') + "Uener Linguço" + // nome
        "6009Sao Paulo" +                                 // localidade
        "62070503***";                                    // info adicional
      const crcField = "6304";
      return payload + crcField + crc16(payload + crcField);
    }

    const chavePix = "12345678900"; // substitua pela sua chave real
    const payload = montarPayloadPix(chavePix, total);
    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(payload)}`;


    conteudo.innerHTML = `
      <div class="qrcode-container">
        <img src="${qrUrl}" alt="QR Code PIX — R$ ${total.toFixed(2)}">
        <p>Escaneie para pagar <strong>R$ ${total.toFixed(2)}</strong></p>
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

    // Restrições e máscaras de input
    ["numero-cartao","validade","cvv"].forEach(id => {
      const inp = document.getElementById(id);
      inp.addEventListener("keydown", somenteDigitos);
      if (id === "validade") {
        inp.addEventListener("input", e => {
          let v = e.target.value.replace(/\D/g,'').slice(0,4);
          if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2);
          e.target.value = v;
        });
      } else if (id === "numero-cartao") {
        inp.addEventListener("input", e => {
          let v = e.target.value.replace(/\D/g,'').slice(0,16);
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
      if (!validarCVV(cvv)) {
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

// Inicializa conforme a página
document.addEventListener("DOMContentLoaded", () => {
  setupIndexPage();
  setupConfirmacaoPage();
  setupPagamentoPage();
});

// script.js

// Função para formatar número como moeda brasileira
function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Exemplo: pegar total do carrinho (substitua por sua lógica real)
let totalCart = 0;

// Se você estiver armazenando o carrinho em localStorage:
const cart = JSON.parse(localStorage.getItem('uenerCart') || '[]');
totalCart = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

// Exibir valor total na página
const totalAmountEl = document.getElementById('total-amount');
totalAmountEl.textContent = formatBRL(totalCart);

// Montar payload PIX seguindo o padrão EMV
function buildPixPayload({
  pixKey,
  description,
  merchantName,
  merchantCity,
  amount,
}) {
  // helper para montar campos EMV
  const field = (id, value) => {
    const len = String(value).length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  const payload = [
    field('00', '01'), // versão do padrão
    field('26', // Merchant Account Information
      field('00', 'br.gov.bcb.pix') +
      field('01', pixKey) // sua chave PIX
    ),
    field('52', '0000'),          // Merchant Category Code
    field('53', '986'),           // Moeda (986 = BRL)
    field('54', amount.toFixed(2)), // Valor
    field('58', 'BR'),            // País
    field('59', merchantName.slice(0, 25)), // Nome do recebedor (máx 25)
    field('60', merchantCity.slice(0, 15)), // Cidade (máx 15)
    field('62', // Additional Data Field
      field('05', '***') // ID do pagamento (opcional)
    )
  ].join('');

  // CRC16-CCITT
  const crc16 = (s) => {
    let crc = 0xFFFF;
    for (let i = 0; i < s.length; i++) {
      crc ^= s.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : (crc << 1);
      }
    }
    return crc & 0xFFFF;
  };

  const payloadWithCRC = payload + '6304' + crc16(payload).toString(16).toUpperCase().padStart(4, '0');
  return payloadWithCRC;
}

// Dados da sua loja
const pixKey = 'uperesmarcon@gmail.com';       // substitua pela sua chave PIX
const merchantName = 'Uener Linguço';
const merchantCity = 'SAO PAULO';
const description = 'Compra Uener Linguço';

// Gerar payload e definir imagem de QR Code
const payload = buildPixPayload({
  pixKey,
  description,
  merchantName,
  merchantCity,
  amount: totalCart,
});

// Usando API pública de geração de QR: api.qrserver.com
const qrImg = document.getElementById('pix-qrcode');
qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(payload)}&size=250x250`;

// Botão Confirmar leva ao confirmacao.html
document.getElementById('btn-confirm').onclick = () => {
  window.location.href = 'confirmacao.html';
};


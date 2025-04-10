let pontosTime1 = 0;
let pontosTime2 = 0;
let setsTime1 = 0;
let setsTime2 = 0;
let set1Time1 = 0, set1Time2 = 0;
let set2Time1 = 0, set2Time2 = 0;
let set3Time1 = 0, set3Time2 = 0;
let set4Time1 = 0, set4Time2 = 0;
let set5Time1 = 0, set5Time2 = 0;

const pontosParaVencerSet = 25;
const pontosTieBreak = 15;
const maxSetsParaVencer = 3;
const maxSetsParaTieBreak = 5;
const diferencaParaVencer = 2; // Diferença de 2 pontos

// Função para adicionar pontos
function adicionarPonto(time) {
    let setAtual = obterSetAtual();

    // Atualiza os pontos
    if (time === 'time1') {
        pontosTime1++;
    } else if (time === 'time2') {
        pontosTime2++;
    }

    // Adiciona ao histórico
    adicionarHistorico(time, setAtual);

    // Atualiza o placar no HTML
    document.getElementById('time1').innerText = pontosTime1;
    document.getElementById('time2').innerText = pontosTime2;

    // Verifica se algum time venceu o set ou o tie-break
    verificarVencedorSet();
}

// Função para obter o set atual
function obterSetAtual() {
    if (setsTime1 + setsTime2 < 4) {
        return setsTime1 + setsTime2 + 1;  // Set 1, Set 2, Set 3, Set 4
    } else {
        return 5;  // Set 5 (Tie-break)
    }
}

// Função para adicionar o histórico de pontos
function adicionarHistorico(time, setAtual) {
    let historico = document.getElementById('historico');
    let li = document.createElement('li');

    // Obtém a hora atual
    let agora = new Date();
    let hora = agora.getHours().toString().padStart(2, '0');
    let minutos = agora.getMinutes().toString().padStart(2, '0');
    let segundos = agora.getSeconds().toString().padStart(2, '0');
    let horaFormatada = `${hora}:${minutos}:${segundos}`;

    // Estilo visual para o histórico
    li.style.padding = '10px';
    li.style.marginBottom = '8px';
    li.style.borderRadius = '8px';
    li.style.backgroundColor = time === 'time1' ? '#e7f5ff' : '#f8d7da';
    li.style.color = time === 'time1' ? '#007bff' : '#dc3545';
    li.style.textAlign = 'left';
    li.style.fontSize = '18px';
    li.style.fontWeight = 'bold';
    li.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';

    // Adiciona o ícone e o texto do histórico
    li.innerHTML = `
        <span>${horaFormatada} - Set ${setAtual}</span>
        <span>${time === 'time1' ? 'Time 1' : 'Time 2'} marcou um ponto</span>
    `;
    
    // Adiciona a linha ao histórico
    historico.appendChild(li);
}

// Função para verificar o vencedor de um set
function verificarVencedorSet() {
    // Verificação para sets normais (set 1, 2, 3, 4)
    if (setsTime1 < maxSetsParaVencer && setsTime2 < maxSetsParaVencer) {
        if (pontosTime1 >= pontosParaVencerSet && pontosTime1 - pontosTime2 >= diferencaParaVencer) {
            salvarVencedorSet(1);
        } else if (pontosTime2 >= pontosParaVencerSet && pontosTime2 - pontosTime1 >= diferencaParaVencer) {
            salvarVencedorSet(2);
        }
    }

    // Verificação para o tie-break (set 5)
    if (setsTime1 === 2 && setsTime2 === 2) {
        if (pontosTime1 >= pontosTieBreak && pontosTime1 - pontosTime2 >= diferencaParaVencer) {
            salvarVencedorSet(1, true);
        } else if (pontosTime2 >= pontosTieBreak && pontosTime2 - pontosTime1 >= diferencaParaVencer) {
            salvarVencedorSet(2, true);
        }
    }
}

// Função para salvar o vencedor do set
function salvarVencedorSet(time, isTieBreak = false) {
    if (isTieBreak) {
        if (time === 1) {
            set5Time1 = pontosTime1;
            set5Time2 = pontosTime2;
            document.getElementById('set5-time1').innerText = set5Time1;
            document.getElementById('set5-time2').innerText = set5Time2;
            setsTime1++;
            document.getElementById('sets-time1').innerText = setsTime1;
        } else {
            set5Time1 = pontosTime1;
            set5Time2 = pontosTime2;
            document.getElementById('set5-time1').innerText = set5Time1;
            document.getElementById('set5-time2').innerText = set5Time2;
            setsTime2++;
            document.getElementById('sets-time2').innerText = setsTime2;
        }
    } else {
        // Para sets normais
        if (set1Time1 === 0 && set1Time2 === 0) {
            set1Time1 = pontosTime1;
            set1Time2 = pontosTime2;
            document.getElementById('set1-time1').innerText = set1Time1;
            document.getElementById('set1-time2').innerText = set1Time2;
        } else if (set2Time1 === 0 && set2Time2 === 0) {
            set2Time1 = pontosTime1;
            set2Time2 = pontosTime2;
            document.getElementById('set2-time1').innerText = set2Time1;
            document.getElementById('set2-time2').innerText = set2Time2;
        } else if (set3Time1 === 0 && set3Time2 === 0) {
            set3Time1 = pontosTime1;
            set3Time2 = pontosTime2;
            document.getElementById('set3-time1').innerText = set3Time1;
            document.getElementById('set3-time2').innerText = set3Time2;
        } else if (set4Time1 === 0 && set4Time2 === 0) {
            set4Time1 = pontosTime1;
            set4Time2 = pontosTime2;
            document.getElementById('set4-time1').innerText = set4Time1;
            document.getElementById('set4-time2').innerText = set4Time2;
        }
        if (time === 1) {
            setsTime1++;
            document.getElementById('sets-time1').innerText = setsTime1;
        } else {
            setsTime2++;
            document.getElementById('sets-time2').innerText = setsTime2;
        }
    }

    // Zera os pontos para o próximo set
    pontosTime1 = 0;
    pontosTime2 = 0;

    // Verifica se algum time venceu a partida
    verificarVencedorPartida();
}

// Função para verificar o vencedor da partida
function verificarVencedorPartida() {
    if (setsTime1 === maxSetsParaVencer) {
        alert("O Time 1 venceu a partida!");
        resetarJogo();
    } else if (setsTime2 === maxSetsParaVencer) {
        alert("O Time 2 venceu a partida!");
        resetarJogo();
    }
}

// Função para zerar o placar e reiniciar o jogo
function zerarPlacar() {
    pontosTime1 = 0;
    pontosTime2 = 0;
    set1Time1 = set1Time2 = 0;
    set2Time1 = set2Time2 = 0;
    set3Time1 = set3Time2 = 0;
    set4Time1 = set4Time2 = 0;
    set5Time1 = set5Time2 = 0;
    setsTime1 = 0;
    setsTime2 = 0;

    document.getElementById('time1').innerText = pontosTime1;
    document.getElementById('time2').innerText = pontosTime2;
    document.getElementById('set1-time1').innerText = set1Time1;
    document.getElementById('set1-time2').innerText = set1Time2;
    document.getElementById('set2-time1').innerText = set2Time1;
    document.getElementById('set2-time2').innerText = set2Time2;
    document.getElementById('set3-time1').innerText = set3Time1;
    document.getElementById('set3-time2').innerText = set3Time2;
    document.getElementById('set4-time1').innerText = set4Time1;
    document.getElementById('set4-time2').innerText = set4Time2;
    document.getElementById('set5-time1').innerText = set5Time1;
    document.getElementById('set5-time2').innerText = set5Time2;
    document.getElementById('sets-time1').innerText = setsTime1;
    document.getElementById('sets-time2').innerText = setsTime2;

    // Limpar o histórico de pontos
    let historico = document.getElementById('historico');
    historico.innerHTML = '';
}

// Função para reiniciar o jogo
function resetarJogo() {
    pontosTime1 = 0;
    pontosTime2 = 0;
    set1Time1 = set1Time2 = 0;
}

window.onload = function() {
    // Carregar as configurações do localStorage
    const nomeTime1 = localStorage.getItem('nomeTime1') || 'Time 1';
    const corTime1 = localStorage.getItem('corTime1') || '#007bff';
    const nomeTime2 = localStorage.getItem('nomeTime2') || 'Time 2';
    const corTime2 = localStorage.getItem('corTime2') || '#dc3545';
    const sets = localStorage.getItem('sets') || '3';

    // Atualizar os nomes dos times
    document.getElementById('time1').innerText = nomeTime1;
    document.getElementById('time2').innerText = nomeTime2;
    
    // Atualizar as cores dos times
    document.getElementById('time1').style.color = corTime1;
    document.getElementById('time2').style.color = corTime2;

    // Definir o número de sets
    const maxSetsParaVencer = parseInt(sets);
    document.getElementById('sets-time1').innerText = 0;
    document.getElementById('sets-time2').innerText = 0;

    // Resto do código do jogo...
}

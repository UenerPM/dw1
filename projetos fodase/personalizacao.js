function salvarConfiguracoes() {
    // Pega os valores dos inputs
    const nomeTime1 = document.getElementById('nomeTime1').value;
    const corTime1 = document.getElementById('corTime1').value;
    const nomeTime2 = document.getElementById('nomeTime2').value;
    const corTime2 = document.getElementById('corTime2').value;
    const sets = document.getElementById('sets').value;

    // Salva as configurações no localStorage
    localStorage.setItem('nomeTime1', nomeTime1);
    localStorage.setItem('corTime1', corTime1);
    localStorage.setItem('nomeTime2', nomeTime2);
    localStorage.setItem('corTime2', corTime2);
    localStorage.setItem('sets', sets);

    // Redireciona para a página do jogo
    window.location.href = "index.html";  // Supondo que o arquivo do jogo seja index.html
}

// Preencher as configurações atuais, caso o usuário já tenha feito alterações
window.onload = function() {
    const nomeTime1 = localStorage.getItem('nomeTime1');
    const corTime1 = localStorage.getItem('corTime1');
    const nomeTime2 = localStorage.getItem('nomeTime2');
    const corTime2 = localStorage.getItem('corTime2');
    const sets = localStorage.getItem('sets');

    if (nomeTime1) {
        document.getElementById('nomeTime1').value = nomeTime1;
    }
    if (corTime1) {
        document.getElementById('corTime1').value = corTime1;
    }
    if (nomeTime2) {
        document.getElementById('nomeTime2').value = nomeTime2;
    }
    if (corTime2) {
        document.getElementById('corTime2').value = corTime2;
    }
    if (sets) {
        document.getElementById('sets').value = sets;
    }
}

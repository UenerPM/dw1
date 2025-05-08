let pontos = { time1: 0, time2: 0 };
let sets = { time1: 0, time2: 0 };
let setAtual = 1;
let maxSets = 5;
let historico = [];

function atualizarPlacar() {
    document.getElementById("time1").textContent = pontos.time1;
    document.getElementById("time2").textContent = pontos.time2;
}

function atualizarSets() {
    document.getElementById(`set${setAtual}-time1`).textContent = pontos.time1;
    document.getElementById(`set${setAtual}-time2`).textContent = pontos.time2;
}

function atualizarSetsVencidos() {
    document.getElementById("sets-time1").textContent = sets.time1;
    document.getElementById("sets-time2").textContent = sets.time2;
}

function registrarHistorico(time) {
    const item = document.createElement("li");
    item.textContent = `Ponto para ${time === "time1" ? "Time 1" : "Time 2"} (Set ${setAtual})`;
    document.getElementById("historico").prepend(item);
}

function adicionarPonto(time) {
    if (setAtual > maxSets) return;

    pontos[time]++;
    registrarHistorico(time);
    atualizarPlacar();

    const p1 = pontos.time1;
    const p2 = pontos.time2;

    if ((p1 >= 11 || p2 >= 11) && Math.abs(p1 - p2) >= 2) {
        // Set encerrado
        if (p1 > p2) sets.time1++;
        else sets.time2++;

        atualizarSets();
        atualizarSetsVencidos();

        setAtual++;

        if (sets.time1 > maxSets / 2 || sets.time2 > maxSets / 2) {
            alert(`Jogo encerrado! ${sets.time1 > sets.time2 ? "Time 1" : "Time 2"} venceu!`);
            return;
        }

        // Reset para novo set
        pontos.time1 = 0;
        pontos.time2 = 0;
        atualizarPlacar();
    }
}

function zerarPlacar() {
    pontos = { time1: 0, time2: 0 };
    sets = { time1: 0, time2: 0 };
    setAtual = 1;

    atualizarPlacar();
    atualizarSetsVencidos();

    for (let i = 1; i <= 5; i++) {
        document.getElementById(`set${i}-time1`).textContent = "0";
        document.getElementById(`set${i}-time2`).textContent = "0";
    }

    document.getElementById("historico").innerHTML = "";
}

// ESTADO DO JOGO
const state = {
  player: { name: "Yuri", level: 1, xp: 0, energy: 100, coins: 5 },
  location: "estacao",
  timeMinutes: 1425, // 23:45
  inventory: [],
  clues: [],
  mission: "Explore a estação e descubra por que ela está abandonada.",
  flags: { trainArrived: false }
};

// LOCAIS DO MAPA
const LOCATIONS = {
  estacao: {
    title: "ESTAÇÃO CENTRAL",
    bg: "#11111e",
    elements: [
      { name: "Olivia", top: "50%", left: "15%", width: "80px", height: "80px", color: "#4a3b52", action: () => talkOlivia() },
      { name: "O Condutor", top: "50%", left: "75%", width: "80px", height: "80px", color: "#2d4a3e", action: () => talkCondutor() },
      { name: "Relógio", top: "15%", left: "45%", width: "90px", height: "40px", color: "#3a3a22", action: () => alert("Relógio marca: " + formatTime(state.timeMinutes)) },
      { name: "Bilhete", top: "75%", left: "40%", width: "50px", height: "30px", color: "#5a5a3a", action: () => getItem("Bilhete Antigo", "Documento cita linha experimental.") }
    ]
  },
  centro: {
    title: "CENTRO ABANDONADO",
    bg: "#1a1a24",
    elements: [
      { name: "Vendedor", top: "45%", left: "20%", width: "80px", height: "80px", color: "#3d3222", action: () => talkVendedor() },
      { name: "Homem da Praça", top: "50%", left: "60%", width: "80px", height: "80px", color: "#22333d", action: () => talkHomemPraca() }
    ]
  },
  chuva: {
    title: "DISTRITO DA CHUVA",
    bg: "#08101e",
    elements: [
      { name: "Poste de Luz", top: "30%", left: "30%", width: "40px", height: "100px", color: "#1e3344", action: () => getItem("Bilhete Vermelho", "Aviso sobre o perigo do trem.") }
    ]
  },
  parque: {
    title: "PARQUE DAS LANTERNAS",
    bg: "#0b1c10",
    elements: [
      { name: "Lago", top: "60%", left: "40%", width: "120px", height: "60px", color: "#143324", action: () => getItem("Moeda Estranha", "Moeda com gravuras antigas.") }
    ]
  },
  hospital: {
    title: "HOSPITAL SÃO LUCAS",
    bg: "#0d1818",
    elements: [
      { name: "Kaio", top: "45%", left: "30%", width: "80px", height: "80px", color: "#2e4854", action: () => talkKaio() },
      { name: "Terminal PC", top: "40%", left: "65%", width: "70px", height: "60px", color: "#1c382b", action: () => useTerminal() }
    ]
  },
  cidade: {
    title: "CIDADE ANTIGA",
    bg: "#21160e",
    elements: [
      { name: "Senhora da Cidade", top: "50%", left: "50%", width: "80px", height: "80px", color: "#473021", action: () => talkSenhora() }
    ]
  },
  tuneis: {
    title: "TÚNEIS SUBTERRÂNEOS",
    bg: "#080808",
    elements: [
      { name: "Porta Trancada", top: "40%", left: "45%", width: "90px", height: "100px", color: "#2b2b2b", action: () => enterSala0() }
    ]
  },
  sala0: {
    title: "SALA 0",
    bg: "#1a0505",
    elements: [
      { name: "Máquina Central", top: "35%", left: "40%", width: "120px", height: "100px", color: "#541e1e", action: () => triggerEnding() }
    ]
  }
};

function init() {
  renderScene();
  updateHUD();
  setInterval(() => {
    state.timeMinutes = (state.timeMinutes + 1) % 1440;
    if (state.timeMinutes === 0) {
      state.flags.trainArrived = true;
      alert("00:00 - O Último Trem chegou à plataforma.");
    }
    updateHUD();
  }, 3000);
}

function formatTime(m) {
  return `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`;
}

function updateHUD() {
  document.getElementById("time-display").innerText = formatTime(state.timeMinutes);
  document.getElementById("loc-display").innerText = LOCATIONS[state.location].title;
  document.getElementById("p-level").innerText = state.player.level;
  document.getElementById("p-xp").innerText = state.player.xp;
  document.getElementById("coins-count").innerText = state.player.coins;
  document.getElementById("pistas-count").innerText = state.clues.length;
  document.getElementById("energy-bar").style.width = state.player.energy + "%";
  document.getElementById("current-mission").innerText = state.mission;

  const invList = document.getElementById("inventory-list");
  invList.innerHTML = state.inventory.length === 0 ? "<li><i>Vazio</i></li>" : state.inventory.map(i => `<li>• ${i}</li>`).join("");
}

function renderScene() {
  const scene = document.getElementById("scene");
  scene.innerHTML = "";
  const loc = LOCATIONS[state.location];
  scene.style.backgroundColor = loc.bg;

  loc.elements.forEach(el => {
    const btn = document.createElement("div");
    btn.className = "interactable";
    btn.style.top = el.top;
    btn.style.left = el.left;
    btn.style.width = el.width;
    btn.style.height = el.height;
    btn.style.backgroundColor = el.color;
    btn.innerText = el.name;
    btn.onclick = el.action;
    scene.appendChild(btn);
  });
}

function showDialogue(speaker, text, options) {
  const box = document.getElementById("dialogue-box");
  document.getElementById("dialogue-speaker").innerText = speaker;
  document.getElementById("dialogue-text").innerText = text;
  const optsContainer = document.getElementById("dialogue-options");
  optsContainer.innerHTML = "";

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "dialogue-btn";
    btn.innerText = opt.text;
    btn.onclick = () => {
      box.style.display = "none";
      opt.callback();
    };
    optsContainer.appendChild(btn);
  });
  box.style.display = "block";
}

function getItem(itemName, clueText) {
  if (!state.inventory.includes(itemName)) {
    state.inventory.push(itemName);
    addClue(clueText);
    addXP(20);
    alert(`Item obtido: ${itemName}`);
  } else {
    alert("Nada mais aqui.");
  }
}

function addClue(text) {
  if (!state.clues.includes(text)) {
    state.clues.push(text);
    updateHUD();
  }
}

function addXP(val) {
  state.player.xp += val;
  if (state.player.xp >= 50) {
    state.player.level++;
    state.player.xp = 0;
  }
  updateHUD();
}

function talkOlivia() {
  showDialogue("Olivia", "O relógio não para. Se quiser respostas, tome o trem à meia-noite.", [
    { text: "Entendido", callback: () => {} }
  ]);
}

function talkCondutor() {
  if (!state.flags.trainArrived) {
    showDialogue("O Condutor", "A questão não é para onde o trem vai. É quando você volta.", [{ text: "Aguardar 00:00", callback: () => {} }]);
    return;
  }

  const dests = [
    { text: "Estação Central", loc: "estacao" },
    { text: "Centro Abandonado", loc: "centro" },
    { text: "Distrito da Chuva", loc: "chuva" },
    { text: "Parque das Lanternas", loc: "parque" },
    { text: "Hospital São Lucas", loc: "hospital" },
    { text: "Cidade Antiga", loc: "cidade" },
    { text: "Túneis", loc: "tuneis" }
  ];

  const options = dests.map(d => ({
    text: d.text,
    callback: () => { state.location = d.loc; renderScene(); updateHUD(); }
  }));

  showDialogue("O Condutor", "Escolha o seu destino:", options);
}

function talkKaio() {
  showDialogue("Kaio", "Não lembro quem sou...", [
    {
      text: "Entregar Bilhete Antigo",
      callback: () => {
        if (state.inventory.includes("Bilhete Antigo")) {
          getItem("Cartão Hospitalar", "Kaio era o engenheiro do projeto.");
          getItem("Chave Mestra", "Abre a Sala 0.");
        } else {
          alert("Você precisa do Bilhete Antigo.");
        }
      }
    },
    { text: "Sair", callback: () => {} }
  ]);
}

function talkVendedor() {
  showDialogue("Vendedor", "Quer comprar informações por 5 moedas?", [
    {
      text: "Comprar Pista",
      callback: () => {
        if (state.player.coins >= 5) {
          state.player.coins -= 5;
          addClue("O Vendedor revelou que a Sala 0 fica após os túneis.");
        } else {
          alert("Moedas insuficientes.");
        }
      }
    },
    { text: "Sair", callback: () => {} }
  ]);
}

function talkHomemPraca() {
  showDialogue("Homem da Praça", "Olhe esta foto antiga...", [
    { text: "Examinar Foto", callback: () => getItem("Fotografia", "Foto mostra o primeiro trem e Yuri na multidão.") }
  ]);
}

function talkSenhora() {
  showDialogue("Senhora", "Algumas coisas não envelhecem. O trem e este ciclo são um deles.", [
    { text: "Ouvir história", callback: () => addClue("A Senhora confirma que o tempo está colapsado.") }
  ]);
}

function useTerminal() {
  addClue("Terminal revela: Falha no experimento causou o colapso.");
  alert("Terminal acessado.");
}

function enterSala0() {
  if (state.inventory.includes("Chave Mestra")) {
    state.location = "sala0";
    renderScene();
    updateHUD();
  } else {
    alert("A porta exige a Chave Mestra.");
  }
}

function triggerEnding() {
  const totalPistas = state.clues.length;
  showDialogue("Máquina Central", "Escolha o destino do tempo:", [
    {
      text: "Encerrar o Ciclo",
      callback: () => {
        if (totalPistas >= 7) {
          alert("FINAL 1 — A VERDADE: Você desativa o ciclo temporal e acorda no mundo real.");
        } else {
          alert("FINAL 4 — PERDIDO: Você desativa a máquina sem entender tudo e fica preso na escuridão.");
        }
        location.reload();
      }
    },
    {
      text: "Aceitar o Trem",
      callback: () => {
        alert("FINAL 3 — CICLO: O tempo é reiniciado. Você acorda novamente às 23:45.");
        location.reload();
      }
    }
  ]);
}

window.onload = init;
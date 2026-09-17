/**
 * Último Trem — script.js (boilerplate funcional)
 * Integrado com o HTML/CSS melhorados (acessibilidade, mobile, PWA)
 * 
 * @author Sabiá-4
 * @version 1.1
 */

// ══════════════════════════════════════════════════════════════════════════
//  UTILS / HELPERS
// ══════════════════════════════════════════════════════════════════════════

function $$(selector) {
    return document.querySelectorAll(selector);
}
function $(selector) {
    return document.querySelector(selector);
}

function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
}

// ── Notificação acessível ──
class Notificacao {
    constructor() {
        this.el = $("#notification");
        this.textEl = $("#notificationText");
        this.iconEl = $("#notificationIcon");
        this.timeout = null;
    }

    mostrar({ texto, tipo = "info", tempo = 2500 }) {
        if (this.timeout) clearTimeout(this.timeout);

        // Define ícone e cor
        let icon = "!";
        let bgColor = "#151a27";
        switch (tipo) {
            case "sucesso":
                icon = "✅";
                bgColor = "#182b25";
                break;
            case "alerta":
                icon = "⚠️";
                bgColor = "#3a251a";
                break;
            case "erro":
                icon = "❌";
                bgColor = "#3a1a1a";
                break;
            case "info":
            default:
                icon = "!";
                bgColor = "#151a27";
        }

        this.iconEl.textContent = icon;
        this.textEl.textContent = texto;
        this.el.style.background = bgColor;
        this.el.classList.remove("show");
        // Forçar reflow para garantir animação
        void this.el.offsetWidth;
        this.el.classList.add("show");

        // ARIA live region já faz o leitor de tela ler
        if (tempo > 0) {
            this.timeout = setTimeout(() => this.esconder(), tempo);
        }
    }

    esconder() {
        if (this.timeout) clearTimeout(this.timeout);
        this.el.classList.remove("show");
    }
}

// ══════════════════════════════════════════════════════════════════════════
//  GERENCIADOR DE TELAS E MODAIS
// ══════════════════════════════════════════════════════════════════════════

class Tela {
    static ativa = null;

    static mudarPara(id) {
        // Esconde todas as telas
        $$(".screen").forEach(el => el.classList.remove("active"));
        // Mostra a desejada
        const tela = $(`#${id}`);
        if (tela) {
            tela.classList.add("active");
            tela.setAttribute("tabindex", "-1");
            tela.focus?.(); // foca para navegação por teclado
            this.ativa = id;
        }
    }
}

class Modal {
    /**
     * Abre um modal e impede scroll no body
     * @param {string} id - ID do modal (sem #)
     */
    static abrir(id) {
        const modal = $(`#${id}`);
        if (!modal) return;
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
        // Foca no primeiro botão de fechar ou no primeiro input
        const fechar = modal.querySelector(".close-modal, .dialogueContinue");
        fechar?.focus();
    }

    static fechar(id) {
        const modal = $(`#${id}`);
        if (!modal) return;
        modal.classList.remove("active");
        document.body.style.overflow = "";
        // Retorna foco para o botão que abriu (se houver)
        // ...implementação opcional
    }

    static fecharTodos() {
        $$(".modal").forEach(m => m.classList.remove("active"));
        document.body.style.overflow = "";
    }
}

// ══════════════════════════════════════════════════════════════════════════
//  SISTEMA DE SAVE (localStorage)
// ══════════════════════════════════════════════════════════════════════════

class Save {
    static STORAGE_KEY = "ultimo-trem-save-v1";

    static salvar(dados) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dados));
            notificacao.mostrar({
                texto: "Jogo salvo com sucesso.",
                tipo: "sucesso",
                tempo: 1500
            });
        } catch (e) {
            notificacao.mostrar({
                texto: "Erro ao salvar. Espaço insuficiente.",
                tipo: "erro"
            });
        }
    }

    static carregar() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    static existe() {
        return !!localStorage.getItem(this.STORAGE_KEY);
    }

    static apagar() {
        localStorage.removeItem(this.STORAGE_KEY);
        notificacao.mostrar({
            texto: "Progresso apagado.",
            tipo: "alerta",
            tempo: 1800
        });
    }
}

// ══════════════════════════════════════════════════════════════════════════
//  ESTADO DO JOGADOR (mock — substitua pelo seu sistema)
// ══════════════════════════════════════════════════════════════════════════

const jogador = {
    nome: "Alex",
    nivel: 1,
    xp: 0,
    maxXp: 100,
    vidas: 3,
    energia: 100,
    moedas: 20,
    pistas: 0,
    missaoAtual: 0, // índice da missão
    inventario: [
        { nome: "Bilhete antigo", icon: "🎫", desc: "Bilhete amassado com um código riscado." }
    ],
    missaoConcluida: [false, false, false]
};

// Missões de exemplo — substitua pelo seu sistema
const missoes = [
    {
        titulo: "Descubra onde você está.",
        descricao: "Explore a Estação Central e encontre alguma pista.",
        completa: false
    },
    {
        titulo: "Encontre o bilhete perdido",
        descricao: "Procure pelo bilhete que alguém deixou cair.",
        completa: false
    },
    {
        titulo: "Decifre o código",
        descricao: "Use a pista encontrada para abrir o terminal de segurança.",
        completa: false
    }
];

// ══════════════════════════════════════════════════════════════════════════
//  ATUALIZAÇÃO DO PAINEL (UI)
// ══════════════════════════════════════════════════════════════════════════

function atualizarPainel() {
    // ── LÓGICA DO JOGO: atualize estes elementos conforme seu estado ──
    $("#playerName").textContent = jogador.nome;
    $("#level").textContent = jogador.nivel;
    $("#xpBar").style.width = `${(jogador.xp / jogador.maxXp) * 100}%`;
    $("#lives").textContent = jogador.vidas;
    $("#energy").textContent = jogador.energia;
    $("#coins").textContent = jogador.moedas;
    $("#clues").textContent = jogador.pistas;

    // Missão atual
    const missao = missoes[jogador.missaoAtual];
    if (missao) {
        $("#currentMission").textContent = missao.titulo;
        $("#missionDescription").textContent = missao.descricao;
    }
}

// ══════════════════════════════════════════════════════════════════════════
//  INVENTÁRIO (modal)
// ══════════════════════════════════════════════════════════════════════════

function renderizarInventario() {
    const list = $("#inventoryList");
    if (!list) return;
    list.innerHTML = "";

    if (jogador.inventario.length === 0) {
        list.innerHTML = `<div class="item"><em>Nenhum item.</em></div>`;
        return;
    }

    jogador.inventario.forEach(item => {
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `
            <div class="item-icon">${item.icon || "📦"}</div>
            <div class="item-name">${item.nome}</div>
            <div class="item-description">${item.desc || ""}</div>
        `;
        list.appendChild(div);
    });
}

// ══════════════════════════════════════════════════════════════════════════
//  MISSÕES (modal)
// ══════════════════════════════════════════════════════════════════════════

function renderizarMissoes() {
    const list = $("#missionsList");
    if (!list) return;
    list.innerHTML = "";

    missoes.forEach((missao, i) => {
        const div = document.createElement("div");
        div.className = `mission-item${missao.completa ? " completed" : ""}`;
        div.innerHTML = `
            <h3>${missao.titulo}</h3>
            <p>${missao.descricao}</p>
            <small>
                ${missao.completa ? "✅ Concluída" : "⏳ Em andamento"}
            </small>
        `;
        list.appendChild(div);
    });
}

// ══════════════════════════════════════════════════════════════════════════
//  CONTROLES E INTERAÇÃO
// ══════════════════════════════════════════════════════════════════════════

// ── Teclado ──
function handleTeclado(e) {
    // ── LÓGICA DO JOGO: implemente movimentação e interação no canvas ──
    if (Tela.ativa !== "gameScreen") return;

    // Fecha modais com ESC
    if (e.key === "Escape") {
        Modal.fecharTodos();
        return;
    }

    // Movimentação (WASD / setas)
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
        // JS: implementar movimentação do jogador no canvas
        // console.log("Mover:", e.key);
        return;
    }

    // Interação (E)
    if (e.key === "e" || e.key === "E") {
        // JS: implementar interação com objetos/NPCs
        // Exemplo: mostrar diálogo ou puzzle
        // modalDialogo.abrir(...);
        notificacao.mostrar({ texto: "Interação ativada!", tipo: "info", tempo: 800 });
        return;
    }
}

// ── Controles mobile ──
function setupControlesMobile() {
    // Direcionais
    $$(".dpad button").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const key = btn.dataset.key;
            // Simula tecla
            handleTeclado({ key });
            btn.classList.add("active");
            setTimeout(() => btn.classList.remove("active"), 120);
        });
    });

    // Botão de interação
    const interactBtn = $("#mobileInteract");
    if (interactBtn) {
        interactBtn.addEventListener("click", () => {
            handleTeclado({ key: "e" });
            interactBtn.classList.add("active");
            setTimeout(() => interactBtn.classList.remove("active"), 120);
        });
    }
}

// ══════════════════════════════════════════════════════════════════════════
//  DIÁLOGO (modal)
// ══════════════════════════════════════════════════════════════════════════

// ── Exemplo de diálogo (substitua pelo seu sistema) ──
function abrirDialogoExemplo() {
    // ── LÓGICA DO JOGO: carregue o diálogo do NPC atual ──
    $("#dialogueName").textContent = "Guarda da Estação";
    $("#dialogueText").textContent = "Você não deveria estar aqui a esta hora. O trem já partiu...";
    $("#dialogueChoices").innerHTML = `
        <button class="choice-button" data-idx="0">Perguntar sobre o bilhete</button>
        <button class="choice-button" data-idx="1">Ignorar e seguir</button>
    `;
    Modal.abrir("dialogueModal");

    // Eventos dos botões (um-tap)
    $$("#dialogueChoices .choice-button").forEach(btn => {
        btn.onclick = () => {
            const idx = +btn.dataset.idx;
            // JS: implementar lógica de resposta do diálogo
            Modal.fechar("dialogueModal");
            notificacao.mostrar({ texto: idx === 0 ? "O guarda olhou para você com desconfiança." : "Você seguiu em frente.", tipo: "info" });
        };
    });
}

// ══════════════════════════════════════════════════════════════════════════
//  PUZZLE (modal)
// ══════════════════════════════════════════════════════════════════════════

function abrirPuzzleExemplo() {
    // ── LÓGICA DO JOGO: implementar puzzle dinâmico ──
    let codigo = "";
    function atualizarDisplay() {
        $("#puzzleDisplay").textContent = codigo.padEnd(4, "-");
    }

    atualizarDisplay();

    // Limpa eventos anteriores para evitar duplicidade
    $$(".keypad button").forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });

    // Eventos (re-pegar os novos botões)
    document.querySelectorAll(".keypad button").forEach(btn => {
        btn.addEventListener("click", () => {
            const n = btn.dataset.number;
            if (n === "clear") {
                codigo = "";
            } else if (n === "enter") {
                if (codigo.length === 4) {
                    // ── LÓGICA DO JOGO: verificar código ──
                    if (codigo === "2026") {
                        notificacao.mostrar({ texto: "Código correto! Terminal desbloqueado.", tipo: "sucesso" });
                        Modal.fechar("puzzleModal");
                        // JS: avançar missão, dar pista, etc.
                    } else {
                        notificacao.mostrar({ texto: "Código incorreto.", tipo: "erro" });
                        codigo = "";
                        atualizarDisplay();
                    }
                } else {
                    notificacao.mostrar({ texto: "Digite os 4 dígitos.", tipo: "alerta" });
                }
            } else if (codigo.length < 4 && n >= "0" && n <= "9") {
                codigo += n;
            }
            atualizarDisplay();
        });
    });

    Modal.abrir("puzzleModal");
}

// ══════════════════════════════════════════════════════════════════════════
//  FINAL / ENDING
// ══════════════════════════════════════════════════════════════════════════

function abrirTelaFinal() {
    // ── LÓGICA DO JOGO: monte as estatísticas reais ──
    $("#endingTitle").textContent = "FIM";
    $("#endingText").textContent = "Você desvendou o mistério da Estação Central. O último trem partiu — e você decidiu se juntar aos passageiros... ou não.";
    $("#endingStats").innerHTML = `
        <b>Vidas restantes:</b> ${jogador.vidas} <br>
        <b>Nível:</b> ${jogador.nivel} <br>
        <b>Moedas coletadas:</b> ${jogador.moedas} <br>
        <b>Pistas encontradas:</b> ${jogador.pistas}
    `;
    Modal.abrir("endingModal");
}

// ══════════════════════════════════════════════════════════════════════════
//  MENU PRINCIPAL E SAVE
// ══════════════════════════════════════════════════════════════════════════

function atualizarBotaoContinuar() {
    const btn = $("#continueBtn");
    if (!btn) return;
    btn.disabled = !Save.existe();
}

// ── NOVO JOGO ──
function iniciarNovoJogo() {
    // ── LÓGICA DO JOGO: resetar estado do jogo ──
    // Exemplo: resetar jogador, missões, inventário
    jogador.nivel = 1;
    jogador.xp = 0;
    jogador.vidas = 3;
    jogador.energia = 100;
    jogador.moedas = 20;
    jogador.pistas = 0;
    jogador.inventario = [];
    jogador.missaoAtual = 0;
    missoes.forEach(m => m.completa = false);

    atualizarPainel();
    Save.salvar(jogador); // salva o estado inicial
    Tela.mudarPara("gameScreen");
}

// ── CONTINUAR ──
function continuarJogo() {
    const dados = Save.carregar();
    if (!dados) {
        notificacao.mostrar({ texto: "Nenhum save encontrado.", tipo: "alerta" });
        return;
    }
    // ── LÓGICA DO JOGO: restaurar estado ──
    Object.assign(jogador, dados);
    // Restaurar missões se estiverem no save
    atualizarPainel();
    Tela.mudarPara("gameScreen");
}

// ══════════════════════════════════════════════════════════════════════════
//  EVENTOS GLOBAIS E INICIALIZAÇÃO
// ══════════════════════════════════════════════════════════════════════════

const notificacao = new Notificacao();

function setupEventListeners() {
    // ── MENU ──
    $("#newGameBtn")?.addEventListener("click", () => {
        iniciarNovoJogo();
        notificacao.mostrar({ texto: "Nova jornada iniciada.", tipo: "info", tempo: 1200 });
    });

    $("#continueBtn")?.addEventListener("click", () => {
        continuarJogo();
        notificacao.mostrar({ texto: "Jogo restaurado.", tipo: "sucesso", tempo: 1200 });
    });

    $("#deleteSaveBtn")?.addEventListener("click", () => {
        Save.apagar();
        atualizarBotaoContinuar();
        // Fecha o modal se estiver aberto
        Modal.fechar("menuScreen");
        Tela.mudarPara("menuScreen");
    });

    // ── TOP ACTIONS (header) ──
    $("#inventoryBtn")?.addEventListener("click", () => {
        renderizarInventario();
        Modal.abrir("inventoryModal");
    });

    $("#missionsBtn")?.addEventListener("click", () => {
        renderizarMissoes();
        Modal.abrir("missionsModal");
    });

    $("#saveBtn")?.addEventListener("click", () => {
        Save.salvar(jogador);
    });

    $("#menuBtn")?.addEventListener("click", () => {
        // Pausa o jogo e volta ao menu
        Modal.fecharTodos();
        Tela.mudarPara("menuScreen");
        notificacao.mostrar({ texto: "Retornado ao menu.", tipo: "info", tempo: 800 });
    });

    // ── MODAIS: fechar com × ou clique fora (opcional) ──
    $$(".close-modal").forEach(btn => {
        btn.addEventListener("click", (e) => {
            // Fecha o modal mais próximo
            const modal = e.target.closest(".modal");
            if (modal) modal.classList.remove("active");
            document.body.style.overflow = "";
        });
    });

    // ── MODAL DE DIÁLOGO: continuar ──
    $("#dialogueContinue")?.addEventListener("click", () => {
        Modal.fechar("dialogueModal");
    });

    // ── RESTART (final) ──
    $("#restartBtn")?.addEventListener("click", () => {
        Modal.fechar("endingModal");
        iniciarNovoJogo();
        notificacao.mostrar({ texto: "Nova jornada iniciada.", tipo: "info", tempo: 1200 });
    });

    // ── TECLADO GLOBAL ──
    document.addEventListener("keydown", handleTeclado);

    // ── INTERAÇÃO HINT (mostrar quando próximo de objeto interativo) ──
    // JS: implementar — exibir/esconder #interactionHint conforme posição do jogador
    // Exemplo:
    // $("#interactionHint").classList.add("show"); // quando pode interagir
    // $("#interactionHint").classList.remove("show"); // quando não pode
}

// ══════════════════════════════════════════════════════════════════════════
//  INICIALIZAÇÃO DO APP
// ══════════════════════════════════════════════════════════════════════════

function init() {
    // ── LÓGICA DO JOGO: carregar assets, iniciar canvas, etc. ──
    atualizarBotaoContinuar();
    atualizarPainel();
    setupControlesMobile();
    setupEventListeners();

    // ── DICA: mostrar um tutorial no primeiro acesso ──
    if (!localStorage.getItem("ut-tutorial-shown")) {
        setTimeout(() => {
            notificacao.mostrar({
                texto: "WASD/Setas = mover · E = interagir · 💾 = salvar",
                tipo: "info",
                tempo: 4000
            });
            localStorage.setItem("ut-tutorial-shown", "1");
        }, 600);
    }

    // ── LÓGICA DO JOGO: iniciar loop do canvas, carregar mapa, etc. ──
    // Exemplo: requestAnimationFrame(loopDoJogo);
}

// ══════════════════════════════════════════════════════════════════════════

// ── Inicia quando o DOM estiver pronto ──
document.addEventListener("DOMContentLoaded", init);

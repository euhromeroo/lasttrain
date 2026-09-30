/* =====================================================
   NÚMERO DESCONHECIDO
   PRIMEIRA VERSÃO JOGÁVEL
===================================================== */


/* =====================================================
   ELEMENTOS
===================================================== */

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const endScreen = document.getElementById("endScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const chat = document.getElementById("chat");

const choices = document.getElementById("choices");
const choiceButtons = document.getElementById("choiceButtons");

const clock = document.getElementById("clock");
const onlineStatus = document.getElementById("onlineStatus");

const endTitle = document.getElementById("endTitle");
const endText = document.getElementById("endText");


/* =====================================================
   ESTADO DO JOGO
===================================================== */

let gameStarted = false;

let currentChoice = null;

let playerChoice = null;


/* =====================================================
   HORÁRIO
===================================================== */

let currentHour = 23;
let currentMinute = 41;


function updateClock() {

    const hour = String(currentHour).padStart(2, "0");

    const minute = String(currentMinute).padStart(2, "0");

    clock.textContent = `${hour}:${minute}`;

}


/* =====================================================
   AVANÇAR O HORÁRIO
===================================================== */

function advanceTime(minutes) {

    currentMinute += minutes;

    while (currentMinute >= 60) {

        currentMinute -= 60;

        currentHour++;

        if (currentHour >= 24) {
            currentHour = 0;
        }

    }

    updateClock();

}


/* =====================================================
   LIMPAR CHAT
===================================================== */

function clearChat() {

    chat.innerHTML = `
        <div class="date-divider">
            HOJE
        </div>
    `;

}


/* =====================================================
   CRIAR MENSAGEM
===================================================== */

function addMessage(text, sender = "stranger") {

    const message = document.createElement("div");

    message.className = `message ${sender}`;

    const time = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;

    message.innerHTML = `
        ${text}
        <span class="message-time">${time}</span>
    `;

    chat.appendChild(message);

    scrollChat();

}


/* =====================================================
   ROLAGEM
===================================================== */

function scrollChat() {

    setTimeout(() => {

        chat.scrollTop = chat.scrollHeight;

    }, 50);

}


/* =====================================================
   INDICADOR DE DIGITAÇÃO
===================================================== */

function showTyping(duration = 1300) {

    return new Promise(resolve => {

        const typing = document.createElement("div");

        typing.className = "typing";

        typing.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;

        chat.appendChild(typing);

        scrollChat();

        setTimeout(() => {

            typing.remove();

            resolve();

        }, duration);

    });

}


/* =====================================================
   MOSTRAR ESCOLHAS
===================================================== */

function showChoices(options) {

    choices.classList.remove("hidden");

    choiceButtons.innerHTML = "";

    options.forEach((option, index) => {

        const button = document.createElement("button");

        button.className = "choice-button";

        button.textContent = option.text;

        button.addEventListener("click", () => {

            selectChoice(index, option);

        });

        choiceButtons.appendChild(button);

    });

}


/* =====================================================
   ESCOLHER RESPOSTA
===================================================== */

async function selectChoice(index, option) {

    choices.classList.add("hidden");

    choiceButtons.innerHTML = "";

    playerChoice = index;

    addMessage(option.text, "player");

    advanceTime(1);

    await showTyping(1100);

    await option.action();

}


/* =====================================================
   INÍCIO DO JOGO
===================================================== */

async function startGame() {

    if (gameStarted) return;

    gameStarted = true;

    startScreen.classList.add("hidden");

    endScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");

    clearChat();

    currentHour = 23;
    currentMinute = 41;

    updateClock();

    onlineStatus.textContent = "online agora";

    await sleep(700);

    await showTyping(1500);

    addMessage(
        "Não conte para ninguém que eu estou falando com você."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1300);

    addMessage(
        "Eu preciso saber se você ainda tem uma coisa que pertence a mim."
    );

    advanceTime(1);

    await sleep(700);

    await showTyping(1200);

    showChoices([

        {
            text: "Quem é você?",
            action: firstChoiceWho
        },

        {
            text: "Como você conseguiu meu número?",
            action: firstChoiceHow
        }

    ]);

}


/* =====================================================
   ESCOLHA 1
   "QUEM É VOCÊ?"
===================================================== */

async function firstChoiceWho() {

    await showTyping(1400);

    addMessage(
        "Você realmente não reconhece o número?"
    );

    advanceTime(1);

    await sleep(700);

    await showTyping(1200);

    addMessage(
        "Talvez seja melhor assim."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1500);

    addMessage(
        "Mas você precisa me responder uma coisa."
    );

    advanceTime(1);

    await sleep(800);

    await showTyping(1300);

    addMessage(
        "Você ainda guarda a caixa azul?"
    );

    advanceTime(1);

    await sleep(700);

    showChoices([

        {
            text: "Sim. Por quê?",
            action: answerBoxYes
        },

        {
            text: "Que caixa?",
            action: answerBoxNo
        }

    ]);

}


/* =====================================================
   ESCOLHA 2
   "COMO CONSEGUIU MEU NÚMERO?"
===================================================== */

async function firstChoiceHow() {

    await showTyping(1400);

    addMessage(
        "Eu conheço alguém que conhece você."
    );

    advanceTime(1);

    await sleep(700);

    await showTyping(1200);

    addMessage(
        "Isso é tudo que você precisa saber por enquanto."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1300);

    addMessage(
        "Mas eu não estou falando com você por acaso."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1200);

    addMessage(
        "Você ainda guarda a caixa azul?"
    );

    advanceTime(1);

    await sleep(700);

    showChoices([

        {
            text: "Sim. Por quê?",
            action: answerBoxYes
        },

        {
            text: "Que caixa?",
            action: answerBoxNo
        }

    ]);

}


/* =====================================================
   CAIXA — SIM
===================================================== */

async function answerBoxYes() {

    await showTyping(1500);

    addMessage(
        "Então ela realmente está com você."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1300);

    addMessage(
        "Escute com atenção."
    );

    advanceTime(1);

    await sleep(800);

    await showTyping(1400);

    addMessage(
        "Não abra a caixa ainda."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1500);

    addMessage(
        "E principalmente..."
    );

    advanceTime(1);

    await sleep(1000);

    await showTyping(1500);

    addMessage(
        "não deixe ninguém saber que ela está com você."
    );

    advanceTime(1);

    await sleep(1000);

    await showTyping(1600);

    addMessage(
        "Se você quiser descobrir o que aconteceu naquela noite, eu posso te ajudar."
    );

    advanceTime(1);

    await sleep(900);

    showChoices([

        {
            text: "Eu quero saber a verdade.",
            action: truthPath
        },

        {
            text: "Quem está atrás disso?",
            action: dangerPath
        }

    ]);

}


/* =====================================================
   CAIXA — NÃO
===================================================== */

async function answerBoxNo() {

    await showTyping(1400);

    addMessage(
        "Não minta para mim."
    );

    advanceTime(1);

    await sleep(1000);

    await showTyping(1500);

    addMessage(
        "Eu sei que ela está aí."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1500);

    addMessage(
        "E agora sei que você não vai me contar a verdade."
    );

    advanceTime(1);

    await sleep(900);

    addMessage(
        "Isso torna tudo muito mais complicado."
    );

    advanceTime(1);

    await sleep(1000);

    showChoices([

        {
            text: "Quem é você?",
            action: liePath
        },

        {
            text: "O que você quer de mim?",
            action: questionPath
        }

    ]);

}


/* =====================================================
   CAMINHO DA VERDADE
===================================================== */

async function truthPath() {

    await showTyping(1500);

    addMessage(
        "Então procure dentro da caixa."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1500);

    addMessage(
        "Você vai encontrar uma fotografia."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1300);

    addMessage(
        "Olhe para o canto esquerdo dela."
    );

    advanceTime(1);

    await sleep(1000);

    await showTyping(1500);

    addMessage(
        "Quando descobrir quem está naquela foto, me mande apenas o nome."
    );

    advanceTime(1);

    await sleep(1000);

    finishGame(
        "A PISTA",
        "Você decidiu descobrir a verdade. A fotografia pode ser a primeira peça de um mistério muito maior."
    );

}


/* =====================================================
   CAMINHO DO PERIGO
===================================================== */

async function dangerPath() {

    await showTyping(1500);

    addMessage(
        "Essa é exatamente a pergunta que você não deveria fazer."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1400);

    addMessage(
        "Porque talvez a pessoa que está atrás disso já esteja perto de você."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1400);

    addMessage(
        "Muito mais perto do que você imagina."
    );

    advanceTime(1);

    finishGame(
        "VOCÊ FOI LONGE DEMAIS",
        "Algumas perguntas chamam atenção. E alguém percebeu que você está investigando."
    );

}


/* =====================================================
   CAMINHO DA MENTIRA
===================================================== */

async function liePath() {

    await showTyping(1400);

    addMessage(
        "Você ainda não entendeu."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1500);

    addMessage(
        "Eu não estou tentando descobrir se você tem a caixa."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1500);

    addMessage(
        "Estou tentando descobrir se posso confiar em você."
    );

    advanceTime(1);

    await sleep(900);

    finishGame(
        "CONFIANÇA",
        "Você escondeu a verdade. Agora o desconhecido também vai esconder coisas de você."
    );

}


/* =====================================================
   CAMINHO DA PERGUNTA
===================================================== */

async function questionPath() {

    await showTyping(1500);

    addMessage(
        "Quero apenas uma coisa."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1300);

    addMessage(
        "Que você não entregue a caixa para ninguém."
    );

    advanceTime(1);

    await sleep(1000);

    await showTyping(1500);

    addMessage(
        "Principalmente para a pessoa que vai bater na sua porta amanhã."
    );

    advanceTime(1);

    await sleep(1200);

    finishGame(
        "AMANHÃ",
        "Você ainda não sabe quem vai aparecer na sua porta. Mas agora sabe que alguém está vindo."
    );

}


/* =====================================================
   FINAL DO JOGO
===================================================== */

function finishGame(title, text) {

    gameScreen.classList.add("hidden");

    endScreen.classList.remove("hidden");

    endTitle.textContent = title;

    endText.textContent = text;

    gameStarted = false;

}


/* =====================================================
   REINICIAR
===================================================== */

function restartGame() {

    endScreen.classList.add("hidden");

    startScreen.classList.remove("hidden");

    gameStarted = false;

    currentHour = 23;
    currentMinute = 41;

    updateClock();

}


/* =====================================================
   UTILIDADE
===================================================== */

function sleep(ms) {

    return new Promise(resolve => {

        setTimeout(resolve, ms);

    });

}


/* =====================================================
   EVENTOS
===================================================== */

startButton.addEventListener(
    "click",
    startGame
);

restartButton.addEventListener(
    "click",
    restartGame
);


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

updateClock();
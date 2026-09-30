/* =====================================================
   NÚMERO DESCONHECIDO — V2
===================================================== */


/* =====================================================
   ELEMENTOS
===================================================== */

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const endScreen = document.getElementById("endScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const homeScreen = document.getElementById("homeScreen");

const chat = document.getElementById("chat");
const choices = document.getElementById("choices");
const choiceButtons = document.getElementById("choiceButtons");

const phoneClock = document.getElementById("phoneClock");
const homeTime = document.getElementById("homeTime");

const notificationArea = document.getElementById("notificationArea");

const messageBadge = document.getElementById("messageBadge");
const clueBadge = document.getElementById("clueBadge");

const cluesList = document.getElementById("cluesList");

const lockedPhoto = document.getElementById("lockedPhoto");
const photoUnlocked = document.getElementById("photoUnlocked");

const playerNotes = document.getElementById("playerNotes");

const endTitle = document.getElementById("endTitle");
const endText = document.getElementById("endText");

const callButton = document.getElementById("callButton");


/* =====================================================
   ESTADO
===================================================== */

let gameStarted = false;

let currentHour = 23;
let currentMinute = 41;

let trust = 0;
let suspicion = 0;

let clues = [];

let photoUnlockedState = false;

let messageBadgeCount = 1;

let currentApp = "home";


/* =====================================================
   CONTROLE DE APLICATIVOS
===================================================== */

const apps = document.querySelectorAll("[data-app]");

apps.forEach(button => {

    button.addEventListener("click", () => {

        openApp(button.dataset.app);

    });

});


const backButtons = document.querySelectorAll("[data-back]");

backButtons.forEach(button => {

    button.addEventListener("click", () => {

        openApp("home");

    });

});


/* =====================================================
   ABRIR APLICATIVO
===================================================== */

function openApp(appName) {

    document.querySelectorAll(".phone-screen").forEach(screen => {

        screen.classList.add("hidden");

    });

    if (appName === "home") {

        homeScreen.classList.remove("hidden");

        currentApp = "home";

        return;
    }

    const target = document.getElementById(`${appName}App`);

    if (!target) return;

    target.classList.remove("hidden");

    currentApp = appName;

    if (appName === "messages") {

        messageBadgeCount = 0;

        messageBadge.classList.add("hidden");

        setTimeout(scrollChat, 100);

    }

    if (appName === "clues") {

        renderClues();

    }

    if (appName === "gallery") {

        updateGallery();

    }

}


/* =====================================================
   RELÓGIO
===================================================== */

function updateClock() {

    const hour = String(currentHour).padStart(2, "0");

    const minute = String(currentMinute).padStart(2, "0");

    const time = `${hour}:${minute}`;

    phoneClock.textContent = time;

    homeTime.textContent = time;

}


/* =====================================================
   AVANÇAR TEMPO
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
   ADICIONAR MENSAGEM
===================================================== */

function addMessage(text, sender = "stranger") {

    const message = document.createElement("div");

    message.className = `message ${sender}`;

    const time =
        `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;

    message.innerHTML = `
        ${text}
        <span class="message-time">${time}</span>
    `;

    chat.appendChild(message);

    scrollChat();

}


/* =====================================================
   ROLAR CHAT
===================================================== */

function scrollChat() {

    setTimeout(() => {

        chat.scrollTop = chat.scrollHeight;

    }, 50);

}


/* =====================================================
   DIGITANDO
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
   ESCOLHAS
===================================================== */

function showChoices(options) {

    choices.classList.remove("hidden");

    choiceButtons.innerHTML = "";

    options.forEach(option => {

        const button = document.createElement("button");

        button.className = "choice-button";

        button.textContent = option.text;

        button.addEventListener("click", async () => {

            choices.classList.add("hidden");

            addMessage(option.text, "player");

            advanceTime(1);

            await showTyping(1100);

            await option.action();

        });

        choiceButtons.appendChild(button);

    });

}


/* =====================================================
   NOTIFICAÇÃO
===================================================== */

function notify(title, text) {

    notificationArea.innerHTML = `
        <div class="notification">
            <strong>${title}</strong>
            <span>${text}</span>
        </div>
    `;

    setTimeout(() => {

        notificationArea.innerHTML = "";

    }, 6000);

}


/* =====================================================
   PISTAS
===================================================== */

function addClue(title, description) {

    if (clues.some(clue => clue.title === title)) {
        return;
    }

    clues.push({
        title,
        description
    });

    clueBadge.textContent = clues.length;

    clueBadge.classList.remove("hidden");

    renderClues();

    notify(
        "Nova pista",
        title
    );

}


/* =====================================================
   MOSTRAR PISTAS
===================================================== */

function renderClues() {

    if (clues.length === 0) {

        cluesList.innerHTML = `
            <div class="empty-clues">
                Nenhuma pista encontrada.
            </div>
        `;

        return;
    }

    cluesList.innerHTML = "";

    clues.forEach(clue => {

        const element = document.createElement("div");

        element.className = "clue";

        element.innerHTML = `
            <strong>${clue.title}</strong>
            <p>${clue.description}</p>
        `;

        cluesList.appendChild(element);

    });

}


/* =====================================================
   GALERIA
===================================================== */

function updateGallery() {

    if (photoUnlockedState) {

        lockedPhoto.classList.add("hidden");

        photoUnlocked.classList.remove("hidden");

    } else {

        lockedPhoto.classList.remove("hidden");

        photoUnlocked.classList.add("hidden");

    }

}


/* =====================================================
   DESBLOQUEAR FOTO
===================================================== */

function unlockPhoto() {

    photoUnlockedState = true;

    updateGallery();

    addClue(
        "Fotografia de 14 de outubro",
        "Uma pessoa aparece ao fundo. Você não consegue identificar quem é."
    );

}


/* =====================================================
   INICIAR
===================================================== */

async function startGame() {

    if (gameStarted) return;

    gameStarted = true;

    startScreen.classList.add("hidden");

    endScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");

    openApp("messages");

    clearChat();

    currentHour = 23;
    currentMinute = 41;

    trust = 0;
    suspicion = 0;

    clues = [];

    photoUnlockedState = false;

    updateClock();

    renderClues();

    await sleep(800);

    await showTyping(1500);

    addMessage(
        "Não conte para ninguém que eu estou falando com você."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1400);

    addMessage(
        "Eu preciso saber se você ainda tem uma coisa que pertence a mim."
    );

    advanceTime(1);

    await sleep(800);

    showChoices([

        {
            text: "Quem é você?",
            action: askWho
        },

        {
            text: "Como conseguiu meu número?",
            action: askHow
        }

    ]);

}


/* =====================================================
   QUEM É VOCÊ?
===================================================== */

async function askWho() {

    suspicion++;

    await showTyping(1400);

    addMessage(
        "Você realmente não reconhece o número?"
    );

    advanceTime(1);

    await sleep(800);

    await showTyping(1200);

    addMessage(
        "Talvez seja melhor assim."
    );

    advanceTime(1);

    await sleep(800);

    await showTyping(1300);

    addMessage(
        "Mas você precisa responder uma coisa."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Você ainda guarda a caixa azul?"
    );

    advanceTime(1);

    showChoices([

        {
            text: "Sim. Por quê?",
            action: boxYes
        },

        {
            text: "Que caixa?",
            action: boxNo
        }

    ]);

}


/* =====================================================
   COMO CONSEGUIU MEU NÚMERO?
===================================================== */

async function askHow() {

    trust++;

    await showTyping(1400);

    addMessage(
        "Eu conheço alguém que conhece você."
    );

    advanceTime(1);

    await sleep(800);

    await showTyping(1300);

    addMessage(
        "Não faça mais perguntas sobre isso."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1400);

    addMessage(
        "Você ainda guarda a caixa azul?"
    );

    advanceTime(1);

    showChoices([

        {
            text: "Sim. Por quê?",
            action: boxYes
        },

        {
            text: "Que caixa?",
            action: boxNo
        }

    ]);

}


/* =====================================================
   CAIXA — SIM
===================================================== */

async function boxYes() {

    trust++;

    await showTyping(1400);

    addMessage(
        "Então ela realmente está com você."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1400);

    addMessage(
        "Não abra a caixa ainda."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1500);

    addMessage(
        "Dentro dela existe algo que pode explicar tudo."
    );

    advanceTime(1);

    addClue(
        "A caixa azul",
        "O desconhecido sabe que você possui uma caixa azul e afirma que ela contém algo importante."
    );

    await sleep(1000);

    showChoices([

        {
            text: "Eu quero descobrir a verdade.",
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

async function boxNo() {

    suspicion++;

    await showTyping(1400);

    addMessage(
        "Não minta para mim."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1400);

    addMessage(
        "Eu sei que ela está aí."
    );

    advanceTime(1);

    await sleep(900);

    addClue(
        "Ele sabe demais",
        "O desconhecido parece saber detalhes sobre você que não deveria conhecer."
    );

    await showTyping(1300);

    addMessage(
        "Agora preciso saber se posso confiar em você."
    );

    advanceTime(1);

    showChoices([

        {
            text: "O que você quer de mim?",
            action: whatWant
        },

        {
            text: "Quem é você?",
            action: liePath
        }

    ]);

}


/* =====================================================
   VERDADE
===================================================== */

async function truthPath() {

    trust++;

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

    addMessage(
        "Olhe para o canto esquerdo dela."
    );

    advanceTime(1);

    unlockPhoto();

    await sleep(900);

    showChoices([

        {
            text: "Vou olhar a fotografia.",
            action: inspectPhoto
        },

        {
            text: "Antes disso, quem está nela?",
            action: askPhotoPerson
        }

    ]);

}


/* =====================================================
   PERIGO
===================================================== */

async function dangerPath() {

    suspicion++;

    await showTyping(1500);

    addMessage(
        "Essa é exatamente a pergunta que você não deveria fazer."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1400);

    addMessage(
        "Porque talvez essa pessoa já esteja perto de você."
    );

    advanceTime(1);

    addClue(
        "Alguém está perto",
        "O desconhecido afirma que a pessoa envolvida pode estar próxima de você."
    );

    await sleep(1000);

    finishGame(
        "VOCÊ FOI LONGE DEMAIS",
        "Suas perguntas chamaram atenção. Agora alguém sabe que você está investigando."
    );

}


/* =====================================================
   INSPECIONAR FOTO
===================================================== */

async function inspectPhoto() {

    addMessage(
        "Vou olhar a fotografia."
        ,
        "player"
    );

    await showTyping(1300);

    addMessage(
        "Você percebe uma pessoa no canto esquerdo."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Mas existe algo ainda mais estranho."
    );

    advanceTime(1);

    await showTyping(1400);

    addMessage(
        "A pessoa da fotografia parece estar olhando diretamente para a câmera."
    );

    addClue(
        "A pessoa na fotografia",
        "Uma figura aparece ao fundo olhando diretamente para a câmera."
    );

    playerNotes.textContent =
        "A pessoa da fotografia parece estar me observando.\n\n" +
        "O desconhecido sabe sobre a caixa azul.\n\n" +
        "Preciso descobrir quem tirou essa fotografia.";

    await sleep(1200);

    showChoices([

        {
            text: "Quem tirou essa foto?",
            action: photoQuestion
        },

        {
            text: "Por que essa pessoa está olhando para a câmera?",
            action: photoLook
        }

    ]);

}


/* =====================================================
   PERGUNTAR QUEM ESTÁ NA FOTO
===================================================== */

async function askPhotoPerson() {

    await showTyping(1500);

    addMessage(
        "Você vai descobrir."
    );

    advanceTime(1);

    await sleep(900);

    addMessage(
        "Mas não por mim."
    );

    advanceTime(1);

    await sleep(900);

    finishGame(
        "A PRIMEIRA PISTA",
        "Você descobriu que existe uma fotografia escondida. Mas ainda não sabe quem está nela."
    );

}


/* =====================================================
   QUEM TIROU A FOTO?
===================================================== */

async function photoQuestion() {

    await showTyping(1400);

    addMessage(
        "A pessoa que tirou a fotografia não queria que ela existisse."
    );

    advanceTime(1);

    await sleep(900);

    addClue(
        "Fotografia proibida",
        "A fotografia aparentemente não deveria existir."
    );

    finishGame(
        "NÃO ERA PARA VOCÊ VER",
        "A fotografia revelou mais perguntas do que respostas."
    );

}


/* =====================================================
   PESSOA OLHANDO
===================================================== */

async function photoLook() {

    await showTyping(1400);

    addMessage(
        "Porque talvez ela soubesse que aquela foto seria encontrada."
    );

    advanceTime(1);

    await sleep(900);

    addClue(
        "A fotografia foi deixada de propósito",
        "A posição da pessoa na fotografia pode indicar que ela sabia que seria observada."
    );

    finishGame(
        "A MENSAGEM ESCONDIDA",
        "A fotografia não parece ser apenas uma lembrança. Ela pode ter sido deixada como uma mensagem."
    );

}


/* =====================================================
   O QUE VOCÊ QUER?
===================================================== */

async function whatWant() {

    trust = Math.max(0, trust - 1);

    await showTyping(1400);

    addMessage(
        "Quero que você fique longe da caixa."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1500);

    addMessage(
        "Quanto menos você souber, mais seguro estará."
    );

    advanceTime(1);

    finishGame(
        "SILÊNCIO",
        "Você decidiu não seguir as pistas. Talvez tenha evitado algo perigoso. Ou talvez tenha perdido a única chance de descobrir a verdade."
    );

}


/* =====================================================
   MENTIRA
===================================================== */

async function liePath() {

    suspicion += 2;

    await showTyping(1400);

    addMessage(
        "Você ainda não entendeu."
    );

    advanceTime(1);

    await sleep(900);

    addMessage(
        "Eu não estou tentando descobrir se você tem a caixa."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1400);

    addMessage(
        "Estou tentando descobrir se posso confiar em você."
    );

    advanceTime(1);

    finishGame(
        "CONFIANÇA",
        "Você escondeu a verdade. Agora o desconhecido também vai esconder coisas de você."
    );

}


/* =====================================================
   LIGAÇÃO
===================================================== */

callButton.addEventListener("click", async () => {

    callButton.textContent = "CONECTANDO...";

    await sleep(1800);

    callButton.textContent = "CHAMADA ENCERRADA";

    addClue(
        "Chamada desconhecida",
        "Uma tentativa de ligação apareceu no telefone. A chamada durou apenas alguns segundos."
    );

    notify(
        "Telefone",
        "Chamada perdida de Número Desconhecido."
    );

    setTimeout(() => {

        callButton.textContent = "LIGAR PARA O NÚMERO";

    }, 2500);

});


/* =====================================================
   FINAL
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

    trust = 0;
    suspicion = 0;

    clues = [];

    photoUnlockedState = false;

    messageBadgeCount = 1;

    messageBadge.classList.remove("hidden");

    clueBadge.textContent = "0";

    clueBadge.classList.add("hidden");

    notificationArea.innerHTML = "";

    playerNotes.textContent =
        "Ainda não escrevi nada...";

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
   INICIALIZAÇÃO
===================================================== */

startButton.addEventListener(
    "click",
    startGame
);

restartButton.addEventListener(
    "click",
    restartGame
);

updateClock();
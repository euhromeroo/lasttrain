/* =====================================================
   NÚMERO DESCONHECIDO
   CAPÍTULO 1 — A CAIXA AZUL
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
   ESTADO DO JOGO
===================================================== */

let gameStarted = false;

let currentHour = 23;
let currentMinute = 41;

let trust = 0;
let suspicion = 0;

let clues = [];

let photoUnlockedState = false;

let boxConfirmed = false;
let photoInspected = false;
let callMade = false;
let askedName = false;
let discoveredDate = false;
let discoveredInitials = false;

let storyProgress = 0;


/* =====================================================
   NAVEGAÇÃO
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


function openApp(appName) {

    document.querySelectorAll(".phone-screen").forEach(screen => {

        screen.classList.add("hidden");

    });

    if (appName === "home") {

        homeScreen.classList.remove("hidden");

        return;
    }

    const target = document.getElementById(`${appName}App`);

    if (!target) return;

    target.classList.remove("hidden");

    if (appName === "messages") {

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
   CHAT
===================================================== */

function clearChat() {

    chat.innerHTML = `
        <div class="date-divider">
            HOJE
        </div>
    `;

}


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


function scrollChat() {

    setTimeout(() => {

        chat.scrollTop = chat.scrollHeight;

    }, 50);

}


function showTyping(duration = 1200) {

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


function sleep(ms) {

    return new Promise(resolve => {

        setTimeout(resolve, ms);

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

            await sleep(500);

            await option.action();

        });

        choiceButtons.appendChild(button);

    });

}


/* =====================================================
   NOTIFICAÇÕES
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
        "Nova pista encontrada",
        title
    );

}


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


function unlockPhoto() {

    if (photoUnlockedState) return;

    photoUnlockedState = true;

    updateGallery();

    addClue(
        "Fotografia de 14 de outubro",
        "Uma pessoa aparece ao fundo da fotografia. A imagem parece ter sido tirada às 22:18."
    );

}


/* =====================================================
   INÍCIO
===================================================== */

async function startGame() {

    if (gameStarted) return;

    gameStarted = true;

    startScreen.classList.add("hidden");
    endScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");

    currentHour = 23;
    currentMinute = 41;

    trust = 0;
    suspicion = 0;

    clues = [];

    boxConfirmed = false;
    photoInspected = false;
    callMade = false;
    askedName = false;
    discoveredDate = false;
    discoveredInitials = false;

    storyProgress = 0;

    messageBadge.classList.remove("hidden");

    clueBadge.classList.add("hidden");
    clueBadge.textContent = "0";

    notificationArea.innerHTML = "";

    playerNotes.textContent =
        "Ainda não escrevi nada...";

    updateClock();

    renderClues();

    clearChat();

    openApp("messages");

    await sleep(1000);

    await showTyping(1500);

    addMessage(
        "Não conte para ninguém que eu estou falando com você."
    );

    advanceTime(1);

    await sleep(1000);

    await showTyping(1400);

    addMessage(
        "Eu sei que isso parece estranho."
    );

    advanceTime(1);

    await sleep(900);

    await showTyping(1400);

    addMessage(
        "Mas eu preciso saber se a caixa azul ainda está com você."
    );

    advanceTime(1);

    showChoices([

        {
            text: "Quem é você?",
            action: firstWho
        },

        {
            text: "Como conseguiu meu número?",
            action: firstHow
        },

        {
            text: "Que caixa azul?",
            action: firstBox
        }

    ]);

}


/* =====================================================
   PRIMEIRA ESCOLHA — QUEM?
===================================================== */

async function firstWho() {

    suspicion++;

    askedName = true;

    await showTyping(1400);

    addMessage(
        "Você realmente não reconhece o número?"
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Meu nome não importa agora."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "O que importa é o que está dentro daquela caixa."
    );

    addClue(
        "O desconhecido evita dizer o próprio nome",
        "Quando você perguntou quem ele é, ele mudou de assunto e voltou a falar sobre a caixa azul."
    );

    await sleep(900);

    showChoices([

        {
            text: "Então me diga o que tem dentro dela.",
            action: askBoxContent
        },

        {
            text: "Se você não diz quem é, não vou confiar em você.",
            action: challengeTrust
        }

    ]);

}


/* =====================================================
   PRIMEIRA ESCOLHA — COMO?
===================================================== */

async function firstHow() {

    trust++;

    await showTyping(1400);

    addMessage(
        "Eu consegui seu número através de uma pessoa que você conhece."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Não vou dizer quem."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Ainda não."
    );

    addClue(
        "Alguém conhecido passou seu número",
        "O desconhecido afirma que recebeu seu número através de alguém que você conhece."
    );

    await sleep(900);

    showChoices([

        {
            text: "Pelo menos me diga se essa pessoa é alguém próximo de mim.",
            action: askAboutPerson
        },

        {
            text: "Volte a falar sobre a caixa.",
            action: askBoxContent
        }

    ]);

}


/* =====================================================
   PRIMEIRA ESCOLHA — CAIXA
===================================================== */

async function firstBox() {

    suspicion++;

    await showTyping(1300);

    addMessage(
        "Não faça isso."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Não finja que não sabe."
    );

    advanceTime(1);

    await sleep(900);

    addMessage(
        "Ela está no seu quarto."
    );

    addClue(
        "Ele conhece detalhes da sua casa",
        "O desconhecido afirma saber onde a caixa azul está."
    );

    await sleep(900);

    showChoices([

        {
            text: "Como você sabe onde ela está?",
            action: askHowKnows
        },

        {
            text: "O que tem dentro dela?",
            action: askBoxContent
        }

    ]);

}


/* =====================================================
   CONTEÚDO DA CAIXA
===================================================== */

async function askBoxContent() {

    await showTyping(1400);

    addMessage(
        "Uma fotografia."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "E uma coisa que você provavelmente não vai reconhecer."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Mas não abra a caixa ainda."
    );

    advanceTime(1);

    addClue(
        "O conteúdo da caixa",
        "Segundo o desconhecido, há uma fotografia e outro objeto dentro da caixa."
    );

    await sleep(900);

    showChoices([

        {
            text: "Vou abrir.",
            action: openBox
        },

        {
            text: "Por que não posso abrir?",
            action: whyNotOpen
        },

        {
            text: "Quero saber o que é o outro objeto.",
            action: otherObject
        }

    ]);

}


/* =====================================================
   POR QUE NÃO ABRIR?
===================================================== */

async function whyNotOpen() {

    suspicion++;

    await showTyping(1400);

    addMessage(
        "Porque depois que você olhar, não vai conseguir fingir que não sabe."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "E eu preciso que você tenha certeza antes de continuar."
    );

    advanceTime(1);

    addClue(
        "Não existe como voltar atrás",
        "O desconhecido insiste que abrir a caixa mudará o que você sabe sobre a situação."
    );

    await sleep(800);

    showChoices([

        {
            text: "Eu já decidi. Vou abrir.",
            action: openBox
        },

        {
            text: "Você está tentando me assustar?",
            action: accuse
        }

    ]);

}


/* =====================================================
   OUTRO OBJETO
===================================================== */

async function otherObject() {

    await showTyping(1300);

    addMessage(
        "Uma moeda."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Uma moeda antiga."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Ela tem duas letras gravadas."
    );

    addClue(
        "A moeda",
        "Dentro da caixa existe uma moeda antiga com duas letras gravadas."
    );

    discoveredInitials = true;

    await sleep(900);

    showChoices([

        {
            text: "Quais letras?",
            action: askInitials
        },

        {
            text: "Vou abrir a caixa.",
            action: openBox
        }

    ]);

}


/* =====================================================
   LETRAS DA MOEDA
===================================================== */

async function askInitials() {

    await showTyping(1200);

    addMessage(
        "K.R."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Eu nunca descobri o que significavam."
    );

    advanceTime(1);

    await sleep(800);

    addClue(
        "As iniciais K.R.",
        "A moeda possui as letras K.R. gravadas."
    );

    playerNotes.textContent =
        "A caixa azul contém:\n\n" +
        "• Uma fotografia\n" +
        "• Uma moeda antiga com as letras K.R.\n\n" +
        "O desconhecido sabe que a caixa está comigo.";

    showChoices([

        {
            text: "Vou procurar a caixa.",
            action: openBox
        },

        {
            text: "Você deveria saber o que K.R. significa.",
            action: accuse
        }

    ]);

}


/* =====================================================
   ABRIR CAIXA
===================================================== */

async function openBox() {

    boxConfirmed = true;

    await showTyping(1500);

    addMessage(
        "Você abriu?"
    );

    advanceTime(1);

    await sleep(900);

    addMessage(
        "Então me diga o que encontrou primeiro."
    );

    advanceTime(1);

    unlockPhoto();

    await sleep(800);

    showChoices([

        {
            text: "A fotografia.",
            action: foundPhoto
        },

        {
            text: "A moeda.",
            action: foundCoin
        },

        {
            text: "Não vou contar.",
            action: hideContents
        }

    ]);

}


/* =====================================================
   FOTOGRAFIA
===================================================== */

async function foundPhoto() {

    trust++;

    await showTyping(1400);

    addMessage(
        "Olhe o horário."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "22:18."
    );

    advanceTime(1);

    discoveredDate = true;

    addClue(
        "22:18",
        "A fotografia foi registrada às 22:18 do dia 14 de outubro."
    );

    await sleep(800);

    showChoices([

        {
            text: "Por que esse horário é importante?",
            action: askTime
        },

        {
            text: "Quem aparece na fotografia?",
            action: askPersonPhoto
        }

    ]);

}


/* =====================================================
   MOEDA
===================================================== */

async function foundCoin() {

    await showTyping(1300);

    addMessage(
        "As letras."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Você viu as letras?"
    );

    advanceTime(1);

    showChoices([

        {
            text: "K.R.",
            action: askInitialsAgain
        },

        {
            text: "Não consigo entender.",
            action: pretendConfusion
        }

    ]);

}


/* =====================================================
   ESCONDER CONTEÚDO
===================================================== */

async function hideContents() {

    suspicion++;

    await showTyping(1300);

    addMessage(
        "Tudo bem."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Talvez seja melhor você descobrir sozinho."
    );

    advanceTime(1);

    await sleep(700);

    addClue(
        "O desconhecido recuou",
        "Quando você escondeu o que encontrou, ele deixou de pressionar você."
    );

    showChoices([

        {
            text: "O que você está escondendo?",
            action: askWhatHidden
        },

        {
            text: "Vou continuar investigando.",
            action: investigateAlone
        }

    ]);

}


/* =====================================================
   HORÁRIO
===================================================== */

async function askTime() {

    await showTyping(1400);

    addMessage(
        "Porque naquela noite alguém desapareceu."
    );

    advanceTime(1);

    await sleep(900);

    addMessage(
        "Às 22:18."
    );

    advanceTime(1);

    addClue(
        "Desaparecimento às 22:18",
        "O desconhecido relacionou o horário da fotografia ao desaparecimento de alguém."
    );

    await sleep(900);

    showChoices([

        {
            text: "Quem desapareceu?",
            action: askWhoDisappeared
        },

        {
            text: "Você estava lá?",
            action: askIfThere
        }

    ]);

}


/* =====================================================
   PESSOA DA FOTO
===================================================== */

async function askPersonPhoto() {

    await showTyping(1400);

    addMessage(
        "Eu não sei quem ela é."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Mas ela estava lá naquela noite."
    );

    advanceTime(1);

    addClue(
        "A pessoa desconhecida",
        "A pessoa que aparece na fotografia estava presente na noite do desaparecimento."
    );

    await sleep(800);

    showChoices([

        {
            text: "Você está mentindo.",
            action: accuse
        },

        {
            text: "Então por que me mandou procurar essa fotografia?",
            action: askWhyPhoto
        }

    ]);

}


/* =====================================================
   QUEM DESAPARECEU
===================================================== */

async function askWhoDisappeared() {

    await showTyping(1500);

    addMessage(
        "Uma pessoa chamada Helena."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Mas isso aconteceu anos atrás."
    );

    advanceTime(1);

    addClue(
        "Helena",
        "O desconhecido afirma que Helena desapareceu anos atrás, às 22:18."
    );

    await sleep(900);

    showChoices([

        {
            text: "E o que isso tem a ver comigo?",
            action: askConnection
        },

        {
            text: "Você conhecia Helena?",
            action: askHelena
        }

    ]);

}


/* =====================================================
   ESTAVA LÁ
===================================================== */

async function askIfThere() {

    suspicion++;

    await showTyping(1300);

    addMessage(
        "Não."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Mas alguém que eu conheço estava."
    );

    advanceTime(1);

    addClue(
        "Alguém conhecido estava lá",
        "O desconhecido afirma que outra pessoa estava presente naquela noite."
    );

    await sleep(800);

    showChoices([

        {
            text: "Quem?",
            action: askWhoWasThere
        },

        {
            text: "Você está me contando metade da história.",
            action: accuse

        }

    ]);

}


/* =====================================================
   CONEXÃO
===================================================== */

async function askConnection() {

    await showTyping(1500);

    addMessage(
        "É isso que eu estou tentando descobrir."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Talvez você tenha recebido a caixa justamente por causa disso."
    );

    advanceTime(1);

    addClue(
        "A caixa pode ter sido enviada por um motivo",
        "O desconhecido acredita que a caixa pode estar relacionada a você."
    );

    await sleep(800);

    showChoices([

        {
            text: "Então a caixa foi enviada para mim?",
            action: askBoxOrigin
        },

        {
            text: "Quem colocou a caixa lá?",
            action: askWhoPlaced
        }

    ]);

}


/* =====================================================
   HELENA
===================================================== */

async function askHelena() {

    await showTyping(1400);

    addMessage(
        "Não pessoalmente."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Mas eu conheço alguém que conhecia Helena."
    );

    advanceTime(1);

    addClue(
        "Ligação com Helena",
        "O desconhecido não conheceu Helena pessoalmente, mas conhece alguém que a conhecia."
    );

    showChoices([

        {
            text: "Quem é essa pessoa?",
            action: askWhoKnowsHelena
        },

        {
            text: "Isso está ficando cada vez mais estranho.",
            action: continueInvestigation
        }

    ]);

}


/* =====================================================
   QUEM ESTAVA LÁ
===================================================== */

async function askWhoWasThere() {

    await showTyping(1500);

    addMessage(
        "Eu não posso dizer ainda."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Mas você provavelmente conhece essa pessoa."
    );

    advanceTime(1);

    addClue(
        "Você pode conhecer a testemunha",
        "A pessoa que estava no local pode fazer parte da sua própria vida."
    );

    await sleep(800);

    showChoices([

        {
            text: "Me dê pelo menos uma pista.",
            action: giveHint
        },

        {
            text: "Então vou descobrir sozinho.",
            action: investigateAlone
        }

    ]);

}


/* =====================================================
   ACUSAÇÃO
===================================================== */

async function accuse() {

    suspicion++;

    await showTyping(1300);

    addMessage(
        "Talvez eu esteja."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Mas você também não está me contando tudo."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Estamos empatados."
    );

    await sleep(800);

    showChoices([

        {
            text: "Então vamos parar de esconder as coisas.",
            action: honestConversation
        },

        {
            text: "Eu ainda não confio em você.",
            action: cautiousConversation
        }

    ]);

}


/* =====================================================
   HONESTIDADE
===================================================== */

async function honestConversation() {

    trust++;

    await showTyping(1400);

    addMessage(
        "Tudo bem."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Eu também estou com medo."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "A pessoa que me pediu para encontrar a caixa desapareceu ontem."
    );

    advanceTime(1);

    addClue(
        "Outra pessoa desapareceu",
        "O desconhecido afirma que alguém que o ajudava desapareceu recentemente."
    );

    await sleep(900);

    showChoices([

        {
            text: "Você acha que ela está em perigo?",
            action: askDanger
        },

        {
            text: "E você quer que eu encontre essa pessoa?",
            action: askMission
        }

    ]);

}


/* =====================================================
   CONVERSA CAUTELOSA
===================================================== */

async function cautiousConversation() {

    suspicion++;

    await showTyping(1200);

    addMessage(
        "Eu esperava que você dissesse isso."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Por isso não vou pedir que confie em mim."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Só continue procurando."
    );

    addClue(
        "Continue procurando",
        "O desconhecido não pede confiança. Apenas insiste que você continue investigando."
    );

    showChoices([

        {
            text: "O que devo procurar?",
            action: askSearch
        },

        {
            text: "Onde você está?",
            action: askLocation
        }

    ]);

}


/* =====================================================
   PISTA
===================================================== */

async function giveHint() {

    await showTyping(1200);

    addMessage(
        "Procure por algo escrito atrás da fotografia."
    );

    advanceTime(1);

    await sleep(800);

    addClue(
        "Verso da fotografia",
        "O desconhecido afirma que existe algo escrito atrás da fotografia."
    );

    showChoices([

        {
            text: "Vou verificar.",
            action: inspectBackPhoto
        },

        {
            text: "O que está escrito?",
            action: askWrittenMessage
        }

    ]);

}


/* =====================================================
   VERSO DA FOTO
===================================================== */

async function inspectBackPhoto() {

    await showTyping(1300);

    addMessage(
        "Você encontrou alguma coisa?"
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Tem uma frase escrita à mão."
    );

    advanceTime(1);

    discoveredInitials = true;

    addClue(
        "Mensagem no verso",
        "Existe uma frase escrita à mão no verso da fotografia."
    );

    await sleep(800);

    showChoices([

        {
            text: "O que está escrito?",
            action: askWrittenMessage
        },

        {
            text: "Vou guardar isso por enquanto.",
            action: keepMessage

        }

    ]);

}


/* =====================================================
   FRASE
===================================================== */

async function askWrittenMessage() {

    await showTyping(1300);

    addMessage(
        "Está escrito: 'Não olhe para trás.'"
    );

    advanceTime(1);

    await sleep(900);

    addClue(
        "Não olhe para trás",
        "A frase escrita no verso da fotografia diz: 'Não olhe para trás.'"
    );

    playerNotes.textContent =
        "A caixa azul contém uma fotografia e uma moeda.\n\n" +
        "A fotografia foi tirada às 22:18.\n\n" +
        "Helena desapareceu naquela noite.\n\n" +
        "No verso da fotografia está escrito:\n" +
        "\"Não olhe para trás.\"\n\n" +
        "Preciso descobrir quem está por trás disso.";

    showChoices([

        {
            text: "Quem escreveu isso?",
            action: askWriter
        },

        {
            text: "Isso está ficando perigoso.",
            action: askDanger
        }

    ]);

}


/* =====================================================
   CONTINUAÇÕES
===================================================== */

async function askAboutPerson() {

    await showTyping(1200);

    addMessage(
        "Não é alguém tão próximo quanto você imagina."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Mas essa pessoa já esteve na sua casa."
    );

    advanceTime(1);

    addClue(
        "A pessoa esteve na sua casa",
        "A pessoa que passou seu número ao desconhecido já esteve na sua casa."
    );

    showChoices([

        {
            text: "Quem esteve aqui?",
            action: askWhoWasThere
        },

        {
            text: "Vou descobrir sozinho.",
            action: investigateAlone
        }

    ]);

}


async function askHowKnows() {

    await showTyping(1300);

    addMessage(
        "Porque eu já estive aí."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Mas faz muito tempo."
    );

    advanceTime(1);

    addClue(
        "Ele já esteve aqui",
        "O desconhecido afirma que já esteve no local onde você mora."
    );

    showChoices([

        {
            text: "Quando?",
            action: askWhen
        },

        {
            text: "Por que você esteve aqui?",
            action: askWhyHere
        }

    ]);

}


async function askWhen() {

    await showTyping(1200);

    addMessage(
        "Antes de você perceber que a caixa existia."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Isso é tudo que posso dizer agora."
    );

    addClue(
        "Ele esteve aqui antes da caixa",
        "O desconhecido afirma ter estado no local antes de você descobrir a caixa."
    );

    continueMainStory();

}


async function askWhyHere() {

    await showTyping(1300);

    addMessage(
        "Eu estava procurando a mesma coisa que você está procurando agora."
    );

    advanceTime(1);

    addClue(
        "Ele procurava a mesma coisa",
        "O desconhecido já investigava o mesmo mistério antes de entrar em contato com você."
    );

    continueMainStory();

}


async function askWhoPlaced() {

    await showTyping(1200);

    addMessage(
        "Não sei."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Mas existe uma maneira de descobrir."
    );

    advanceTime(1);

    continueMainStory();

}


async function askBoxOrigin() {

    await showTyping(1300);

    addMessage(
        "Eu não tenho certeza."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "E é justamente isso que me preocupa."
    );

    advanceTime(1);

    continueMainStory();

}


async function askWhoKnowsHelena() {

    await showTyping(1300);

    addMessage(
        "A pessoa que tirou a fotografia."
    );

    advanceTime(1);

    await sleep(800);

    addClue(
        "O fotógrafo",
        "A pessoa que tirou a fotografia aparentemente conhecia Helena."
    );

    continueMainStory();

}


async function askWhyPhoto() {

    await showTyping(1300);

    addMessage(
        "Porque ela pode mostrar quem estava observando Helena."
    );

    advanceTime(1);

    addClue(
        "A fotografia mostra uma testemunha",
        "A pessoa ao fundo pode ter presenciado o desaparecimento."
    );

    continueMainStory();

}


async function askDanger() {

    await showTyping(1300);

    addMessage(
        "Eu não sei."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Mas ninguém desaparece por acaso."
    );

    advanceTime(1);

    addClue(
        "O desaparecimento pode não ter sido acidental",
        "O desconhecido acredita que o desaparecimento de Helena e o desaparecimento recente podem estar relacionados."
    );

    continueMainStory();

}


async function askMission() {

    trust++;

    await showTyping(1300);

    addMessage(
        "Não exatamente."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Primeiro preciso saber em quem posso confiar."
    );

    advanceTime(1);

    continueMainStory();

}


async function askSearch() {

    await showTyping(1200);

    addMessage(
        "Procure pela data."
    );

    advanceTime(1);

    addMessage(
        "14 de outubro."
    );

    advanceTime(1);

    addClue(
        "14 de outubro",
        "A data aparece relacionada à fotografia e ao desaparecimento de Helena."
    );

    continueMainStory();

}


async function askLocation() {

    await showTyping(1200);

    addMessage(
        "Não posso dizer."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Mas estou perto."
    );

    advanceTime(1);

    addClue(
        "Ele está perto",
        "O desconhecido afirma estar próximo de você."
    );

    continueMainStory();

}


async function askWriter() {

    await showTyping(1300);

    addMessage(
        "Essa é a parte que eu ainda não consegui descobrir."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Mas acho que a moeda pode ajudar."
    );

    advanceTime(1);

    addClue(
        "A moeda pode revelar algo",
        "As letras K.R. podem estar relacionadas à mensagem da fotografia."
    );

    continueMainStory();

}


async function keepMessage() {

    await showTyping(1000);

    addMessage(
        "Tudo bem."
    );

    advanceTime(1);

    addMessage(
        "Só não esqueça o que você viu."
    );

    advanceTime(1);

    continueMainStory();

}


async function pretendConfusion() {

    suspicion++;

    await showTyping(1200);

    addMessage(
        "Você sabe exatamente do que estou falando."
    );

    advanceTime(1);

    addMessage(
        "Mas tudo bem."
    );

    advanceTime(1);

    continueMainStory();

}


async function askWhatHidden() {

    await showTyping(1200);

    addMessage(
        "Uma parte da história."
    );

    advanceTime(1);

    addClue(
        "Uma parte da história está escondida",
        "O desconhecido admite que ainda não contou tudo."
    );

    continueMainStory();

}


async function investigateAlone() {

    trust = Math.max(0, trust - 1);

    await showTyping(1200);

    addMessage(
        "Talvez seja melhor assim."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Mas tenha cuidado."
    );

    advanceTime(1);

    continueMainStory();

}


/* =====================================================
   CONTINUAÇÃO PRINCIPAL
===================================================== */

async function continueMainStory() {

    storyProgress++;

    if (storyProgress < 2) {

        await sleep(700);

        showChoices([

            {
                text: "O que aconteceu naquela noite?",
                action: askNight
            },

            {
                text: "Quem é você de verdade?",
                action: deeperIdentity
            }

        ]);

        return;
    }

    if (storyProgress < 4) {

        await sleep(700);

        showChoices([

            {
                text: "Posso confiar em você?",
                action: trustQuestion
            },

            {
                text: "Vou investigar a fotografia.",
                action: inspectPhotoAgain
            }

        ]);

        return;
    }

    await finalChapterSequence();

}


/* =====================================================
   NOITE
===================================================== */

async function askNight() {

    await showTyping(1300);

    addMessage(
        "Choveu naquela noite."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Helena saiu de casa às 21:47."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Às 22:18, ninguém conseguiu mais falar com ela."
    );

    advanceTime(1);

    addClue(
        "21:47",
        "Helena saiu de casa às 21:47, segundo o desconhecido."
    );

    addClue(
        "22:18",
        "Às 22:18, ninguém conseguiu mais falar com Helena."
    );

    storyProgress++;

    continueMainStory();

}


/* =====================================================
   IDENTIDADE
===================================================== */

async function deeperIdentity() {

    await showTyping(1400);

    addMessage(
        "Meu nome é Daniel."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Agora você sabe mais sobre mim do que deveria."
    );

    advanceTime(1);

    askedName = true;

    addClue(
        "Daniel",
        "O desconhecido finalmente revelou seu nome: Daniel."
    );

    storyProgress++;

    continueMainStory();

}


/* =====================================================
   CONFIANÇA
===================================================== */

async function trustQuestion() {

    if (trust > suspicion) {

        trust++;

        await showTyping(1300);

        addMessage(
            "Acho que sim."
        );

        advanceTime(1);

        await sleep(700);

        addMessage(
            "Mas não confie completamente em mim."
        );

    } else {

        suspicion++;

        await showTyping(1300);

        addMessage(
            "Você não deveria."
        );

        advanceTime(1);

        await sleep(700);

        addMessage(
            "Pelo menos ainda não."
        );

    }

    advanceTime(1);

    storyProgress++;

    continueMainStory();

}


/* =====================================================
   FOTO NOVAMENTE
===================================================== */

async function inspectPhotoAgain() {

    photoInspected = true;

    await showTyping(1300);

    addMessage(
        "Olhe para o canto esquerdo."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Agora veja a janela atrás da pessoa."
    );

    advanceTime(1);

    addClue(
        "A janela",
        "Existe uma janela ao fundo da fotografia que pode indicar o local onde ela foi tirada."
    );

    storyProgress++;

    continueMainStory();

}


/* =====================================================
   FINAL DO CAPÍTULO
===================================================== */

async function finalChapterSequence() {

    await sleep(1000);

    await showTyping(1500);

    addMessage(
        "Você encontrou tudo."
    );

    advanceTime(1);

    await sleep(900);

    addMessage(
        "A fotografia."
    );

    advanceTime(1);

    await sleep(600);

    addMessage(
        "A moeda."
    );

    advanceTime(1);

    await sleep(600);

    addMessage(
        "As iniciais."
    );

    advanceTime(1);

    await sleep(900);

    addMessage(
        "Agora falta apenas uma coisa."
    );

    advanceTime(1);

    await sleep(1000);

    addMessage(
        "Descobrir por que a caixa foi deixada para você."
    );

    advanceTime(1);

    await sleep(1200);

    notify(
        "Número Desconhecido",
        "Nova chamada recebida."
    );

    await showTyping(1500);

    addMessage(
        "Não atenda."
    );

    advanceTime(1);

    await sleep(900);

    showChoices([

        {
            text: "Vou atender.",
            action: answerCall
        },

        {
            text: "Não vou atender.",
            action: ignoreCall
        },

        {
            text: "Antes disso, quem está ligando?",
            action: askCaller

        }

    ]);

}


/* =====================================================
   ATENDER
===================================================== */

async function answerCall() {

    callMade = true;

    await showTyping(1300);

    addMessage(
        "A chamada fica em silêncio."
    );

    advanceTime(1);

    await sleep(1200);

    addMessage(
        "Então você ouve três batidas."
    );

    advanceTime(1);

    await sleep(1000);

    addMessage(
        "toc... toc... toc..."
    );

    advanceTime(1);

    addClue(
        "Três batidas",
        "Durante a chamada, você ouviu três batidas antes da ligação ser encerrada."
    );

    await sleep(1000);

    determineEnding();

}


/* =====================================================
   IGNORAR
===================================================== */

async function ignoreCall() {

    trust++;

    await showTyping(1200);

    addMessage(
        "Obrigado."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Você fez a escolha certa."
    );

    advanceTime(1);

    addClue(
        "A ligação não deveria ser atendida",
        "O desconhecido parecia saber que atender a ligação poderia ser perigoso."
    );

    await sleep(900);

    determineEnding();

}


/* =====================================================
   PERGUNTAR QUEM LIGA
===================================================== */

async function askCaller() {

    await showTyping(1300);

    addMessage(
        "Eu."
    );

    advanceTime(1);

    await sleep(900);

    addMessage(
        "Mas não fui eu que iniciei a chamada."
    );

    advanceTime(1);

    addClue(
        "Daniel não fez a ligação",
        "Daniel afirma que a chamada apareceu sem que ele a tivesse iniciado."
    );

    await sleep(800);

    showChoices([

        {
            text: "Vou atender.",
            action: answerCall
        },

        {
            text: "Não vou atender.",
            action: ignoreCall
        }

    ]);

}


/* =====================================================
   FINAL
===================================================== */

function determineEnding() {

    gameScreen.classList.add("hidden");

    endScreen.classList.remove("hidden");

    if (
        trust >= 5 &&
        clues.length >= 7 &&
        photoInspected
    ) {

        endTitle.textContent = "A CAIXA AZUL";

        endText.textContent =
            "Você ainda não descobriu toda a verdade. " +
            "Mas agora sabe que a caixa, a fotografia, Helena e o desconhecido estão ligados. " +
            "E alguém parece saber que você encontrou as pistas.";

    }

    else if (
        suspicion >= trust + 3
    ) {

        endTitle.textContent = "NÃO CONFIE EM NINGUÉM";

        endText.textContent =
            "Você percebeu que existem informações sendo escondidas. " +
            "Daniel pode estar dizendo a verdade... ou pode estar conduzindo você exatamente para onde quer.";

    }

    else if (
        clues.length >= 5
    ) {

        endTitle.textContent = "A PRIMEIRA PISTA";

        endText.textContent =
            "Você juntou pistas suficientes para perceber que o desaparecimento de Helena não foi um acontecimento isolado. " +
            "A história está apenas começando.";

    }

    else {

        endTitle.textContent = "CONTINUA...";

        endText.textContent =
            "Você ainda não possui respostas suficientes. " +
            "Mas uma coisa está clara: alguém queria que você encontrasse aquela caixa.";

    }

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

    boxConfirmed = false;
    photoUnlockedState = false;
    photoInspected = false;
    callMade = false;
    askedName = false;
    discoveredDate = false;
    discoveredInitials = false;

    storyProgress = 0;

    messageBadge.classList.remove("hidden");

    clueBadge.textContent = "0";

    clueBadge.classList.add("hidden");

    notificationArea.innerHTML = "";

    playerNotes.textContent =
        "Ainda não escrevi nada...";

    updateClock();

    renderClues();

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
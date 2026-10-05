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


    const target =
        document.getElementById(`${appName}App`);

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

    const hour =
        String(currentHour).padStart(2, "0");

    const minute =
        String(currentMinute).padStart(2, "0");


    const time =
        `${hour}:${minute}`;


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

    const message =
        document.createElement("div");


    message.className =
        `message ${sender}`;


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

        chat.scrollTop =
            chat.scrollHeight;

    }, 50);

}


function showTyping(duration = 1200) {

    return new Promise(resolve => {

        const typing =
            document.createElement("div");


        typing.className =
            "typing";


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

        const button =
            document.createElement("button");


        button.className =
            "choice-button";


        button.textContent =
            option.text;


        button.addEventListener("click", async () => {

            choices.classList.add("hidden");


            addMessage(
                option.text,
                "player"
            );


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

    if (
        clues.some(
            clue => clue.title === title
        )
    ) {

        return;

    }


    clues.push({
        title,
        description
    });


    clueBadge.textContent =
        clues.length;


    clueBadge.classList.remove(
        "hidden"
    );


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

        const element =
            document.createElement("div");


        element.className =
            "clue";


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

        lockedPhoto.classList.add(
            "hidden"
        );


        photoUnlocked.classList.remove(
            "hidden"
        );

    } else {

        lockedPhoto.classList.remove(
            "hidden"
        );


        photoUnlocked.classList.add(
            "hidden"
        );

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


    startScreen.classList.add(
        "hidden"
    );


    endScreen.classList.add(
        "hidden"
    );


    gameScreen.classList.remove(
        "hidden"
    );


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


    messageBadge.classList.remove(
        "hidden"
    );


    clueBadge.classList.add(
        "hidden"
    );


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

async function insistWhoWasThere() {

    await showTyping(1400);

    addMessage(
        "Você é insistente."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Isso pode ser uma qualidade ou um problema."
    );

    advanceTime(1);

    await sleep(900);

    addMessage(
        "O nome começa com D."
    );

    advanceTime(1);

    addClue(
        "Nome iniciado com D",
        "A pessoa que estava presente na noite do desaparecimento possui um nome que começa com D."
    );

    await sleep(900);

    showChoices([

        {
            text: "Daniel?",
            action: guessDaniel
        },

        {
            text: "Não faço ideia.",
            action: dontKnowDaniel
        }

    ]);
}


async function guessDaniel() {

    trust++;

    await showTyping(1500);

    addMessage(
        "Como você sabe esse nome?"
    );

    advanceTime(1);

    await sleep(900);

    addMessage(
        "Daniel."
    );

    advanceTime(1);

    addMessage(
        "Então você já ouviu falar dele."
    );

    advanceTime(1);

    addClue(
        "Daniel",
        "Daniel estava ligado à noite do desaparecimento e parece conhecer a história da caixa."
    );

    await sleep(900);

    showChoices([

        {
            text: "Quem é Daniel?",
            action: askDaniel
        },

        {
            text: "Por que você ficou assustado quando falei o nome dele?",
            action: askFearDaniel
        }

    ]);
}


async function dontKnowDaniel() {

    await showTyping(1300);

    addMessage(
        "Talvez seja melhor assim."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Mas você vai descobrir o nome em breve."
    );

    advanceTime(1);

    addClue(
        "A identidade será revelada",
        "O desconhecido acredita que o nome da pessoa envolvida será descoberto em breve."
    );

    await sleep(900);

    showChoices([

        {
            text: "Então continue falando.",
            action: continueInvestigation
        },

        {
            text: "Estou cansado desses enigmas.",
            action: accuse
        }

    ]);
}


async function askDaniel() {

    await showTyping(1500);

    addMessage(
        "Daniel era meu amigo."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "E foi a última pessoa que viu Helena."
    );

    advanceTime(1);

    addClue(
        "Daniel viu Helena pela última vez",
        "Daniel foi a última pessoa conhecida a ver Helena antes do desaparecimento."
    );

    await sleep(900);

    showChoices([

        {
            text: "Ele sabe o que aconteceu?",
            action: askDanielKnows
        },

        {
            text: "E onde ele está agora?",
            action: askWhereDaniel
        }

    ]);
}


async function askFearDaniel() {

    suspicion++;

    await showTyping(1300);

    addMessage(
        "Porque Daniel desapareceu."
    );

    advanceTime(1);

    await sleep(900);

    addMessage(
        "E ninguém deveria estar procurando por ele."
    );

    advanceTime(1);

    addClue(
        "Daniel desapareceu",
        "O desaparecimento de Daniel parece ser uma parte central do mistério."
    );

    await sleep(900);

    showChoices([

        {
            text: "Quem fez isso?",
            action: askWhoDidIt
        },

        {
            text: "Quando ele desapareceu?",
            action: askWhenDaniel
        }

    ]);
}


async function askDanielKnows() {

    await showTyping(1400);

    addMessage(
        "Ele sabia demais."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Foi por isso que tudo aconteceu."
    );

    advanceTime(1);

    addClue(
        "Daniel sabia demais",
        "O desconhecido acredita que o conhecimento de Daniel colocou sua vida em perigo."
    );

    await sleep(900);

    showChoices([

        {
            text: "O que ele descobriu?",
            action: askWhatDanielFound
        },

        {
            text: "Você sabe onde ele está?",
            action: askWhereDaniel
        }

    ]);
}


async function askWhereDaniel() {

    await showTyping(1500);

    addMessage(
        "Eu não sei."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "A última coisa que recebi dele foi uma mensagem."
    );

    advanceTime(1);

    addClue(
        "Última mensagem de Daniel",
        "A última mensagem recebida de Daniel pode conter uma pista sobre seu paradeiro."
    );

    await sleep(900);

    showChoices([

        {
            text: "O que dizia?",
            action: askLastMessage
        },

        {
            text: "Você guardou a mensagem?",
            action: askSavedMessage
        }

    ]);
}


async function askWhoDidIt() {

    await showTyping(1500);

    addMessage(
        "Eu ainda não tenho certeza."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Mas acho que foi alguém próximo deles."
    );

    advanceTime(1);

    addClue(
        "Alguém próximo",
        "O responsável pode ser alguém próximo de Helena ou Daniel."
    );

    await sleep(900);

    showChoices([

        {
            text: "Você suspeita de alguém?",
            action: askSuspect
        },

        {
            text: "Então por que me envolveu nisso?",
            action: askWhyMe
        }

    ]);
}


async function askWhenDaniel() {

    await showTyping(1400);

    addMessage(
        "Três dias depois de Helena."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Foi quando percebi que havia alguma coisa errada."
    );

    advanceTime(1);

    addClue(
        "Três dias",
        "Daniel desapareceu três dias depois de Helena."
    );

    await sleep(900);

    showChoices([

        {
            text: "E a polícia?",
            action: askPolice
        },

        {
            text: "Você procurou por ele?",
            action: askSearch
        }

    ]);
}


async function askWhatDanielFound() {

    await showTyping(1500);

    addMessage(
        "Ele encontrou uma gravação."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Uma gravação feita dentro da estação."
    );

    advanceTime(1);

    addClue(
        "Gravação da estação",
        "Daniel encontrou uma gravação feita dentro da estação na noite do desaparecimento."
    );

    await sleep(900);

    showChoices([

        {
            text: "O que aparecia na gravação?",
            action: askRecording
        },

        {
            text: "Onde está essa gravação?",
            action: askRecordingLocation
        }

    ]);
}


async function askLastMessage() {

    await showTyping(1500);

    addMessage(
        "Ele escreveu apenas três palavras."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Não confie nela."
    );

    advanceTime(1);

    addClue(
        "Não confie nela",
        "A última mensagem de Daniel dizia: 'Não confie nela'."
    );

    await sleep(900);

    showChoices([

        {
            text: "Nela quem?",
            action: askWhoSheIs
        },

        {
            text: "Você sabe quem é?",
            action: askSuspect
        }

    ]);
}


async function askSavedMessage() {

    await showTyping(1200);

    addMessage(
        "Eu apaguei."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Mas nunca consegui esquecer o que estava escrito."
    );

    advanceTime(1);

    addClue(
        "Mensagem apagada",
        "A última mensagem de Daniel foi apagada, mas o desconhecido lembra do conteúdo."
    );

    await sleep(900);

    showChoices([

        {
            text: "O que ela dizia?",
            action: askLastMessage
        },

        {
            text: "Por que apagou?",
            action: askWhyDeleted
        }

    ]);
}


async function askSuspect() {

    suspicion++;

    await showTyping(1500);

    addMessage(
        "Helena."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Mas isso não significa que ela fez alguma coisa."
    );

    advanceTime(1);

    addClue(
        "Helena é uma suspeita",
        "O nome de Helena aparece novamente como possível ligação com o desaparecimento."
    );

    await sleep(900);

    showChoices([

        {
            text: "Então quem é ela?",
            action: askWhoSheIs
        },

        {
            text: "Você está protegendo Helena?",
            action: accuseProtecting
        }

    ]);
}


async function askWhyMe() {

    await showTyping(1500);

    addMessage(
        "Porque você recebeu a caixa."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "E porque acho que alguém queria que você encontrasse ela."
    );

    advanceTime(1);

    addClue(
        "Você foi escolhido",
        "O desconhecido acredita que alguém fez questão de colocar a caixa no seu caminho."
    );

    await sleep(900);

    showChoices([

        {
            text: "Quem colocou a caixa?",
            action: askWhoPlaced
        },

        {
            text: "Você colocou?",
            action: askIfHePlaced
        }

    ]);
}


async function askRecording() {

    await showTyping(1500);

    addMessage(
        "Uma pessoa entrando na estação."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Ela carregava uma caixa azul."
    );

    advanceTime(1);

    addClue(
        "A caixa aparece na gravação",
        "A gravação mostra uma pessoa entrando na estação carregando uma caixa azul."
    );

    await sleep(900);

    showChoices([

        {
            text: "Era Helena?",
            action: askIfHelenaRecording
        },

        {
            text: "Você reconheceu a pessoa?",
            action: askRecognizedPerson
        }

    ]);
}


async function askRecordingLocation() {

    await showTyping(1300);

    addMessage(
        "Na estação."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Mas a gravação original desapareceu."
    );

    advanceTime(1);

    addClue(
        "Gravação desaparecida",
        "A gravação original não está mais disponível."
    );

    await sleep(900);

    showChoices([

        {
            text: "Quem apagou?",
            action: askWhoDeleted
        },

        {
            text: "Você tem uma cópia?",
            action: askCopy
        }

    ]);
}

async function askInitials() {

    await showTyping(1200);

    addMessage(
        "K.R."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Não sei o que significa."
    );

    advanceTime(1);

    addClue(
        "Iniciais K.R.",
        "As letras K.R. estão gravadas na moeda encontrada dentro da caixa."
    );

    discoveredInitials = true;

    await sleep(900);

    showChoices([

        {
            text: "Você sabe de quem são essas iniciais.",
            action: accuseInitials
        },

        {
            text: "Vou descobrir sozinho.",
            action: searchSymbol
        }

    ]);
}


/* =====================================================
   ABRIR A CAIXA
===================================================== */

async function openBox() {

    boxConfirmed = true;

    await showTyping(1500);

    addMessage(
        "Você abriu?"
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Então olhe primeiro para a fotografia."
    );

    advanceTime(1);

    await sleep(900);

    unlockPhoto();

    addClue(
        "A fotografia",
        "A fotografia mostra uma estação de trem durante a noite."
    );

    await sleep(900);

    showChoices([

        {
            text: "Quem é a pessoa na fotografia?",
            action: askPhotoPerson
        },

        {
            text: "Por que essa fotografia foi enviada para mim?",
            action: askWhyPhoto
        },

        {
            text: "Vou olhar a moeda.",
            action: inspectCoin
        }

    ]);
}


/* =====================================================
   FOTO — PESSOA
===================================================== */

async function askPhotoPerson() {

    await showTyping(1400);

    addMessage(
        "Eu esperava que você soubesse."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Mas agora percebi que talvez você nunca tenha visto essa pessoa."
    );

    advanceTime(1);

    addClue(
        "Pessoa desconhecida",
        "A pessoa que aparece na fotografia ainda não foi identificada."
    );

    await sleep(900);

    showChoices([

        {
            text: "Você sabe quem ela é?",
            action: askWhoPhotoPerson
        },

        {
            text: "Ela estava na estação naquela noite?",
            action: askStationNight
        }

    ]);
}


/* =====================================================
   QUEM É A PESSOA DA FOTO
===================================================== */

async function askWhoPhotoPerson() {

    await showTyping(1400);

    addMessage(
        "Talvez."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Eu tenho uma suspeita."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Mas não quero acusar alguém sem ter certeza."
    );

    advanceTime(1);

    addClue(
        "Uma suspeita",
        "O desconhecido acredita reconhecer a pessoa da fotografia, mas ainda não tem certeza."
    );

    await sleep(900);

    showChoices([

        {
            text: "Me diga quem você suspeita.",
            action: askSuspect
        },

        {
            text: "Então vamos descobrir juntos.",
            action: continueInvestigation
        }

    ]);
}


/* =====================================================
   FOTO — ESTAÇÃO
===================================================== */

async function askStationNight() {

    await showTyping(1400);

    addMessage(
        "Sim."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "A fotografia foi tirada na noite em que Helena desapareceu."
    );

    advanceTime(1);

    addClue(
        "Fotografia da noite do desaparecimento",
        "A fotografia parece ter sido tirada na mesma noite em que Helena desapareceu."
    );

    await sleep(900);

    showChoices([

        {
            text: "Que horas eram?",
            action: askPhotoTime
        },

        {
            text: "Quem tirou a fotografia?",
            action: askWhoTookPhoto
        }

    ]);
}


/* =====================================================
   HORÁRIO DA FOTO
===================================================== */

async function askPhotoTime() {

    await showTyping(1200);

    addMessage(
        "22:18."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Foi exatamente às 22:18."
    );

    advanceTime(1);

    discoveredDate = true;

    addClue(
        "22:18",
        "A fotografia foi registrada às 22:18."
    );

    await sleep(900);

    showChoices([

        {
            text: "O que aconteceu às 22:18?",
            action: askWhatHappenedAtTime
        },

        {
            text: "Essa hora significa alguma coisa?",
            action: askMeaningTime
        }

    ]);
}


/* =====================================================
   QUEM TIROU A FOTO
===================================================== */

async function askWhoTookPhoto() {

    await showTyping(1300);

    addMessage(
        "Não sei."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Mas definitivamente não foi uma fotografia acidental."
    );

    advanceTime(1);

    addClue(
        "Fotografia intencional",
        "A fotografia parece ter sido tirada de propósito."
    );

    await sleep(900);

    showChoices([

        {
            text: "Então alguém estava seguindo aquela pessoa?",
            action: askFollowing
        },

        {
            text: "Você tem certeza?",
            action: askPhotoProof

        }

    ]);
}


/* =====================================================
   MOEDA
===================================================== */

async function inspectCoin() {

    await showTyping(1100);

    addMessage(
        "A moeda é mais importante do que parece."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Olhe o verso."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Tem uma pequena marca."
    );

    advanceTime(1);

    addClue(
        "Marca na moeda",
        "Além das iniciais K.R., a moeda possui uma pequena marca no verso."
    );

    await sleep(900);

    showChoices([

        {
            text: "Que marca?",
            action: askCoinMark
        },

        {
            text: "Onde essa moeda foi feita?",
            action: askCoinOrigin
        }

    ]);
}


/* =====================================================
   MARCA DA MOEDA
===================================================== */

async function askCoinMark() {

    await showTyping(1300);

    addMessage(
        "Um pequeno triângulo."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Com uma linha atravessando o meio."
    );

    advanceTime(1);

    addClue(
        "Triângulo na moeda",
        "A moeda possui um símbolo de triângulo atravessado por uma linha."
    );

    await sleep(900);

    showChoices([

        {
            text: "Você já viu esse símbolo antes?",
            action: askSeenSymbol
        },

        {
            text: "Ele pertence a alguém?",
            action: askSymbolOwner
        }

    ]);
}


/* =====================================================
   ORIGEM DA MOEDA
===================================================== */

async function askCoinOrigin() {

    await showTyping(1300);

    addMessage(
        "Não é uma moeda comum."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Ela foi feita para um grupo específico."
    );

    advanceTime(1);

    addClue(
        "Moeda incomum",
        "A moeda não parece ter sido produzida para circulação comum."
    );

    await sleep(900);

    showChoices([

        {
            text: "Que grupo?",
            action: askGroup
        },

        {
            text: "Você já viu outra igual?",
            action: askOtherCoin

        }

    ]);
}


/* =====================================================
   SÍMBOLO
===================================================== */

async function askSeenSymbol() {

    await showTyping(1300);

    addMessage(
        "Sim."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Na estação."
    );

    advanceTime(1);

    addClue(
        "O símbolo também está na estação",
        "O mesmo triângulo aparece em algum lugar dentro da estação."
    );

    await sleep(900);

    showChoices([

        {
            text: "Onde?",
            action: askSymbolLocation
        },

        {
            text: "Então precisamos voltar para lá.",
            action: askPlatform
        }

    ]);
}


/* =====================================================
   DONO DO SÍMBOLO
===================================================== */

async function askSymbolOwner() {

    await showTyping(1300);

    addMessage(
        "É isso que estou tentando descobrir."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "E acho que Daniel chegou muito perto da resposta."
    );

    advanceTime(1);

    addClue(
        "Daniel investigava o símbolo",
        "Daniel aparentemente estava tentando descobrir quem utilizava o símbolo."
    );

    await sleep(900);

    showChoices([

        {
            text: "O que Daniel descobriu?",
            action: askWhatDanielFound
        },

        {
            text: "Por que ninguém me contou isso antes?",
            action: askWhyNobodyTold

        }

    ]);
}


/* =====================================================
   GRUPO
===================================================== */

async function askGroup() {

    await showTyping(1400);

    addMessage(
        "Ainda não posso dizer."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Mas eles usavam a estação como ponto de encontro."
    );

    advanceTime(1);

    addClue(
        "Ponto de encontro",
        "Um grupo desconhecido utilizava a estação como ponto de encontro."
    );

    await sleep(900);

    showChoices([

        {
            text: "Esse grupo ainda existe?",
            action: askIfGroupExists
        },

        {
            text: "Helena fazia parte dele?",
            action: askHelenaGroup

        }

    ]);
}


/* =====================================================
   OUTRA MOEDA
===================================================== */

async function askOtherCoin() {

    await showTyping(1200);

    addMessage(
        "Uma vez."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "E foi exatamente por isso que eu reconheci essa."
    );

    advanceTime(1);

    addClue(
        "Outra moeda",
        "O desconhecido já viu uma moeda semelhante anteriormente."
    );

    await sleep(900);

    showChoices([

        {
            text: "Onde você viu a outra?",
            action: askOtherCoinLocation
        },

        {
            text: "Quem tinha essa moeda?",
            action: askOtherCoinOwner

        }

    ]);
}


/* =====================================================
   LOCAL DO SÍMBOLO
===================================================== */

async function askSymbolLocation() {

    await showTyping(1400);

    addMessage(
        "Na parede perto da plataforma 4."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "É pequeno. Quase ninguém percebe."
    );

    advanceTime(1);

    addClue(
        "Símbolo na plataforma 4",
        "O mesmo símbolo da moeda está escondido na parede próxima à plataforma 4."
    );

    await sleep(900);

    showChoices([

        {
            text: "Então a plataforma 4 é importante.",
            action: askPlatform
        },

        {
            text: "O que existe atrás daquela parede?",
            action: askBehindWall

        }

    ]);
}


/* =====================================================
   POR QUE NINGUÉM CONTOU
===================================================== */

async function askWhyNobodyTold() {

    await showTyping(1300);

    addMessage(
        "Porque ninguém sabia em quem confiar."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Agora você entende por que eu pedi para não contar a ninguém."
    );

    advanceTime(1);

    addClue(
        "Ninguém sabia em quem confiar",
        "O desconhecido acredita que existe alguém dentro do círculo de pessoas envolvidas que não é confiável."
    );

    await sleep(900);

    showChoices([

        {
            text: "Você confia em mim?",
            action: askTrust
        },

        {
            text: "Então eu também não vou confiar em você.",
            action: challengeTrust

        }

    ]);
}


/* =====================================================
   GRUPO AINDA EXISTE
===================================================== */

async function askIfGroupExists() {

    await showTyping(1400);

    addMessage(
        "Eu não sei."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Mas alguém continua usando o símbolo."
    );

    advanceTime(1);

    addClue(
        "O símbolo ainda é usado",
        "Mesmo que o grupo não esteja mais ativo, alguém continua usando seu símbolo."
    );

    await sleep(900);

    showChoices([

        {
            text: "Então alguém está ativo agora.",
            action: askActivePerson
        },

        {
            text: "Isso está ficando perigoso.",
            action: reactFear

        }

    ]);
}


/* =====================================================
   HELENA E O GRUPO
===================================================== */

async function askHelenaGroup() {

    await showTyping(1400);

    addMessage(
        "Eu não tenho certeza."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Mas ela conhecia o símbolo."
    );

    advanceTime(1);

    addClue(
        "Helena conhecia o símbolo",
        "Helena aparentemente conhecia o significado do símbolo da moeda."
    );

    await sleep(900);

    showChoices([

        {
            text: "Então ela sabia sobre o grupo.",
            action: askWhatHelenaKnew
        },

        {
            text: "Você está tentando protegê-la?",
            action: accuseProtecting

        }

    ]);
}


/* =====================================================
   OUTRA MOEDA — LOCAL
===================================================== */

async function askOtherCoinLocation() {

    await showTyping(1300);

    addMessage(
        "Na mesma estação."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Foi há alguns anos."
    );

    advanceTime(1);

    addClue(
        "A moeda já apareceu antes",
        "Uma moeda igual já havia sido encontrada na estação anos atrás."
    );

    await sleep(900);

    showChoices([

        {
            text: "Quem encontrou?",
            action: askOtherCoinFinder
        },

        {
            text: "Isso tem relação com Helena?",
            action: askIfHelenaRelated

        }

    ]);
}


/* =====================================================
   DONO DA OUTRA MOEDA
===================================================== */

async function askOtherCoinOwner() {

    await showTyping(1300);

    addMessage(
        "Daniel."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Foi por isso que ele começou a investigar."
    );

    advanceTime(1);

    addClue(
        "Daniel possuía uma moeda",
        "Daniel já havia encontrado uma moeda igual antes."
    );

    await sleep(900);

    showChoices([

        {
            text: "Ele ainda tinha essa moeda?",
            action: askIfDanielStillHad
        },

        {
            text: "Então a moeda pode levar até Daniel.",
            action: askPlatform

        }

    ]);
}


/* =====================================================
   ATRÁS DA PAREDE
===================================================== */

async function askBehindWall() {

    await showTyping(1400);

    addMessage(
        "Uma passagem antiga."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Foi fechada há muitos anos."
    );

    advanceTime(1);

    addClue(
        "Passagem antiga",
        "Existe uma passagem antiga próxima à plataforma 4."
    );

    await sleep(900);

    showChoices([

        {
            text: "Ela ainda pode ser aberta?",
            action: askCanOpen
        },

        {
            text: "Foi por ali que Helena desapareceu?",
            action: askHelenaPassage

        }

    ]);
}


/* =====================================================
   CONFIANÇA
===================================================== */

async function askTrust() {

    await showTyping(1300);

    trust++;

    addMessage(
        "Mais do que deveria."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "E isso pode acabar sendo um erro."
    );

    advanceTime(1);

    addClue(
        "Confiança",
        "O desconhecido afirma confiar em você, mas acredita que isso pode ser perigoso."
    );

    await sleep(900);

    showChoices([

        {
            text: "Então confie em mim e conte tudo.",
            action: demandProof
        },

        {
            text: "O que você ainda está escondendo?",
            action: accuse

        }

    ]);
}


/* =====================================================
   ATIVO AGORA
===================================================== */

async function askActivePerson() {

    await showTyping(1400);

    addMessage(
        "Provavelmente."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "E é justamente essa pessoa que me preocupa."
    );

    advanceTime(1);

    addClue(
        "Alguém continua ativo",
        "O desconhecido acredita que uma pessoa ligada ao grupo continua agindo atualmente."
    );

    await sleep(900);

    finishChapter();
}


/* =====================================================
   O QUE HELENA SABIA
===================================================== */

async function askWhatHelenaKnew() {

    await showTyping(1400);

    addMessage(
        "Ela sabia onde ficava a passagem."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "E sabia o que havia do outro lado."
    );

    advanceTime(1);

    addClue(
        "Helena conhecia a passagem",
        "Helena sabia da existência da passagem antiga próxima à plataforma 4."
    );

    await sleep(900);

    showChoices([

        {
            text: "O que havia do outro lado?",
            action: askOtherSide
        },

        {
            text: "Daniel também sabia?",
            action: askIfDanielKnewPassage

        }

    ]);
}


/* =====================================================
   ACUSAR DE PROTEGER
===================================================== */

async function accuseProtecting() {

    suspicion++;

    await showTyping(1300);

    addMessage(
        "Eu não estou protegendo ninguém."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Estou tentando evitar que você cometa o mesmo erro que Daniel."
    );

    advanceTime(1);

    addClue(
        "O erro de Daniel",
        "O desconhecido acredita que Daniel cometeu algum erro durante sua investigação."
    );

    await sleep(900);

    showChoices([

        {
            text: "Que erro?",
            action: askDanielMistake
        },

        {
            text: "Então me ensine o que não fazer.",
            action: askWhatNotDo

        }

    ]);
}


/* =====================================================
   PROVA DA FOTO
===================================================== */

async function askPhotoProof() {

    await showTyping(1300);

    addMessage(
        "A fotografia prova que alguém estava na estação."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Mas não prova quem essa pessoa era."
    );

    advanceTime(1);

    await sleep(900);

    showChoices([

        {
            text: "Então precisamos de outra pista.",
            action: continueInvestigation
        },

        {
            text: "Existe alguma coisa escondida na foto?",
            action: inspectBackground

        }

    ]);
}


/* =====================================================
   PESSOA SEGUINDO
===================================================== */

async function askFollowing() {

    await showTyping(1300);

    addMessage(
        "É possível."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "A distância entre a câmera e a pessoa era pequena."
    );

    advanceTime(1);

    addClue(
        "A pessoa estava sendo observada",
        "A fotografia parece ter sido tirada de perto, indicando que alguém observava a pessoa."
    );

    await sleep(900);

    finishChapter();
}


/* =====================================================
   HORA — O QUE ACONTECEU
===================================================== */

async function askWhatHappenedAtTime() {

    await showTyping(1400);

    addMessage(
        "Foi quando Helena entrou na estação."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Depois disso, ninguém conseguiu encontrá-la."
    );

    advanceTime(1);

    addClue(
        "Helena entrou às 22:18",
        "Helena foi vista entrando na estação às 22:18."
    );

    await sleep(900);

    showChoices([

        {
            text: "Quem estava esperando por ela?",
            action: askWhoWaiting
        },

        {
            text: "Ela estava sozinha?",
            action: askIfAlone

        }

    ]);
}


/* =====================================================
   SIGNIFICADO DO HORÁRIO
===================================================== */

async function askMeaningTime() {

    await showTyping(1200);

    addMessage(
        "Sim."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "É o horário em que tudo começou."
    );

    advanceTime(1);

    addClue(
        "22:18 é importante",
        "O horário 22:18 parece marcar o início dos acontecimentos."
    );

    await sleep(900);

    showChoices([

        {
            text: "O que aconteceu exatamente?",
            action: askWhatHappenedAtTime
        },

        {
            text: "Vou anotar esse horário.",
            action: saveTimeClue

        }

    ]);
}


/* =====================================================
   FINAL DA PARTE
===================================================== */

async function saveTimeClue() {

    addClue(
        "Horário anotado",
        "22:18 foi registrado como um dos horários mais importantes da investigação."
    );

    await showTyping(1000);

    addMessage(
        "Faça isso."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Você vai precisar lembrar desse horário."
    );

    advanceTime(1);

    finishChapter();
}

    advanceTime(1);

    addClue(
        "Relação entre Daniel e Helena",
        "Existe uma possibilidade de que Daniel e Helena tivessem uma relação além da amizade."
    );

    await sleep(900);

    showChoices([

        {
            text: "Então alguém tinha ciúmes?",
            action: askJealousy
        },

        {
            text: "Você acha que isso tem relação com o desaparecimento?",
            action: askIfExplains
        }

    ]);

}


/* =====================================================
   QUEM SABIA
===================================================== */

async function askWhoKnew() {

    await showTyping(1500);

    addMessage(
        "Daniel."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "E talvez outra pessoa."
    );

    advanceTime(1);

    addClue(
        "Daniel sabia da caixa",
        "Daniel pode ter sabido que a caixa seria entregue a você."
    );

    await sleep(900);

    showChoices([

        {
            text: "Quem é a outra pessoa?",
            action: askOtherPerson
        },

        {
            text: "Daniel deixou alguma pista?",
            action: askDanielClue
        }

    ]);

}


/* =====================================================
   SIGNIFICADO K.R.
===================================================== */

async function askInitialMeaning() {

    await showTyping(1400);

    addMessage(
        "Eu acho que são iniciais."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Mas não sei de quem."
    );

    advanceTime(1);

    addClue(
        "K.R. podem ser iniciais",
        "As letras gravadas na moeda provavelmente representam o nome de alguém."
    );

    await sleep(900);

    showChoices([

        {
            text: "Pode ser alguém da história?",
            action: askIfStoryPerson
        },

        {
            text: "Vou procurar por K.R.",
            action: searchSymbol
        }

    ]);

}


/* =====================================================
   PRÓXIMO PASSO
===================================================== */

async function askWhatNow() {

    await showTyping(1400);

    addMessage(
        "Não saia de casa."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Pelo menos até eu descobrir quem está observando você."
    );

    advanceTime(1);

    addClue(
        "Fique em casa",
        "O desconhecido aconselha que você não saia de casa enquanto ele investiga quem está observando."
    );

    await sleep(900);

    showChoices([

        {
            text: "E se eu não quiser esperar?",
            action: refuseWait
        },

        {
            text: "Tudo bem. Vou esperar.",
            action: agreeWait
        }

    ]);

}


/* =====================================================
   FINALIZAÇÃO DO CAPÍTULO
===================================================== */

async function continueChapter() {

    storyProgress++;

    await showTyping(1500);

    addMessage(
        "Eu preciso desligar."
    );

    advanceTime(1);

    await sleep(900);

    addMessage(
        "Se eu desaparecer, procure pela plataforma 4."
    );

    advanceTime(1);

    addClue(
        "Plataforma 4",
        "A plataforma 4 parece ser o próximo lugar importante da investigação."
    );

    await sleep(900);

    showChoices([

        {
            text: "O que existe na plataforma 4?",
            action: askPlatform
        },

        {
            text: "Por que você pode desaparecer?",
            action: askDisappear
        }

    ]);

}


/* =====================================================
   AÇÕES FINAIS
===================================================== */

async function askPlatform() {

    await showTyping(1500);

    addMessage(
        "É onde tudo começou."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "E talvez seja onde tudo termine."
    );

    advanceTime(1);

    addClue(
        "A plataforma 4",
        "A plataforma 4 está diretamente ligada ao início do mistério."
    );

    await sleep(900);

    finishChapter();

}


async function askDisappear() {

    await showTyping(1400);

    addMessage(
        "Porque quem procura a verdade acaba chamando atenção."
    );

    advanceTime(1);

    await sleep(900);

    addMessage(
        "E agora você também está procurando."
    );

    advanceTime(1);

    addClue(
        "Você está envolvido",
        "Ao continuar investigando, você também pode ter chamado a atenção de quem está por trás de tudo."
    );

    await sleep(900);

    finishChapter();

}


function finishChapter() {

    gameScreen.classList.add(
        "hidden"
    );

    endScreen.classList.remove(
        "hidden"
    );

    endTitle.textContent =
        "FIM DO CAPÍTULO 1";

    endText.textContent =
        "A conversa terminou por enquanto.\n\n" +
        "Mas agora você sabe que a caixa azul, " +
        "Helena, Daniel e a plataforma 4 estão ligados.\n\n" +
        "E alguém sabe que você descobriu.";

}


/* =====================================================
   OUTRAS RESPOSTAS
===================================================== */

async function askHowKnows() {

    await showTyping(1400);

    addMessage(
        "Porque alguém está acompanhando os seus passos."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Não sei como."
    );

    advanceTime(1);

    addClue(
        "Alguém acompanha seus passos",
        "Existe alguém acompanhando o que você está fazendo."
    );

    await sleep(800);

    showChoices([

        {
            text: "Isso é assustador.",
            action: reactFear
        },

        {
            text: "Vou descobrir quem é.",
            action: investigateAlone
        }

    ]);

}


async function askWhoPlacedAgain() {

    await showTyping(1400);

    addMessage(
        "Ainda não posso dizer."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Mas as iniciais K.R. podem ajudar."
    );

    advanceTime(1);

    addClue(
        "K.R. podem revelar o responsável",
        "As iniciais gravadas na moeda podem estar ligadas à pessoa que colocou a caixa."
    );

    await sleep(900);

    showChoices([

        {
            text: "Então vou descobrir o significado.",
            action: searchSymbol
        },

        {
            text: "Você precisa confiar em mim.",
            action: demandProof
        }

    ]);

}


async function askOtherPerson() {

    await showTyping(1400);

    addMessage(
        "Uma pessoa que você já viu."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Mas você ainda não percebeu."
    );

    advanceTime(1);

    addClue(
        "Você já viu essa pessoa",
        "A pessoa ligada à caixa pode ser alguém que você já encontrou antes."
    );

    await sleep(900);

    finishChapter();

}


async function askDanielClue() {

    await showTyping(1400);

    addMessage(
        "Ele deixou uma fotografia."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "A mesma fotografia que está dentro da sua caixa."
    );

    advanceTime(1);

    addClue(
        "A fotografia veio de Daniel",
        "A fotografia encontrada na caixa pode ter sido deixada por Daniel."
    );

    await sleep(900);

    finishChapter();

}


async function searchSymbol() {

    await showTyping(1300);

    addMessage(
        "K.R."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Talvez você já saiba o que isso significa."
    );

    advanceTime(1);

    addClue(
        "K.R.",
        "As iniciais continuam sendo a principal pista sobre a identidade desconhecida."
    );

    await sleep(900);

    finishChapter();

}


async function reactFear() {

    await showTyping(1200);

    addMessage(
        "Eu sei."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "É por isso que estou tentando avisar você."
    );

    advanceTime(1);

    finishChapter();

}


async function investigateAlone() {

    suspicion++;

    await showTyping(1300);

    addMessage(
        "Talvez seja melhor não fazer isso."
    );

    advanceTime(1);

    await sleep(800);

    addMessage(
        "Mas a escolha é sua."
    );

    advanceTime(1);

    addClue(
        "Investigar sozinho",
        "Você decidiu seguir as pistas por conta própria."
    );

    await sleep(900);

    finishChapter();

}


async function agreeWait() {

    trust++;

    await showTyping(1200);

    addMessage(
        "Obrigado."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Eu volto a falar com você."
    );

    advanceTime(1);

    finishChapter();

}


async function refuseWait() {

    courage++;

    await showTyping(1200);

    addMessage(
        "Então tome cuidado."
    );

    advanceTime(1);

    await sleep(700);

    addMessage(
        "Não vá até a estação sozinho."
    );

    advanceTime(1);

    addClue(
        "Não vá sozinho",
        "O desconhecido insiste que a estação pode ser perigosa."
    );

    await sleep(900);

    finishChapter();

}


/* =====================================================
   BOTÕES PRINCIPAIS
===================================================== */

startButton.addEventListener(
    "click",
    startGame
);


restartButton.addEventListener(
    "click",
    () => {

        location.reload();

    }
);


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

updateClock();


setInterval(
    updateClock,
    30000
);3
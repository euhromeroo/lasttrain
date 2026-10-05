/* =========================================================
   NÚMERO DESCONHECIDO
   SCRIPT.JS — VERSÃO COMPLETA
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTOS PRINCIPAIS
    ====================================================== */

    const startScreen = document.getElementById("startScreen");
    const gameScreen = document.getElementById("gameScreen");
    const endScreen = document.getElementById("endScreen");

    const startButton = document.getElementById("startButton");
    const restartButton = document.getElementById("restartButton");

    const chat = document.getElementById("chat");
    const choices = document.getElementById("choices");
    const choiceButtons = document.getElementById("choiceButtons");

    const endTitle = document.getElementById("endTitle");
    const endText = document.getElementById("endText");

    const phoneClock = document.getElementById("phoneClock");
    const homeTime = document.getElementById("homeTime");

    const messageBadge = document.getElementById("messageBadge");
    const clueBadge = document.getElementById("clueBadge");

    const cluesList = document.getElementById("cluesList");
    const playerNotes = document.getElementById("playerNotes");

    const lockedPhoto = document.getElementById("lockedPhoto");
    const photoUnlocked = document.getElementById("photoUnlocked");

    const callButton = document.getElementById("callButton");

    /* =====================================================
       ESTADO DO JOGO
    ====================================================== */

    let currentScene = 0;

    let clues = [];

    let notes = [];

    let trust = 0;

    let suspicion = 0;

    let courage = 0;

    let searchedPhone = false;

    let sawPhoto = false;

    let answeredCall = false;

    let discoveredPlatform = false;

    let discoveredTime = false;

    let discoveredHelena = false;

    let discoveredDaniel = false;

    let gameEnded = false;

    let notificationCount = 0;

    /* =====================================================
       DADOS DA HISTÓRIA
    ====================================================== */

    const scenes = [

        {
            id: 0,

            messages: [
                {
                    type: "received",
                    text: "Não conte para ninguém que eu estou falando com você."
                },

                {
                    type: "received",
                    text: "Eu sei que isso parece estranho."
                },

                {
                    type: "received",
                    text: "Mas você precisa confiar em mim."
                }
            ],

            choices: [
                {
                    text: "Quem é você?",
                    trust: 1,
                    next: 1
                },

                {
                    text: "Como conseguiu meu número?",
                    suspicion: 1,
                    next: 1
                },

                {
                    text: "Não vou continuar essa conversa.",
                    courage: 1,
                    next: 1
                }
            ]
        },


        {
            id: 1,

            messages: [
                {
                    type: "received",
                    text: "Meu nome não importa agora."
                },

                {
                    type: "received",
                    text: "O que importa é o que aconteceu naquela noite."
                },

                {
                    type: "received",
                    text: "Você estava na estação, não estava?"
                }
            ],

            choices: [
                {
                    text: "Sim. Como você sabe disso?",
                    trust: 1,
                    next: 2
                },

                {
                    text: "Não sei do que você está falando.",
                    suspicion: 1,
                    next: 2
                },

                {
                    text: "O que aconteceu naquela noite?",
                    courage: 1,
                    next: 2
                }
            ]
        },


        {
            id: 2,

            messages: [
                {
                    type: "received",
                    text: "Eu estava lá também."
                },

                {
                    type: "received",
                    text: "Mas você não me viu."
                },

                {
                    type: "received",
                    text: "Ninguém deveria ter me visto."
                },

                {
                    type: "received",
                    text: "Olhe sua galeria."
                },

                {
                    type: "received",
                    text: "Existe uma foto que você nunca percebeu."
                }
            ],

            choices: [
                {
                    text: "Vou olhar.",
                    trust: 1,
                    next: 3,
                    action: "photo"
                },

                {
                    text: "Por que eu deveria acreditar em você?",
                    suspicion: 1,
                    next: 3
                }
            ]
        },


        {
            id: 3,

            messages: [
                {
                    type: "received",
                    text: "Agora você entendeu."
                },

                {
                    type: "received",
                    text: "Aquela pessoa ao fundo não deveria estar ali."
                },

                {
                    type: "received",
                    text: "E você precisa descobrir quem ela é."
                },

                {
                    type: "received",
                    text: "Procure pelo nome Helena."
                }
            ],

            choices: [
                {
                    text: "Quem é Helena?",
                    courage: 1,
                    next: 4
                },

                {
                    text: "Por que você quer que eu procure por ela?",
                    suspicion: 1,
                    next: 4
                },

                {
                    text: "Eu conheço esse nome.",
                    trust: 1,
                    next: 4
                }
            ]
        },


        {
            id: 4,

            messages: [
                {
                    type: "received",
                    text: "Então você se lembra."
                },

                {
                    type: "received",
                    text: "Helena estava com Daniel naquela noite."
                },

                {
                    type: "received",
                    text: "Daniel desapareceu três dias depois."
                },

                {
                    type: "received",
                    text: "A polícia disse que ele foi embora por vontade própria."
                },

                {
                    type: "received",
                    text: "Mas eu sei que não foi isso."
                }
            ],

            choices: [
                {
                    text: "O que aconteceu com Daniel?",
                    courage: 1,
                    next: 5
                },

                {
                    text: "Você conhecia Daniel?",
                    trust: 1,
                    next: 5
                },

                {
                    text: "Isso está ficando perigoso.",
                    suspicion: 1,
                    next: 5
                }
            ]
        },


        {
            id: 5,

            messages: [
                {
                    type: "received",
                    text: "Daniel descobriu alguma coisa."
                },

                {
                    type: "received",
                    text: "Algo que não deveria ter descoberto."
                },

                {
                    type: "received",
                    text: "Ele me pediu ajuda."
                },

                {
                    type: "received",
                    text: "Eu cheguei tarde demais."
                },

                {
                    type: "received",
                    text: "Depois disso, tudo mudou."
                }
            ],

            choices: [
                {
                    text: "Você deixou Daniel sozinho?",
                    suspicion: 1,
                    next: 6
                },

                {
                    text: "O que ele descobriu?",
                    courage: 1,
                    next: 6
                },

                {
                    text: "Você tentou ajudá-lo?",
                    trust: 1,
                    next: 6
                }
            ]
        },


        {
            id: 6,

            messages: [
                {
                    type: "received",
                    text: "Uma coisa."
                },

                {
                    type: "received",
                    text: "A plataforma 4."
                },

                {
                    type: "received",
                    text: "E um horário."
                },

                {
                    type: "received",
                    text: "00:17."
                },

                {
                    type: "received",
                    text: "Nunca esqueça esses dois números."
                }
            ],

            choices: [
                {
                    text: "Vou anotar.",
                    trust: 1,
                    next: 7,
                    action: "platform"
                },

                {
                    text: "O que acontece às 00:17?",
                    courage: 1,
                    next: 7,
                    action: "time"
                },

                {
                    text: "Por que a plataforma 4?",
                    suspicion: 1,
                    next: 7,
                    action: "platform"
                }
            ]
        },


        {
            id: 7,

            messages: [
                {
                    type: "received",
                    text: "Eu não posso explicar tudo por mensagem."
                },

                {
                    type: "received",
                    text: "Existe alguém observando esta conversa."
                },

                {
                    type: "received",
                    text: "E essa pessoa sabe quem você é."
                },

                {
                    type: "received",
                    text: "Vou mandar um áudio."
                }
            ],

            choices: [
                {
                    text: "Pode mandar.",
                    trust: 1,
                    next: 8,
                    action: "audio"
                },

                {
                    text: "Não. Quero saber quem você é primeiro.",
                    suspicion: 1,
                    next: 8
                }
            ]
        },


        {
            id: 8,

            messages: [
                {
                    type: "audio",
                    text: "Áudio — 0:17",
                    audioText: "Se você está ouvindo isso, significa que eu ainda não fui encontrado."
                },

                {
                    type: "received",
                    text: "Agora você sabe demais."
                },

                {
                    type: "received",
                    text: "Desculpa."
                }
            ],

            choices: [
                {
                    text: "Quem está atrás de você?",
                    courage: 1,
                    next: 9
                },

                {
                    text: "Você está com medo?",
                    trust: 1,
                    next: 9
                },

                {
                    text: "Vou procurar ajuda.",
                    suspicion: 1,
                    next: 9
                }
            ]
        },


        {
            id: 9,

            messages: [
                {
                    type: "received",
                    text: "Não faça isso."
                },

                {
                    type: "received",
                    text: "Se contar para alguém, eles vão saber."
                },

                {
                    type: "received",
                    text: "Inclusive a pessoa que está perto de você agora."
                }
            ],

            choices: [
                {
                    text: "Quem está perto de mim?",
                    courage: 1,
                    next: 10
                },

                {
                    text: "Isso é uma ameaça?",
                    suspicion: 1,
                    next: 10
                },

                {
                    text: "Vou confiar em você.",
                    trust: 1,
                    next: 10
                }
            ]
        },


        {
            id: 10,

            messages: [
                {
                    type: "received",
                    text: "Olhe pela janela."
                },

                {
                    type: "received",
                    text: "Não acenda a luz."
                },

                {
                    type: "received",
                    text: "Tem alguém parado do outro lado da rua."
                }
            ],

            choices: [
                {
                    text: "Vou olhar.",
                    courage: 1,
                    next: 11
                },

                {
                    text: "Não vou fazer isso.",
                    trust: 1,
                    next: 11
                },

                {
                    text: "Como você sabe o que estou fazendo?",
                    suspicion: 1,
                    next: 11
                }
            ]
        },


        {
            id: 11,

            messages: [
                {
                    type: "received",
                    text: "Porque eu estou vendo você."
                },

                {
                    type: "received",
                    text: "Não da rua."
                },

                {
                    type: "received",
                    text: "Da câmera."
                },

                {
                    type: "received",
                    text: "Seu celular está comprometido."
                }
            ],

            choices: [
                {
                    text: "Como eu desligo isso?",
                    courage: 1,
                    next: 12
                },

                {
                    text: "Você fez isso?",
                    suspicion: 1,
                    next: 12
                },

                {
                    text: "Então você consegue me ver?",
                    trust: 1,
                    next: 12
                }
            ]
        },


        {
            id: 12,

            messages: [
                {
                    type: "received",
                    text: "Não."
                },

                {
                    type: "received",
                    text: "Eu só descobri como funciona."
                },

                {
                    type: "received",
                    text: "Foi assim que encontrei você."
                },

                {
                    type: "received",
                    text: "Mas existe uma maneira de descobrir quem está por trás disso."
                }
            ],

            choices: [
                {
                    text: "Qual?",
                    courage: 1,
                    next: 13
                },

                {
                    text: "Eu não confio mais em você.",
                    suspicion: 1,
                    next: 13
                }
            ]
        },


        {
            id: 13,

            messages: [
                {
                    type: "received",
                    text: "Atenda a próxima ligação."
                },

                {
                    type: "received",
                    text: "Mesmo que o número seja privado."
                },

                {
                    type: "received",
                    text: "Essa será sua única oportunidade."
                }
            ],

            choices: [
                {
                    text: "Vou atender.",
                    courage: 1,
                    next: 14,
                    action: "call"
                },

                {
                    text: "Não vou atender.",
                    suspicion: 1,
                    next: 14
                }
            ]
        },


        {
            id: 14,

            messages: [
                {
                    type: "received",
                    text: "A ligação está chegando."
                }
            ],

            choices: [
                {
                    text: "Esperar.",
                    trust: 1,
                    next: 15
                },

                {
                    text: "Desligar o celular.",
                    courage: 1,
                    next: 15
                }
            ]
        },


        {
            id: 15,

            messages: [
                {
                    type: "received",
                    text: "Você ouviu a voz?"
                },

                {
                    type: "received",
                    text: "Era Helena."
                },

                {
                    type: "received",
                    text: "Agora você sabe quem está envolvida."
                }
            ],

            choices: [
                {
                    text: "Quem é você afinal?",
                    courage: 1,
                    next: 16
                },

                {
                    text: "Helena está atrás disso?",
                    suspicion: 1,
                    next: 16
                },

                {
                    text: "Eu quero ajudar você.",
                    trust: 1,
                    next: 16
                }
            ]
        },


        {
            id: 16,

            messages: [
                {
                    type: "received",
                    text: "Meu nome é Yuri."
                },

                {
                    type: "received",
                    text: "Daniel era meu irmão."
                },

                {
                    type: "received",
                    text: "E Helena era a última pessoa que esteve com ele."
                },

                {
                    type: "received",
                    text: "Agora você precisa decidir se vai até a estação."
                }
            ],

            choices: [
                {
                    text: "Eu vou.",
                    courage: 2,
                    next: 17
                },

                {
                    text: "Não. Isso é perigoso demais.",
                    trust: 1,
                    next: 17
                },

                {
                    text: "Quero saber toda a verdade primeiro.",
                    suspicion: 1,
                    next: 17
                }
            ]
        },


        {
            id: 17,

            messages: [
                {
                    type: "received",
                    text: "Então escute com atenção."
                },

                {
                    type: "received",
                    text: "Plataforma 4."
                },

                {
                    type: "received",
                    text: "00:17."
                },

                {
                    type: "received",
                    text: "Leve a foto."
                },

                {
                    type: "received",
                    text: "E não confie em quem disser que conhece Daniel."
                }
            ],

            choices: [
                {
                    text: "Eu vou descobrir a verdade.",
                    courage: 2,
                    next: 18
                },

                {
                    text: "Vou procurar a polícia.",
                    trust: 1,
                    next: 18
                },

                {
                    text: "Vou guardar a foto e investigar sozinho.",
                    suspicion: 1,
                    next: 18
                }
            ]
        },


        {
            id: 18,

            messages: [
                {
                    type: "received",
                    text: "Está começando."
                },

                {
                    type: "received",
                    text: "Se alguma coisa acontecer comigo..."
                },

                {
                    type: "received",
                    text: "abra a foto novamente."
                },

                {
                    type: "received",
                    text: "Olhe para o reflexo."
                }
            ],

            choices: [
                {
                    text: "O reflexo?",
                    courage: 1,
                    next: 19
                },

                {
                    text: "O que existe no reflexo?",
                    suspicion: 1,
                    next: 19
                }
            ]
        },


        {
            id: 19,

            messages: [
                {
                    type: "received",
                    text: "Você."
                },

                {
                    type: "received",
                    text: "Você estava naquela fotografia."
                },

                {
                    type: "received",
                    text: "Mas a foto foi tirada antes de você chegar."
                },

                {
                    type: "received",
                    text: "Isso significa que alguém já sabia que você estaria lá."
                }
            ],

            choices: [
                {
                    text: "Isso não faz sentido.",
                    suspicion: 1,
                    next: 20
                },

                {
                    text: "Quem sabia?",
                    courage: 1,
                    next: 20
                },

                {
                    text: "Você sabia?",
                    trust: 1,
                    next: 20
                }
            ]
        },


        {
            id: 20,

            messages: [
                {
                    type: "received",
                    text: "Eu não."
                },

                {
                    type: "received",
                    text: "Mas agora descobri."
                },

                {
                    type: "received",
                    text: "E acho que você também está perto de descobrir."
                },

                {
                    type: "received",
                    text: "Última pista."
                },

                {
                    type: "received",
                    text: "Olhe o horário da foto."
                }
            ],

            choices: [
                {
                    text: "23:17...",
                    courage: 1,
                    next: 21
                },

                {
                    text: "00:17...",
                    trust: 1,
                    next: 21
                }
            ]
        },


        {
            id: 21,

            messages: [
                {
                    type: "received",
                    text: "Exatamente."
                },

                {
                    type: "received",
                    text: "Um minuto antes da meia-noite."
                },

                {
                    type: "received",
                    text: "A estação fecha às 23:30."
                },

                {
                    type: "received",
                    text: "Então alguém estava lá depois do horário."
                }
            ],

            choices: [
                {
                    text: "Eu vou até a estação.",
                    courage: 2,
                    next: 22
                },

                {
                    text: "Eu quero sair disso.",
                    trust: 1,
                    next: 22
                }
            ]
        },


        {
            id: 22,

            messages: [
                {
                    type: "received",
                    text: "Tudo bem."
                },

                {
                    type: "received",
                    text: "Qualquer que seja sua decisão..."
                },

                {
                    type: "received",
                    text: "obrigado por ter continuado comigo."
                },

                {
                    type: "received",
                    text: "Agora o próximo passo é seu."
                }
            ],

            choices: [
                {
                    text: "Ir até a estação.",
                    courage: 2,
                    next: "final"
                },

                {
                    text: "Encerrar a conversa.",
                    trust: 1,
                    next: "final"
                },

                {
                    text: "Investigar tudo sozinho.",
                    suspicion: 2,
                    next: "final"
                }
            ]
        }

    ];


    /* =====================================================
       INICIAR JOGO
    ====================================================== */

    function startGame() {

        currentScene = 0;

        clues = [];

        notes = [];

        trust = 0;

        suspicion = 0;

        courage = 0;

        searchedPhone = false;

        sawPhoto = false;

        answeredCall = false;

        discoveredPlatform = false;

        discoveredTime = false;

        discoveredHelena = false;

        discoveredDaniel = false;

        gameEnded = false;

        notificationCount = 0;

        startScreen.classList.add("hidden");

        endScreen.classList.add("hidden");

        gameScreen.classList.remove("hidden");

        showHome();

        updateClock();

        setTimeout(() => {

            addNotification(
                "Número Desconhecido",
                "Você recebeu uma nova mensagem."
            );

        }, 800);

        setTimeout(() => {

            openMessages();

        }, 1600);
    }


    /* =====================================================
       REINICIAR
    ====================================================== */

    function restartGame() {

        endScreen.classList.add("hidden");

        gameScreen.classList.remove("hidden");

        startGame();

    }


    /* =====================================================
       HOME
    ====================================================== */

    function showHome() {

        hideAllApps();

        const home = document.getElementById("homeScreen");

        if (home) {
            home.classList.remove("hidden");
        }

        updateHomeClock();
    }


    /* =====================================================
       ABRIR MENSAGENS
    ====================================================== */

    function openMessages() {

        hideAllApps();

        const app = document.getElementById("messagesApp");

        if (!app) return;

        app.classList.remove("hidden");

        messageBadge.classList.add("hidden");

        if (currentScene === 0 && chat.children.length <= 1) {

            playScene(0);

        }
    }


    /* =====================================================
       ABRIR APLICATIVO
    ====================================================== */

    function openApp(name) {

        hideAllApps();

        const app = document.getElementById(name + "App");

        if (!app) return;

        app.classList.remove("hidden");

        if (name === "gallery") {

            updateGallery();

        }

        if (name === "clues") {

            updateClues();

        }

        if (name === "notes") {

            updateNotes();

        }

        if (name === "phone") {

            searchedPhone = true;

            addClue(
                "Chamadas desconhecidas",
                "Há registros de chamadas privadas e chamadas do número desconhecido."
            );

        }
    }


    /* =====================================================
       ESCONDER APLICATIVOS
    ====================================================== */

    function hideAllApps() {

        const screens = document.querySelectorAll(".phone-screen");

        screens.forEach(screen => {

            screen.classList.add("hidden");

        });
    }


    /* =====================================================
       CENA
    ====================================================== */

    async function playScene(sceneIndex) {

        const scene = scenes[sceneIndex];

        if (!scene || gameEnded) return;

        currentScene = sceneIndex;

        choices.classList.add("hidden");

        choiceButtons.innerHTML = "";

        for (const message of scene.messages) {

            await wait(500);

            if (message.type === "received") {

                addMessage(
                    message.text,
                    "received"
                );

            }

            else if (message.type === "audio") {

                addAudioMessage(
                    message.text,
                    message.audioText
                );

            }

            await wait(450);
        }

        showChoices(scene.choices);
    }


    /* =====================================================
       ADICIONAR MENSAGEM
    ====================================================== */

    function addMessage(text, type = "received") {

        const message = document.createElement("div");

        message.className =
            "message " + type;

        const bubble = document.createElement("div");

        bubble.className =
            "message-bubble";

        bubble.textContent = text;

        const time = document.createElement("span");

        time.className = "message-time";

        time.textContent = getGameTime();

        bubble.appendChild(time);

        message.appendChild(bubble);

        chat.appendChild(message);

        scrollChat();
    }


    /* =====================================================
       MENSAGEM DE ÁUDIO
    ====================================================== */

    function addAudioMessage(title, audioText) {

        const message = document.createElement("div");

        message.className =
            "message received";

        const bubble = document.createElement("div");

        bubble.className =
            "message-bubble";

        const audio = document.createElement("div");

        audio.className =
            "audio-message";

        const button = document.createElement("button");

        button.className =
            "audio-button";

        button.textContent = "▶";

        const wave = document.createElement("div");

        wave.className =
            "audio-wave";

        for (let i = 0; i < 5; i++) {

            const span =
                document.createElement("span");

            wave.appendChild(span);
        }

        audio.appendChild(button);

        audio.appendChild(wave);

        bubble.appendChild(audio);

        const label =
            document.createElement("div");

        label.style.marginTop = "8px";

        label.style.fontSize = "10px";

        label.style.color = "#999";

        label.textContent = title;

        bubble.appendChild(label);

        const time =
            document.createElement("span");

        time.className = "message-time";

        time.textContent =
            getGameTime();

        bubble.appendChild(time);

        message.appendChild(bubble);

        chat.appendChild(message);

        button.addEventListener(
            "click",
            () => {

                if (button.textContent === "▶") {

                    button.textContent = "■";

                    speakText(audioText);

                    setTimeout(() => {

                        button.textContent = "▶";

                    }, 4500);

                }

            }
        );

        scrollChat();
    }


    /* =====================================================
       ESCOLHAS
    ====================================================== */

    function showChoices(options) {

        choices.classList.remove("hidden");

        choiceButtons.innerHTML = "";

        options.forEach((option) => {

            const button =
                document.createElement("button");

            button.className =
                "choice-button";

            button.textContent =
                option.text;

            button.addEventListener(
                "click",
                () => {

                    chooseOption(option);

                }
            );

            choiceButtons.appendChild(button);

        });
    }


    /* =====================================================
       ESCOLHER
    ====================================================== */

    function chooseOption(option) {

        choices.classList.add("hidden");

        addMessage(
            option.text,
            "sent"
        );

        if (option.trust) {

            trust += option.trust;

        }

        if (option.suspicion) {

            suspicion += option.suspicion;

        }

        if (option.courage) {

            courage += option.courage;

        }

        executeAction(option.action);

        if (option.next === "final") {

            setTimeout(() => {

                determineEnding();

            }, 1600);

            return;
        }

        setTimeout(() => {

            playScene(option.next);

        }, 900);
    }


    /* =====================================================
       AÇÕES
    ====================================================== */

    function executeAction(action) {

        if (!action) return;

        if (action === "photo") {

            sawPhoto = true;

            addClue(
                "Fotografia misteriosa",
                "Existe uma pessoa ao fundo da fotografia. O horário registrado chama atenção."
            );

            updateGallery();

        }


        if (action === "platform") {

            discoveredPlatform = true;

            addClue(
                "Plataforma 4",
                "O número 4 parece estar diretamente relacionado ao desaparecimento de Daniel."
            );

            addNote(
                "Plataforma 4 — parece ser importante."
            );

        }


        if (action === "time") {

            discoveredTime = true;

            addClue(
                "00:17",
                "O horário 00:17 aparece várias vezes na investigação."
            );

            addNote(
                "00:17 — horário que Yuri pediu para eu não esquecer."
            );

        }


        if (action === "audio") {

            addClue(
                "Áudio de Yuri",
                "Yuri afirma que ainda não foi encontrado e parece estar sendo perseguido."
            );

        }


        if (action === "call") {

            answeredCall = true;

            addClue(
                "Ligação privada",
                "Uma chamada privada parece estar ligada diretamente a Helena."
            );

        }

        updateClueBadge();

    }


    /* =====================================================
       PISTAS
    ====================================================== */

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

        updateClues();

        updateClueBadge();
    }


    function updateClues() {

        if (!cluesList) return;

        cluesList.innerHTML = "";

        if (clues.length === 0) {

            const empty =
                document.createElement("div");

            empty.className =
                "empty-clues";

            empty.textContent =
                "Nenhuma pista encontrada.";

            cluesList.appendChild(empty);

            return;
        }

        clues.forEach(clue => {

            const element =
                document.createElement("div");

            element.className =
                "clue";

            element.innerHTML = `
                <strong>${escapeHTML(clue.title)}</strong>
                <p>${escapeHTML(clue.description)}</p>
            `;

            cluesList.appendChild(element);

        });
    }


    function updateClueBadge() {

        if (!clueBadge) return;

        if (clues.length > 0) {

            clueBadge.textContent =
                clues.length;

            clueBadge.classList.remove(
                "hidden"
            );

        } else {

            clueBadge.classList.add(
                "hidden"
            );

        }
    }


    /* =====================================================
       NOTAS
    ====================================================== */

    function addNote(text) {

        if (
            notes.includes(text)
        ) {

            return;

        }

        notes.push(text);

        updateNotes();
    }


    function updateNotes() {

        if (!playerNotes) return;

        if (notes.length === 0) {

            playerNotes.textContent =
                "Ainda não escrevi nada...";

            return;

        }

        playerNotes.textContent =
            notes.map(
                note => "• " + note
            ).join("\n\n");
    }


    /* =====================================================
       GALERIA
    ====================================================== */

    function updateGallery() {

        if (!lockedPhoto ||
            !photoUnlocked) return;

        if (sawPhoto) {

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


    /* =====================================================
       RELÓGIO
    ====================================================== */

    function updateClock() {

        updateHomeClock();

        setInterval(
            updateHomeClock,
            1000
        );
    }


    function updateHomeClock() {

        const now =
            new Date();

        const hours =
            String(
                now.getHours()
            ).padStart(2, "0");

        const minutes =
            String(
                now.getMinutes()
            ).padStart(2, "0");

        const time =
            hours + ":" + minutes;

        if (phoneClock) {

            phoneClock.textContent =
                time;

        }

        if (homeTime) {

            homeTime.textContent =
                time;

        }
    }


    function getGameTime() {

        const now =
            new Date();

        return (
            String(
                now.getHours()
            ).padStart(2, "0")
            +
            ":"
            +
            String(
                now.getMinutes()
            ).padStart(2, "0")
        );
    }


    /* =====================================================
       NOTIFICAÇÃO
    ====================================================== */

    function addNotification(
        title,
        text
    ) {

        const area =
            document.getElementById(
                "notificationArea"
            );

        if (!area) return;

        notificationCount++;

        if (messageBadge) {

            messageBadge.textContent =
                notificationCount;

            messageBadge.classList.remove(
                "hidden"
            );

        }

        const notification =
            document.createElement("div");

        notification.className =
            "notification";

        notification.innerHTML = `
            <div class="app-icon messages-icon"
                 style="width:42px;height:42px;font-size:18px;">
                💬
            </div>

            <div>
                <strong style="display:block;font-size:12px;">
                    ${escapeHTML(title)}
                </strong>

                <span style="display:block;
                             margin-top:4px;
                             color:#9699a5;
                             font-size:10px;">
                    ${escapeHTML(text)}
                </span>
            </div>
        `;

        area.prepend(notification);

        setTimeout(() => {

            notification.remove();

        }, 6000);
    }


    /* =====================================================
       CHAMADA
    ====================================================== */

    if (callButton) {

        callButton.addEventListener(
            "click",
            () => {

                answeredCall = true;

                addClue(
                    "Ligação",
                    "Você decidiu atender a ligação privada."
                );

                alert(
                    "Você ouve uma respiração do outro lado.\n\n" +
                    "\"Não vá para a plataforma 4 sozinho.\"\n\n" +
                    "A ligação é encerrada."
                );

            }
        );
    }


    /* =====================================================
       BOTÕES DOS APLICATIVOS
    ====================================================== */

    document.querySelectorAll(
        "[data-app]"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const app =
                    button.dataset.app;

                openApp(app);

            }
        );
    });


    /* =====================================================
       BOTÕES VOLTAR
    ====================================================== */

    document.querySelectorAll(
        "[data-back]"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showHome();

            }
        );
    });


    /* =====================================================
       FINAL
    ====================================================== */

    function determineEnding() {

        gameEnded = true;

        gameScreen.classList.add(
            "hidden"
        );

        endScreen.classList.remove(
            "hidden"
        );


        let title = "";

        let text = "";


        /*
         * FINAL 1 — VERDADE
         */

        if (
            courage >= 8 &&
            clues.length >= 4
        ) {

            title =
                "A VERDADE";

            text =
                "Você decidiu continuar mesmo quando tudo parecia errado. " +
                "As pistas levaram você até a plataforma 4. " +
                "Agora você sabe o que aconteceu com Daniel — " +
                "mas percebe que essa história ainda não terminou.";

        }


        /*
         * FINAL 2 — CONFIANÇA
         */

        else if (
            trust >= 8
        ) {

            title =
                "A ÚLTIMA MENSAGEM";

            text =
                "Você escolheu confiar em Yuri. " +
                "Ele finalmente revela que Daniel deixou uma mensagem " +
                "antes de desaparecer. " +
                "A investigação pode continuar, mas agora você sabe " +
                "que não está sozinho.";

        }


        /*
         * FINAL 3 — DESCONFIANÇA
         */

        else if (
            suspicion >= 7
        ) {

            title =
                "NÃO CONFIE EM NINGUÉM";

            text =
                "Você percebeu cedo demais que algumas informações " +
                "não faziam sentido. " +
                "Você encerra a conversa antes de descobrir toda a verdade. " +
                "Horas depois, todas as mensagens desaparecem.";

        }


        /*
         * FINAL 4 — ESTAÇÃO
         */

        else if (
            discoveredPlatform &&
            discoveredTime
        ) {

            title =
                "00:17";

            text =
                "Você chega à estação e encontra a plataforma 4 vazia. " +
                "O relógio marca exatamente 00:17. " +
                "Então seu celular recebe uma última mensagem:" +
                "\n\n\"Você chegou.\"";

        }


        /*
         * FINAL 5 — SECRETO
         */

        else if (
            sawPhoto &&
            answeredCall &&
            discoveredHelena
        ) {

            title =
                "O REFLEXO";

            text =
                "Você volta para a fotografia e aumenta o zoom. " +
                "No reflexo da janela existe alguém que não deveria estar ali. " +
                "A pessoa está segurando exatamente o mesmo celular que você.";

        }


        /*
         * FINAL PADRÃO
         */

        else {

            title =
                "CONTINUA...";

            text =
                "Você decidiu parar por enquanto. " +
                "Mas, antes de bloquear o número, uma última mensagem aparece:" +
                "\n\n\"Isso ainda não acabou.\"";

        }


        endTitle.textContent =
            title;

        endText.textContent =
            text;
    }


    /* =====================================================
       TEXTO FALADO
    ====================================================== */

    function speakText(text) {

        if (
            !("speechSynthesis" in window)
        ) {

            return;

        }

        window.speechSynthesis.cancel();

        const utterance =
            new SpeechSynthesisUtterance(
                text
            );

        utterance.lang =
            "pt-BR";

        utterance.rate =
            0.88;

        utterance.pitch =
            0.85;

        window.speechSynthesis.speak(
            utterance
        );
    }


    /* =====================================================
       SCROLL DO CHAT
    ====================================================== */

    function scrollChat() {

        setTimeout(() => {

            chat.scrollTop =
                chat.scrollHeight;

        }, 50);
    }


    /* =====================================================
       UTILITÁRIOS
    ====================================================== */

    function wait(ms) {

        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    ms
                )
        );
    }


    function escapeHTML(text) {

        const div =
            document.createElement(
                "div"
            );

        div.textContent =
            text;

        return div.innerHTML;
    }


    /* =====================================================
       EVENTOS PRINCIPAIS
    ====================================================== */

    if (startButton) {

        startButton.addEventListener(
            "click",
            startGame
        );

    }


    if (restartButton) {

        restartButton.addEventListener(
            "click",
            restartGame
        );

    }


    /* =====================================================
       ESTADO INICIAL
    ====================================================== */

    startScreen.classList.remove(
        "hidden"
    );

    gameScreen.classList.add(
        "hidden"
    );

    endScreen.classList.add(
        "hidden"
    );

    updateHomeClock();

});


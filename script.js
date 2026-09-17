/* =========================================================
   ÚLTIMO TREM
   Jogo 2D de exploração, mistério e escolhas
   ========================================================= */


/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const SAVE_KEY = "ultimo_trem_save_v1";

const keys = {};

let gameRunning = false;
let dialogueActive = false;
let puzzleActive = false;

let lastTime = 0;

const WORLD = {
    width: 2400,
    height: 1500
};


/* =========================================================
   ESTADO DO JOGO
   ========================================================= */

let game = {

    player: {
        x: 450,
        y: 700,
        width: 28,
        height: 38,

        speed: 210,

        direction: "down",

        lives: 3,
        energy: 100,

        coins: 20,

        level: 1,
        xp: 0,

        maxEnergy: 100
    },

    location: "central",

    clues: 0,

    trainTrips: 0,

    time: 18 * 60,

    flags: {},

    inventory: [],

    missions: [],

    completedMissions: [],

    visited: [],

    endings: [],

    stats: {
        steps: 0,
        interactions: 0,
        itemsFound: 0,
        npcsTalked: 0
    }

};


/* =========================================================
   ITENS
   ========================================================= */

const ITEMS = {

    oldKey: {
        name: "Chave antiga",
        icon: "🗝️",
        description: "Uma chave enferrujada encontrada nos túneis."
    },

    flashlight: {
        name: "Lanterna",
        icon: "🔦",
        description: "Ainda possui alguma carga."
    },

    metroTicket: {
        name: "Bilhete antigo",
        icon: "🎫",
        description: "Data ilegível. O destino foi apagado."
    },

    hospitalCard: {
        name: "Cartão hospitalar",
        icon: "💳",
        description: "Pertencia a alguém chamado Elias."
    },

    strangeCoin: {
        name: "Moeda estranha",
        icon: "🪙",
        description: "Uma moeda que não parece pertencer a este lugar."
    },

    photograph: {
        name: "Fotografia",
        icon: "📷",
        description: "Mostra a estação quando ela ainda estava aberta."
    },

    redNote: {
        name: "Bilhete vermelho",
        icon: "📝",
        description: "Alguém escreveu: 'Não embarque no último.'"
    },

    conductorBadge: {
        name: "Distintivo do condutor",
        icon: "🎖️",
        description: "Um distintivo muito antigo."
    },

    masterKey: {
        name: "Chave mestra",
        icon: "🔑",
        description: "Abre a porta que leva à Sala 0."
    }

};


/* =========================================================
   ÁREAS
   ========================================================= */

const AREAS = {

    central: {
        name: "Estação Central",
        color: "#151b2b",
        floor: "#20283a"
    },

    downtown: {
        name: "Centro Abandonado",
        color: "#202022",
        floor: "#333333"
    },

    rain: {
        name: "Distrito da Chuva",
        color: "#111d25",
        floor: "#20313a"
    },

    park: {
        name: "Parque das Lanternas",
        color: "#0d1e18",
        floor: "#17352a"
    },

    hospital: {
        name: "Hospital São Lucas",
        color: "#202329",
        floor: "#353941"
    },

    oldtown: {
        name: "Cidade Antiga",
        color: "#241b1b",
        floor: "#3a2929"
    },

    tunnels: {
        name: "Túneis",
        color: "#101015",
        floor: "#202027"
    },

    room0: {
        name: "Sala 0",
        color: "#050509",
        floor: "#101015"
    }

};


/* =========================================================
   DESBLOQUEIO DAS ÁREAS
   ========================================================= */

function isAreaUnlocked(area) {

    if (area === "central") return true;

    if (area === "downtown") return true;

    if (area === "rain") {
        return game.clues >= 1;
    }

    if (area === "park") {
        return game.clues >= 2;
    }

    if (area === "hospital") {
        return game.clues >= 3;
    }

    if (area === "oldtown") {
        return game.clues >= 4;
    }

    if (area === "tunnels") {
        return hasItem("oldKey") || game.clues >= 5;
    }

    if (area === "room0") {
        return game.clues >= 7 &&
               hasItem("masterKey");
    }

    return false;
}


/* =========================================================
   MISSÕES
   ========================================================= */

const MISSION_DATA = {

    investigate: {
        title: "A estação vazia",
        description:
            "Explore a Estação Central e descubra por que ela está completamente vazia."
    },

    ticket: {
        title: "O bilhete impossível",
        description:
            "Encontre um bilhete antigo e descubra para onde o último trem deveria ir."
    },

    hospital: {
        title: "O paciente 404",
        description:
            "Descubra quem era Elias e por que seu nome aparece nos registros."
    },

    tunnels: {
        title: "Debaixo da cidade",
        description:
            "Entre nos túneis e descubra o que existe além da estação."
    },

    room0: {
        title: "Sala 0",
        description:
            "Abra a porta misteriosa e descubra a verdade sobre o último trem."
    }

};


/* =========================================================
   MISSÕES INICIAIS
   ========================================================= */

function initializeMissions() {

    game.missions = [
        "investigate",
        "ticket",
        "hospital",
        "tunnels",
        "room0"
    ];

}


/* =========================================================
   INVENTÁRIO
   ========================================================= */

function hasItem(id) {

    return game.inventory.includes(id);

}


function addItem(id) {

    if (!ITEMS[id]) return;

    if (hasItem(id)) return;

    game.inventory.push(id);

    game.stats.itemsFound++;

    showNotification(
        ITEMS[id].icon,
        `Você encontrou: ${ITEMS[id].name}`
    );

    gainXP(20);

    saveGame();

}


function removeItem(id) {

    const index = game.inventory.indexOf(id);

    if (index !== -1) {
        game.inventory.splice(index, 1);
    }

}


/* =========================================================
   XP / LEVEL
   ========================================================= */

function xpRequired() {

    return game.player.level * 100;

}


function gainXP(amount) {

    game.player.xp += amount;

    while (game.player.xp >= xpRequired()) {

        game.player.xp -= xpRequired();

        game.player.level++;

        game.player.maxEnergy += 10;

        game.player.energy = game.player.maxEnergy;

        showNotification(
            "⭐",
            `Você alcançou o nível ${game.player.level}!`
        );

    }

    updateUI();

}


/* =========================================================
   PISTAS
   ========================================================= */

function addClue(text) {

    if (!game.flags.clues) {
        game.flags.clues = [];
    }

    if (game.flags.clues.includes(text)) {
        return;
    }

    game.flags.clues.push(text);

    game.clues++;

    showNotification(
        "🔎",
        `Nova pista encontrada! (${game.clues})`
    );

    gainXP(35);

    saveGame();

}


/* =========================================================
   NOTIFICAÇÕES
   ========================================================= */

let notificationTimeout;

function showNotification(icon, text) {

    const notification =
        document.getElementById("notification");

    document.getElementById("notificationIcon")
        .textContent = icon;

    document.getElementById("notificationText")
        .textContent = text;

    notification.classList.add("show");

    clearTimeout(notificationTimeout);

    notificationTimeout = setTimeout(() => {

        notification.classList.remove("show");

    }, 2800);

}


/* =========================================================
   DIÁLOGOS
   ========================================================= */

let dialogueQueue = [];

function openDialogue(name, text, choices = null, callback = null) {

    dialogueActive = true;

    document.getElementById("dialogueModal")
        .classList.add("active");

    document.getElementById("dialogueName")
        .textContent = name;

    document.getElementById("dialogueText")
        .textContent = text;

    const choicesContainer =
        document.getElementById("dialogueChoices");

    choicesContainer.innerHTML = "";

    if (choices) {

        document.getElementById("dialogueContinue")
            .style.display = "none";

        choices.forEach(choice => {

            const button =
                document.createElement("button");

            button.className = "choice-button";

            button.textContent = choice.text;

            button.onclick = () => {

                closeDialogue();

                if (choice.action) {
                    choice.action();
                }

            };

            choicesContainer.appendChild(button);

        });

    } else {

        document.getElementById("dialogueContinue")
            .style.display = "block";

        document.getElementById("dialogueContinue")
            .onclick = () => {

                closeDialogue();

                if (callback) {
                    callback();
                }

            };

    }

}


function closeDialogue() {

    dialogueActive = false;

    document.getElementById("dialogueModal")
        .classList.remove("active");

}


/* =========================================================
   NPCS
   ========================================================= */

const NPCS = {

    mara: {

        name: "Mara",

        color: "#bd7bff",

        x: 570,
        y: 650,

        location: "central",

        interact() {

            game.stats.npcsTalked++;

            if (!game.flags.maraFirst) {

                game.flags.maraFirst = true;

                openDialogue(
                    "Mara",
                    "Você também está esperando o trem?",
                    [
                        {
                            text: "Que trem?",
                            action() {

                                openDialogue(
                                    "Mara",
                                    "O último. Ele passa quando o relógio marca meia-noite."
                                );

                                addClue(
                                    "Mara diz que o último trem passa à meia-noite."
                                );

                            }
                        },

                        {
                            text: "Você sabe o que aconteceu aqui?",
                            action() {

                                openDialogue(
                                    "Mara",
                                    "Todos foram embora. Ou pelo menos era isso que deveriam ter feito."
                                );

                                addClue(
                                    "Mara acredita que os passageiros deveriam ter deixado a estação."
                                );

                            }
                        }

                    ]
                );

            } else {

                openDialogue(
                    "Mara",
                    "O relógio está correndo. Não confie em tudo o que você encontrar."
                );

            }

        }

    },


    conductor: {

        name: "Condutor",

        x: 350,
        y: 720,

        location: "central",

        interact() {

            if (!game.flags.conductor) {

                game.flags.conductor = true;

                openDialogue(
                    "Condutor",
                    "Você não deveria estar aqui. Este trem não aparece para passageiros comuns.",
                    [
                        {
                            text: "Então quem pode embarcar?",
                            action() {

                                openDialogue(
                                    "Condutor",
                                    "Quem já esteve aqui antes."
                                );

                                addClue(
                                    "O condutor diz que o trem transporta pessoas que já estiveram na estação."
                                );

                            }
                        },

                        {
                            text: "Me leve para algum lugar.",
                            action() {

                                closeDialogue();

                                openTrainMenu();

                            }
                        }

                    ]
                );

            } else {

                openDialogue(
                    "Condutor",
                    "Escolha seu destino. Mas lembre-se: cada viagem muda alguma coisa."
                );

            }

        }

    },


    elias: {

        name: "Elias",

        x: 500,
        y: 500,

        location: "hospital",

        interact() {

            if (!hasItem("hospitalCard")) {

                openDialogue(
                    "Elias",
                    "Você encontrou meu cartão...",
                    [
                        {
                            text: "Você é Elias?",
                            action() {

                                openDialogue(
                                    "Elias",
                                    "Era assim que me chamavam."
                                );

                                addClue(
                                    "Elias parece não ter certeza sobre a própria identidade."
                                );

                            }
                        },

                        {
                            text: "O que aconteceu no hospital?",
                            action() {

                                openDialogue(
                                    "Elias",
                                    "O relógio parou. Depois disso, ninguém conseguiu sair."
                                );

                                addClue(
                                    "O relógio do hospital parou antes do desaparecimento."
                                );

                            }
                        }

                    ]
                );

            } else {

                openDialogue(
                    "Elias",
                    "O cartão deveria ter ficado comigo. Como você o encontrou?"
                );

            }

        }

    },


    oldWoman: {

        name: "Senhora",

        x: 700,
        y: 600,

        location: "oldtown",

        interact() {

            if (!game.flags.oldWoman) {

                game.flags.oldWoman = true;

                openDialogue(
                    "Senhora",
                    "Há anos eu vejo esse mesmo trem passar.",
                    [
                        {
                            text: "Há quanto tempo?",
                            action() {

                                openDialogue(
                                    "Senhora",
                                    "Desde antes de a estação ser construída."
                                );

                                addClue(
                                    "A senhora diz que o trem existe desde antes da estação."
                                );

                            }
                        },

                        {
                            text: "Quem está dentro dele?",
                            action() {

                                openDialogue(
                                    "Senhora",
                                    "Às vezes, pessoas que você conhece."
                                );

                                addClue(
                                    "Algumas pessoas no trem podem ser conhecidas do jogador."
                                );

                            }
                        }

                    ]
                );

            } else {

                openDialogue(
                    "Senhora",
                    "A Sala 0 não aparece no mapa."
                );

            }

        }

    }

};


/* =========================================================
   OBJETOS DO MUNDO
   ========================================================= */

const OBJECTS = [

    {
        id: "ticket",

        x: 720,
        y: 750,

        location: "central",

        icon: "🎫",

        radius: 35,

        interact() {

            if (!hasItem("metroTicket")) {

                addItem("metroTicket");

                addClue(
                    "O bilhete indica que o último trem não possui destino."
                );

            } else {

                openDialogue(
                    "Bilhete",
                    "O destino continua ilegível."
                );

            }

        }

    },


    {
        id: "flashlight",

        x: 350,
        y: 820,

        location: "central",

        icon: "🔦",

        radius: 35,

        interact() {

            addItem("flashlight");

        }

    },


    {
        id: "photograph",

        x: 900,
        y: 580,

        location: "downtown",

        icon: "📷",

        radius: 35,

        interact() {

            if (!hasItem("photograph")) {

                addItem("photograph");

                addClue(
                    "A fotografia mostra a Estação Central cheia de pessoas."
                );

            }

        }

    },


    {
        id: "redNote",

        x: 1200,
        y: 800,

        location: "rain",

        icon: "📝",

        radius: 35,

        interact() {

            if (!hasItem("redNote")) {

                addItem("redNote");

                addClue(
                    "O bilhete vermelho diz para não embarcar no último trem."
                );

            }

        }

    },


    {
        id: "hospitalCard",

        x: 550,
        y: 720,

        location: "hospital",

        icon: "💳",

        radius: 35,

        interact() {

            if (!hasItem("hospitalCard")) {

                addItem("hospitalCard");

                addClue(
                    "O cartão hospitalar pertence a Elias."
                );

            }

        }

    },


    {
        id: "strangeCoin",

        x: 900,
        y: 850,

        location: "park",

        icon: "🪙",

        radius: 35,

        interact() {

            if (!hasItem("strangeCoin")) {

                addItem("strangeCoin");

                addClue(
                    "A moeda possui o mesmo símbolo encontrado na estação."
                );

            }

        }

    },


    {
        id: "oldKey",

        x: 450,
        y: 850,

        location: "tunnels",

        icon: "🗝️",

        radius: 35,

        interact() {

            addItem("oldKey");

            addClue(
                "A chave parece abrir uma porta muito antiga."
            );

        }

    },


    {
        id: "masterKey",

        x: 1200,
        y: 500,

        location: "tunnels",

        icon: "🔑",

        radius: 35,

        interact() {

            if (game.clues >= 6) {

                addItem("masterKey");

                addClue(
                    "A chave mestra possui o símbolo da Sala 0."
                );

            } else {

                openDialogue(
                    "Porta",
                    "Há alguma coisa atrás dela. Talvez você ainda não saiba o suficiente."
                );

            }

        }

    }

];


/* =========================================================
   PORTAS / OBJETOS ESPECIAIS
   ========================================================= */

const SPECIAL_OBJECTS = [

    {
        id: "hospitalDoor",

        x: 1200,
        y: 500,

        location: "central",

        icon: "🏥",

        radius: 50,

        interact() {

            if (isAreaUnlocked("hospital")) {

                travelTo("hospital");

            } else {

                openDialogue(
                    "Mapa",
                    "Você ainda não possui pistas suficientes para descobrir como chegar ao hospital."
                );

            }

        }

    },


    {
        id: "tunnelDoor",

        x: 1100,
        y: 1000,

        location: "central",

        icon: "🚪",

        radius: 50,

        interact() {

            if (isAreaUnlocked("tunnels")) {

                travelTo("tunnels");

            } else {

                openDialogue(
                    "Porta",
                    "Está trancada. Você precisa descobrir como abri-la."
                );

            }

        }

    },


    {
        id: "room0Door",

        x: 1700,
        y: 700,

        location: "tunnels",

        icon: "0️⃣",

        radius: 50,

        interact() {

            if (isAreaUnlocked("room0")) {

                travelTo("room0");

            } else {

                openDialogue(
                    "Sala 0",
                    "Uma porta sem maçaneta. Algo parece estar faltando."
                );

            }

        }

    },


    {
        id: "terminal",

        x: 800,
        y: 450,

        location: "hospital",

        icon: "💻",

        radius: 50,

        interact() {

            if (!game.flags.terminalSolved) {

                openPuzzle();

            } else {

                openDialogue(
                    "Terminal",
                    "A mensagem continua na tela: ELIAS — PASSAGEIRO 000."
                );

            }

        }

    },


    {
        id: "clock",

        x: 480,
        y: 350,

        location: "central",

        icon: "🕛",

        radius: 50,

        interact() {

            openDialogue(
                "Relógio",
                `O relógio marca ${formatTime(game.time)}. Algo faz você sentir que esse horário é importante.`
            );

        }

    }

];


/* =========================================================
   POSIÇÃO DOS NPCS
   ========================================================= */

function getNPCsForLocation() {

    return Object.values(NPCS)
        .filter(npc => npc.location === game.location);

}


/* =========================================================
   CÂMERA
   ========================================================= */

const camera = {
    x: 0,
    y: 0
};


function updateCamera() {

    camera.x =
        game.player.x -
        canvas.width / 2;

    camera.y =
        game.player.y -
        canvas.height / 2;

    camera.x = Math.max(
        0,
        Math.min(
            camera.x,
            WORLD.width - canvas.width
        )
    );

    camera.y = Math.max(
        0,
        Math.min(
            camera.y,
            WORLD.height - canvas.height
        )
    );

}


/* =========================================================
   MOVIMENTO
   ========================================================= */

function updatePlayer(dt) {

    if (dialogueActive || puzzleActive) {
        return;
    }

    let dx = 0;
    let dy = 0;

    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
        dx--;
    }

    if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
        dx++;
    }

    if (keys["ArrowUp"] || keys["w"] || keys["W"]) {
        dy--;
    }

    if (keys["ArrowDown"] || keys["s"] || keys["S"]) {
        dy++;
    }

    if (dx !== 0 || dy !== 0) {

        const length =
            Math.sqrt(dx * dx + dy * dy);

        dx /= length;
        dy /= length;

        let speed =
            game.player.speed;

        if (keys["Shift"]) {
            speed *= 1.35;
        }

        const newX =
            game.player.x +
            dx * speed * dt;

        const newY =
            game.player.y +
            dy * speed * dt;

        if (!checkCollision(newX, game.player.y)) {

            game.player.x = newX;

        }

        if (!checkCollision(game.player.x, newY)) {

            game.player.y = newY;

        }

        if (Math.abs(dx) > Math.abs(dy)) {

            game.player.direction =
                dx > 0 ? "right" : "left";

        } else {

            game.player.direction =
                dy > 0 ? "down" : "up";

        }

        game.stats.steps++;

        if (
            game.stats.steps % 120 === 0 &&
            game.player.energy > 0
        ) {

            game.player.energy--;

        }

    }

    game.player.x =
        Math.max(
            30,
            Math.min(
                WORLD.width - 30,
                game.player.x
            )
        );

    game.player.y =
        Math.max(
            30,
            Math.min(
                WORLD.height - 30,
                game.player.y
            )
        );

}


/* =========================================================
   COLISÕES
   ========================================================= */

function checkCollision(x, y) {

    const px = x;
    const py = y;

    const obstacles =
        getObstaclesForLocation();

    for (const obstacle of obstacles) {

        if (
            px + 15 > obstacle.x &&
            px - 15 < obstacle.x + obstacle.width &&
            py + 15 > obstacle.y &&
            py - 15 < obstacle.y + obstacle.height
        ) {

            return true;

        }

    }

    return false;

}


function getObstaclesForLocation() {

    const base = [

        {
            x: 0,
            y: 0,
            width: WORLD.width,
            height: 25
        },

        {
            x: 0,
            y: WORLD.height - 25,
            width: WORLD.width,
            height: 25
        },

        {
            x: 0,
            y: 0,
            width: 25,
            height: WORLD.height
        },

        {
            x: WORLD.width - 25,
            y: 0,
            width: 25,
            height: WORLD.height
        }

    ];

    if (game.location === "central") {

        base.push(
            {
                x: 200,
                y: 250,
                width: 900,
                height: 45
            },

            {
                x: 200,
                y: 1100,
                width: 900,
                height: 45
            },

            {
                x: 1300,
                y: 300,
                width: 45,
                height: 700
            }
        );

    }

    if (game.location === "hospital") {

        base.push(
            {
                x: 300,
                y: 300,
                width: 900,
                height: 35
            },

            {
                x: 300,
                y: 900,
                width: 900,
                height: 35
            },

            {
                x: 300,
                y: 300,
                width: 35,
                height: 600
            },

            {
                x: 1200,
                y: 300,
                width: 35,
                height: 600
            }
        );

    }

    if (game.location === "tunnels") {

        base.push(
            {
                x: 250,
                y: 250,
                width: 1700,
                height: 40
            },

            {
                x: 250,
                y: 1100,
                width: 1700,
                height: 40
            },

            {
                x: 600,
                y: 400,
                width: 40,
                height: 500
            },

            {
                x: 1400,
                y: 400,
                width: 40,
                height: 500
            }
        );

    }

    return base;

}


/* =========================================================
   INTERAÇÃO
   ========================================================= */

function interact() {

    if (dialogueActive || puzzleActive) {
        return;
    }

    game.stats.interactions++;

    const px = game.player.x;
    const py = game.player.y;

    let nearest = null;
    let distance = Infinity;

    const candidates = [

        ...OBJECTS.filter(
            object =>
                object.location === game.location
        ),

        ...SPECIAL_OBJECTS.filter(
            object =>
                object.location === game.location
        ),

        ...getNPCsForLocation()

    ];

    for (const object of candidates) {

        const d =
            Math.hypot(
                px - object.x,
                py - object.y
            );

        const radius =
            object.radius || 55;

        if (
            d < radius &&
            d < distance
        ) {

            nearest = object;
            distance = d;

        }

    }

    if (nearest && nearest.interact) {

        nearest.interact();

    } else {

        showNotification(
            "💭",
            "Não há nada para interagir aqui."
        );

    }

}


/* =========================================================
   DETECTAR INTERAÇÃO
   ========================================================= */

function checkInteractionHint() {

    if (dialogueActive || puzzleActive) {

        document
            .getElementById("interactionHint")
            .classList.remove("show");

        return;

    }

    const px = game.player.x;
    const py = game.player.y;

    const candidates = [

        ...OBJECTS.filter(
            o => o.location === game.location
        ),

        ...SPECIAL_OBJECTS.filter(
            o => o.location === game.location
        ),

        ...getNPCsForLocation()

    ];

    let nearby = false;

    for (const object of candidates) {

        const distance =
            Math.hypot(
                px - object.x,
                py - object.y
            );

        if (distance < (object.radius || 55)) {

            nearby = true;
            break;

        }

    }

    document
        .getElementById("interactionHint")
        .classList.toggle(
            "show",
            nearby
        );

}


/* =========================================================
   DESENHO DO MUNDO
   ========================================================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.save();

    ctx.translate(
        -camera.x,
        -camera.y
    );

    drawWorld();

    drawObjects();

    drawNPCs();

    drawPlayer();

    ctx.restore();

}


/* =========================================================
   FUNDO
   ========================================================= */

function drawWorld() {

    const area =
        AREAS[game.location];

    ctx.fillStyle = area.color;

    ctx.fillRect(
        0,
        0,
        WORLD.width,
        WORLD.height
    );

    ctx.fillStyle = area.floor;

    ctx.fillRect(
        40,
        40,
        WORLD.width - 80,
        WORLD.height - 80
    );

    drawGrid();

    drawDecorations();

}


/* =========================================================
   GRID
   ========================================================= */

function drawGrid() {

    ctx.strokeStyle =
        "rgba(255,255,255,.025)";

    ctx.lineWidth = 1;

    const size = 50;

    for (
        let x = 0;
        x < WORLD.width;
        x += size
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);
        ctx.lineTo(x, WORLD.height);

        ctx.stroke();

    }

    for (
        let y = 0;
        y < WORLD.height;
        y += size
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);
        ctx.lineTo(WORLD.width, y);

        ctx.stroke();

    }

}


/* =========================================================
   DECORAÇÕES
   ========================================================= */

function drawDecorations() {

    if (game.location === "central") {

        drawText(
            "ESTAÇÃO CENTRAL",
            500,
            170,
            28,
            "#8992aa"
        );

        drawText(
            "PLATAFORMA 01",
            300,
            1030,
            20,
            "#666f84"
        );

        drawText(
            "ÚLTIMO TREM",
            900,
            1030,
            20,
            "#666f84"
        );

        // trilhos

        ctx.fillStyle = "#090b10";

        ctx.fillRect(
            150,
            1140,
            1000,
            170
        );

        ctx.strokeStyle = "#555b6a";

        ctx.lineWidth = 5;

        ctx.beginPath();

        ctx.moveTo(150, 1190);
        ctx.lineTo(1150, 1190);

        ctx.moveTo(150, 1260);
        ctx.lineTo(1150, 1260);

        ctx.stroke();

    }


    if (game.location === "rain") {

        drawText(
            "DISTRITO DA CHUVA",
            650,
            180,
            25,
            "#708b9d"
        );

        // postes

        for (let i = 0; i < 15; i++) {

            const x = 150 + i * 150;

            ctx.fillStyle = "#16191f";

            ctx.fillRect(
                x,
                350,
                15,
                220
            );

            ctx.fillStyle = "#f0c969";

            ctx.beginPath();

            ctx.arc(
                x + 7,
                350,
                9,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }

    }


    if (game.location === "park") {

        drawText(
            "PARQUE DAS LANTERNAS",
            600,
            170,
            26,
            "#5e9275"
        );

        for (let i = 0; i < 30; i++) {

            const x =
                100 +
                ((i * 173) % 1900);

            const y =
                300 +
                ((i * 291) % 850);

            drawTree(x, y);

        }

    }


    if (game.location === "hospital") {

        drawText(
            "HOSPITAL SÃO LUCAS",
            600,
            220,
            28,
            "#9da7b7"
        );

        drawText(
            "BLOCO C — ARQUIVOS",
            400,
            850,
            15,
            "#666d7b"
        );

    }


    if (game.location === "oldtown") {

        drawText(
            "CIDADE ANTIGA",
            700,
            180,
            30,
            "#9b7474"
        );

        for (let i = 0; i < 10; i++) {

            drawBuilding(
                150 + i * 210,
                350 + (i % 2) * 400
            );

        }

    }


    if (game.location === "tunnels") {

        drawText(
            "TÚNEIS — LINHA DESATIVADA",
            600,
            180,
            23,
            "#606070"
        );

        drawText(
            "NÃO HÁ SAÍDA",
            900,
            1020,
            18,
            "#733b47"
        );

    }


    if (game.location === "room0") {

        drawText(
            "SALA 0",
            1100,
            180,
            50,
            "#666677"
        );

        drawText(
            "VOCÊ JÁ ESTEVE AQUI.",
            850,
            850,
            22,
            "#545462"
        );

    }

}


/* =========================================================
   ÁRVORE
   ========================================================= */

function drawTree(x, y) {

    ctx.fillStyle = "#3d2c22";

    ctx.fillRect(
        x - 7,
        y,
        14,
        70
    );

    ctx.fillStyle = "#173e2c";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 5,
        35,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


/* =========================================================
   PRÉDIOS
   ========================================================= */

function drawBuilding(x, y) {

    ctx.fillStyle = "#2b2424";

    ctx.fillRect(
        x,
        y,
        150,
        230
    );

    ctx.fillStyle = "#121317";

    for (let i = 0; i < 3; i++) {

        ctx.fillRect(
            x + 20 + i * 40,
            y + 30,
            22,
            30
        );

        ctx.fillRect(
            x + 20 + i * 40,
            y + 90,
            22,
            30
        );

    }

}


/* =========================================================
   OBJETOS
   ========================================================= */

function drawObjects() {

    const objects =
        OBJECTS.filter(
            o => o.location === game.location
        );

    const special =
        SPECIAL_OBJECTS.filter(
            o => o.location === game.location
        );

    [...objects, ...special].forEach(object => {

        drawInteractionObject(
            object.x,
            object.y,
            object.icon
        );

    });

}


function drawInteractionObject(x, y, icon) {

    ctx.fillStyle =
        "rgba(0,0,0,.3)";

    ctx.beginPath();

    ctx.ellipse(
        x,
        y + 25,
        25,
        8,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.font = "30px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
        icon,
        x,
        y + 10
    );

}


/* =========================================================
   NPCS
   ========================================================= */

function drawNPCs() {

    const npcs =
        getNPCsForLocation();

    npcs.forEach(npc => {

        ctx.fillStyle =
            npc.color || "#7c5cff";

        ctx.beginPath();

        ctx.arc(
            npc.x,
            npc.y,
            20,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "#efc2a3";

        ctx.beginPath();

        ctx.arc(
            npc.x,
            npc.y - 25,
            14,
            0,
            Math.PI * 2
        );

        ctx.fill();

        drawText(
            npc.name,
            npc.x,
            npc.y - 48,
            13,
            "#ffffff",
            "center"
        );

    });

}


/* =========================================================
   PLAYER
   ========================================================= */

function drawPlayer() {

    const p = game.player;

    // sombra

    ctx.fillStyle =
        "rgba(0,0,0,.35)";

    ctx.beginPath();

    ctx.ellipse(
        p.x,
        p.y + 20,
        17,
        7,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // corpo

    ctx.fillStyle = "#7c5cff";

    ctx.fillRect(
        p.x - 14,
        p.y - 3,
        28,
        30
    );

    // cabeça

    ctx.fillStyle = "#f0c4a5";

    ctx.beginPath();

    ctx.arc(
        p.x,
        p.y - 15,
        13,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // cabelo

    ctx.fillStyle = "#3a2631";

    ctx.beginPath();

    ctx.arc(
        p.x,
        p.y - 20,
        13,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();

    // olhos

    ctx.fillStyle = "#17131b";

    if (p.direction === "right") {

        ctx.fillRect(
            p.x + 5,
            p.y - 17,
            3,
            3
        );

    } else if (p.direction === "left") {

        ctx.fillRect(
            p.x - 8,
            p.y - 17,
            3,
            3
        );

    } else {

        ctx.fillRect(
            p.x - 6,
            p.y - 17,
            3,
            3
        );

        ctx.fillRect(
            p.x + 4,
            p.y - 17,
            3,
            3
        );

    }

}


/* =========================================================
   TEXTO NO CANVAS
   ========================================================= */

function drawText(
    text,
    x,
    y,
    size,
    color = "#fff",
    align = "left"
) {

    ctx.fillStyle = color;

    ctx.font =
        `bold ${size}px Arial`;

    ctx.textAlign = align;

    ctx.fillText(
        text,
        x,
        y
    );

}


/* =========================================================
   VIAGEM
   ========================================================= */

function openTrainMenu() {

    const destinations = [
        "downtown",
        "rain",
        "park",
        "hospital",
        "oldtown",
        "tunnels"
    ];

    const available =
        destinations.filter(
            destination =>
                isAreaUnlocked(destination)
        );

    const choices =
        available.map(destination => {

            return {

                text:
                    `🚇 ${AREAS[destination].name}`,

                action() {

                    travelTo(destination);

                }

            };

        });

    choices.push({

        text: "Cancelar",

        action() {}

    });

    openDialogue(
        "Condutor",
        "Escolha seu destino.",
        choices
    );

}


function travelTo(destination) {

    if (!isAreaUnlocked(destination)) {

        showNotification(
            "🔒",
            "Essa área ainda está bloqueada."
        );

        return;

    }

    game.location = destination;

    game.trainTrips++;

    game.player.energy =
        Math.max(
            0,
            game.player.energy - 5
        );

    game.time += 20;

    if (game.time >= 24 * 60) {
        game.time -= 24 * 60;
    }

    setStartingPosition(destination);

    showNotification(
        "🚇",
        `Você chegou: ${AREAS[destination].name}`
    );

    updateUI();

    saveGame();

}


function setStartingPosition(location) {

    const positions = {

        central: [450, 700],

        downtown: [500, 700],

        rain: [600, 700],

        park: [600, 700],

        hospital: [450, 700],

        oldtown: [500, 700],

        tunnels: [350, 700],

        room0: [1000, 700]

    };

    const position =
        positions[location];

    if (position) {

        game.player.x = position[0];
        game.player.y = position[1];

    }

}


/* =========================================================
   DESCANSAR
   ========================================================= */

function rest() {

    if (game.player.energy >= game.player.maxEnergy) {

        showNotification(
            "⚡",
            "Sua energia já está cheia."
        );

        return;

    }

    game.player.energy =
        Math.min(
            game.player.maxEnergy,
            game.player.energy + 30
        );

    game.time += 30;

    showNotification(
        "🛌",
        "Você descansou e recuperou energia."
    );

    updateUI();

}


/* =========================================================
   PUZZLE
   ========================================================= */

let puzzleCode = "0412";
let puzzleInput = "";


function openPuzzle() {

    puzzleActive = true;

    puzzleInput = "";

    updatePuzzleDisplay();

    document
        .getElementById("puzzleModal")
        .classList.add("active");

}


function closePuzzle() {

    puzzleActive = false;

    document
        .getElementById("puzzleModal")
        .classList.remove("active");

}


function updatePuzzleDisplay() {

    const display =
        document.getElementById("puzzleDisplay");

    let value = puzzleInput;

    while (value.length < 4) {
        value += "-";
    }

    display.textContent = value;

}


function puzzleNumber(number) {

    if (puzzleInput.length >= 4) {
        return;
    }

    puzzleInput += number;

    updatePuzzleDisplay();

}


function clearPuzzle() {

    puzzleInput = "";

    updatePuzzleDisplay();

}


function submitPuzzle() {

    if (puzzleInput === puzzleCode) {

        game.flags.terminalSolved = true;

        closePuzzle();

        addClue(
            "O terminal revela o código de identificação do passageiro 000."
        );

        openDialogue(
            "Terminal",
            "ARQUIVO RECUPERADO: PASSAGEIRO 000 — ELIAS — STATUS: NÃO DESEMBARCOU."
        );

        gainXP(100);

        saveGame();

    } else {

        showNotification(
            "❌",
            "Código incorreto."
        );

        game.player.energy =
            Math.max(
                0,
                game.player.energy - 5
            );

        puzzleInput = "";

        updatePuzzleDisplay();

    }

}


/* =========================================================
   FINAL DO JOGO
   ========================================================= */

function checkEndingConditions() {

    if (game.location !== "room0") {
        return;
    }

    if (!game.flags.room0Started) {

        game.flags.room0Started = true;

        setTimeout(() => {

            openDialogue(
                "Sala 0",
                "Você sente que já esteve aqui. Só não consegue lembrar quando.",
                [
                    {
                        text: "Continuar.",
                        action() {

                            determineEnding();

                        }
                    }
                ]
            );

        }, 500);

    }

}


function determineEnding() {

    let ending;

    if (
        game.clues >= 9 &&
        hasItem("redNote") &&
        hasItem("photograph") &&
        game.flags.terminalSolved
    ) {

        ending = "secret";

    } else if (
        game.clues >= 7 &&
        game.flags.terminalSolved
    ) {

        ending = "truth";

    } else if (
        game.trainTrips >= 8
    ) {

        ending = "loop";

    } else if (
        game.player.lives <= 0
    ) {

        ending = "bad";

    } else {

        ending = "incomplete";

    }

    finishGame(ending);

}


function finishGame(type) {

    gameRunning = false;

    const endings = {

        secret: {

            icon: "🌙",

            title: "FINAL — A VERDADE",

            text:
                "Você descobre que a estação não foi abandonada. Ela existe em um intervalo entre dois momentos. O último trem não leva passageiros para outro lugar. Ele leva pessoas de volta ao instante em que tudo começou."

        },

        truth: {

            icon: "🚇",

            title: "FINAL — O ÚLTIMO TREM",

            text:
                "Você descobre a verdade sobre Elias e sobre a estação. O último trem estava preso em um ciclo. Ao entender o que aconteceu, você finalmente encontra uma saída."

        },

        loop: {

            icon: "🔁",

            title: "FINAL — CICLO",

            text:
                "Você embarcou vezes demais. Quando as portas se fecham, percebe algo assustador: a Estação Central está novamente diante de você."

        },

        bad: {

            icon: "🌑",

            title: "FINAL — PERDIDO",

            text:
                "As luzes da estação se apagam. Quando voltam, você não reconhece mais o lugar onde está."

        },

        incomplete: {

            icon: "🚪",

            title: "FINAL — SEM RESPOSTAS",

            text:
                "Você encontrou uma saída, mas muitas perguntas permanecem. Talvez a estação ainda esteja esperando você voltar."

        }

    };

    const result =
        endings[type];

    if (!game.endings.includes(type)) {

        game.endings.push(type);

    }

    document
        .getElementById("endingIcon")
        .textContent = result.icon;

    document
        .getElementById("endingTitle")
        .textContent = result.title;

    document
        .getElementById("endingText")
        .textContent = result.text;

    document
        .getElementById("endingStats")
        .innerHTML = `
            <strong>Estatísticas</strong><br><br>
            Pistas encontradas: ${game.clues}<br>
            Viagens de trem: ${game.trainTrips}<br>
            Nível: ${game.player.level}<br>
            Itens encontrados: ${game.stats.itemsFound}<br>
            Finais descobertos: ${game.endings.length}
        `;

    document
        .getElementById("endingModal")
        .classList.add("active");

    saveGame();

}


/* =========================================================
   UI
   ========================================================= */

function updateUI() {

    document
        .getElementById("locationName")
        .textContent =
        AREAS[game.location].name;

    document
        .getElementById("lives")
        .textContent =
        game.player.lives;

    document
        .getElementById("energy")
        .textContent =
        Math.floor(game.player.energy);

    document
        .getElementById("coins")
        .textContent =
        game.player.coins;

    document
        .getElementById("clues")
        .textContent =
        game.clues;

    document
        .getElementById("level")
        .textContent =
        game.player.level;

    const xp =
        (game.player.xp / xpRequired()) * 100;

    document
        .getElementById("xpBar")
        .style.width =
        `${Math.min(100, xp)}%`;

    updateMissionUI();

}


/* =========================================================
   MISSÃO ATUAL
   ========================================================= */

function updateMissionUI() {

    let missionId = null;

    if (!game.flags.firstClue) {

        missionId = "investigate";

    } else if (!hasItem("metroTicket")) {

        missionId = "ticket";

    } else if (
        game.clues < 4
    ) {

        missionId = "hospital";

    } else if (
        !hasItem("masterKey")
    ) {

        missionId = "tunnels";

    } else {

        missionId = "room0";

    }

    if (!MISSION_DATA[missionId]) {
        return;
    }

    document
        .getElementById("currentMission")
        .textContent =
        MISSION_DATA[missionId].title;

    document
        .getElementById("missionDescription")
        .textContent =
        MISSION_DATA[missionId].description;

}


/* =========================================================
   INVENTÁRIO UI
   ========================================================= */

function renderInventory() {

    const container =
        document.getElementById("inventoryList");

    container.innerHTML = "";

    if (game.inventory.length === 0) {

        container.innerHTML =
            `<p style="color:#9299aa">
                Seu inventário está vazio.
             </p>`;

        return;

    }

    game.inventory.forEach(id => {

        const item =
            ITEMS[id];

        if (!item) return;

        const element =
            document.createElement("div");

        element.className = "item";

        element.innerHTML = `

            <div class="item-icon">
                ${item.icon}
            </div>

            <div class="item-name">
                ${item.name}
            </div>

            <div class="item-description">
                ${item.description}
            </div>

        `;

        container.appendChild(element);

    });

}


/* =========================================================
   MISSÕES UI
   ========================================================= */

function renderMissions() {

    const container =
        document.getElementById("missionsList");

    container.innerHTML = "";

    game.missions.forEach(id => {

        const mission =
            MISSION_DATA[id];

        if (!mission) return;

        const completed =
            isMissionCompleted(id);

        const element =
            document.createElement("div");

        element.className =
            "mission-item" +
            (completed ? " completed" : "");

        element.innerHTML = `

            <h3>
                ${completed ? "✓ " : ""}${mission.title}
            </h3>

            <p>
                ${mission.description}
            </p>

        `;

        container.appendChild(element);

    });

}


function isMissionCompleted(id) {

    if (id === "investigate") {

        return game.clues >= 1;

    }

    if (id === "ticket") {

        return hasItem("metroTicket");

    }

    if (id === "hospital") {

        return game.clues >= 4;

    }

    if (id === "tunnels") {

        return hasItem("masterKey");

    }

    if (id === "room0") {

        return game.location === "room0";

    }

    return false;

}


/* =========================================================
   TEMPO
   ========================================================= */

function formatTime(minutes) {

    const hours =
        Math.floor(minutes / 60);

    const mins =
        minutes % 60;

    return `${String(hours).padStart(2,"0")}:${String(mins).padStart(2,"0")}`;

}


/* =========================================================
   SAVE
   ========================================================= */

function saveGame() {

    localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(game)
    );

    showNotification(
        "💾",
        "Jogo salvo."
    );

}


function loadGame() {

    const data =
        localStorage.getItem(SAVE_KEY);

    if (!data) {

        showNotification(
            "ℹ️",
            "Nenhum jogo salvo encontrado."
        );

        return false;

    }

    try {

        const saved =
            JSON.parse(data);

        game = saved;

        updateUI();

        return true;

    } catch {

        showNotification(
            "❌",
            "O save está corrompido."
        );

        return false;

    }

}


function deleteSave() {

    localStorage.removeItem(
        SAVE_KEY
    );

    showNotification(
        "🗑️",
        "Save apagado."
    );

}


/* =========================================================
   NOVO JOGO
   ========================================================= */

function newGame() {

    game = {

        player: {

            x: 450,
            y: 700,

            width: 28,
            height: 38,

            speed: 210,

            direction: "down",

            lives: 3,

            energy: 100,

            coins: 20,

            level: 1,

            xp: 0,

            maxEnergy: 100

        },

        location: "central",

        clues: 0,

        trainTrips: 0,

        time: 18 * 60,

        flags: {},

        inventory: [],

        missions: [],

        completedMissions: [],

        visited: ["central"],

        endings: [],

        stats: {

            steps: 0,

            interactions: 0,

            itemsFound: 0,

            npcsTalked: 0

        }

    };

    initializeMissions();

    saveGame();

    startGame();

}


/* =========================================================
   INICIAR
   ========================================================= */

function startGame() {

    document
        .getElementById("menuScreen")
        .classList.remove("active");

    document
        .getElementById("gameScreen")
        .classList.add("active");

    gameRunning = true;

    updateUI();

    if (!game.flags.introduction) {

        game.flags.introduction = true;

        setTimeout(() => {

            openDialogue(
                "Desconhecido",
                "Você acorda em uma estação vazia. Não lembra como chegou aqui.",
                [
                    {
                        text: "Explorar a estação.",
                        action() {

                            addClue(
                                "Você acordou sozinho na Estação Central."
                            );

                        }
                    }
                ]
            );

        }, 500);

    }

}


/* =========================================================
   GAME LOOP
   ========================================================= */

function gameLoop(timestamp) {

    const dt =
        Math.min(
            (timestamp - lastTime) / 1000,
            0.05
        );

    lastTime = timestamp;

    if (gameRunning) {

        updatePlayer(dt);

        updateCamera();

        checkInteractionHint();

        checkEndingConditions();

        draw();

        updateUI();

    }

    requestAnimationFrame(gameLoop);

}


/* =========================================================
   TECLADO
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        keys[event.key] = true;

        if (
            event.key === "e" ||
            event.key === "E"
        ) {

            interact();

        }

        if (event.key === "Escape") {

            closeAllModals();

        }

    }
);


document.addEventListener(
    "keyup",
    event => {

        keys[event.key] = false;

    }
);


/* =========================================================
   CONTROLES MOBILE
   ========================================================= */

document
    .querySelectorAll(
        "#mobileControls [data-key]"
    )
    .forEach(button => {

        const key =
            button.dataset.key;

        button.addEventListener(
            "touchstart",
            event => {

                event.preventDefault();

                keys[key] = true;

            }
        );

        button.addEventListener(
            "touchend",
            event => {

                event.preventDefault();

                keys[key] = false;

            }
        );

    });


document
    .getElementById("mobileInteract")
    .addEventListener(
        "click",
        interact
    );


/* =========================================================
   BOTÕES DO MENU
   ========================================================= */

document
    .getElementById("newGameBtn")
    .addEventListener(
        "click",
        () => {

            if (
                localStorage.getItem(SAVE_KEY) &&
                !confirm(
                    "Começar uma nova jornada apagará o progresso atual. Continuar?"
                )
            ) {
                return;
            }

            newGame();

        }
    );


document
    .getElementById("continueBtn")
    .addEventListener(
        "click",
        () => {

            if (loadGame()) {

                startGame();

            }

        }
    );


document
    .getElementById("deleteSaveBtn")
    .addEventListener(
        "click",
        () => {

            if (
                confirm(
                    "Tem certeza que deseja apagar seu progresso?"
                )
            ) {

                deleteSave();

            }

        }
    );


/* =========================================================
   BOTÕES DO JOGO
   ========================================================= */

document
    .getElementById("inventoryBtn")
    .addEventListener(
        "click",
        () => {

            renderInventory();

            document
                .getElementById("inventoryModal")
                .classList.add("active");

        }
    );


document
    .getElementById("missionsBtn")
    .addEventListener(
        "click",
        () => {

            renderMissions();

            document
                .getElementById("missionsModal")
                .classList.add("active");

        }
    );


document
    .getElementById("saveBtn")
    .addEventListener(
        "click",
        saveGame
    );


document
    .getElementById("menuBtn")
    .addEventListener(
        "click",
        () => {

            gameRunning = false;

            document
                .getElementById("gameScreen")
                .classList.remove("active");

            document
                .getElementById("menuScreen")
                .classList.add("active");

        }
    );


/* =========================================================
   FECHAR MODAIS
   ========================================================= */

function closeAllModals() {

    document
        .querySelectorAll(".modal")
        .forEach(modal => {

            modal.classList.remove("active");

        });

    dialogueActive = false;
    puzzleActive = false;

}


document
    .querySelectorAll(".close-modal")
    .forEach(button => {

        button.addEventListener(
            "click",
            closeAllModals
        );

    });


/* =========================================================
   PUZZLE BUTTONS
   ========================================================= */

document
    .querySelectorAll(
        ".keypad button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const value =
                    button.dataset.number;

                if (value === "clear") {

                    clearPuzzle();

                } else if (value === "enter") {

                    submitPuzzle();

                } else {

                    puzzleNumber(value);

                }

            }
        );

    });


/* =========================================================
   RECOMEÇAR DEPOIS DO FINAL
   ========================================================= */

document
    .getElementById("restartBtn")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("endingModal")
                .classList.remove("active");

            newGame();

        }
    );


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

initializeMissions();

updateUI();

requestAnimationFrame(gameLoop);
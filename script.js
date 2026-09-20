import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/PointerLockControls.js";


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const SAVE_KEY = "ultimo_trem_save_v2";

const GAME_START_HOUR = 23;
const GAME_START_MINUTE = 47;

const PLAYER_HEIGHT = 1.7;
const WALK_SPEED = 3.0;
const RUN_SPEED = 5.0;


/* =========================================================
   ESTADO DO JOGO
========================================================= */

const state = {

    running: false,

    player: {
        x: 0,
        y: PLAYER_HEIGHT,
        z: 5
    },

    lives: 100,
    energy: 100,

    clues: 0,
    coins: 0,

    gameMinutes: GAME_START_HOUR * 60 + GAME_START_MINUTE,

    flashlight: false,

    inventory: [],

    missions: {},

    discovered: {},

    currentArea: "station",

    trainUnlocked: false,

    hospitalSolved: false,
    tunnelsSolved: false,

    dialogueActive: false,

    dialoguePages: [],
    dialogueIndex: 0,

    currentPuzzle: null,

    endingShown: false
};


/* =========================================================
   THREE.JS
========================================================= */

let scene;
let camera;
let renderer;
let controls;

let flashlight;
let flashlightGlow;

let clock;

let playerGroup;

const colliders = [];
const interactables = [];

const areas = {};
const npcs = {};

let rain;


/* =========================================================
   TECLAS
========================================================= */

const keys = {};


window.addEventListener("keydown", e => {

    keys[e.code] = true;

    if (
        [
            "KeyW",
            "KeyA",
            "KeyS",
            "KeyD",
            "ShiftLeft",
            "ShiftRight",
            "Space"
        ].includes(e.code)
    ) {
        e.preventDefault();
    }

    if (e.repeat) return;

    if (!state.running) return;

    if (e.code === "KeyF") {
        toggleFlashlight();
    }

    if (e.code === "KeyE") {
        interact();
    }

    if (e.code === "KeyI") {
        toggleModal("inventoryOverlay");
    }

    if (e.code === "KeyM") {
        toggleModal("missionsOverlay");
    }

    if (e.code === "Escape") {

        closeAllModals();

        if (controls.isLocked) {
            controls.unlock();
        }
    }
});


window.addEventListener("keyup", e => {
    keys[e.code] = false;
});


/* =========================================================
   ELEMENTOS
========================================================= */

const $ = id => document.getElementById(id);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

window.addEventListener("DOMContentLoaded", () => {

    setupMenu();

    simulateLoading();

    setupButtons();

});


function simulateLoading() {

    let progress = 0;

    const interval = setInterval(() => {

        progress += Math.random() * 12 + 4;

        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            setTimeout(() => {

                $("loadingScreen").classList.add("hidden");
                $("startScreen").classList.remove("hidden");

                updateContinueButton();

            }, 500);
        }

        $("loadingProgress").style.width = `${progress}%`;

        if (progress < 35) {
            $("loadingText").textContent = "Construindo a estação...";
        }
        else if (progress < 65) {
            $("loadingText").textContent = "Preparando o último trem...";
        }
        else if (progress < 90) {
            $("loadingText").textContent = "Verificando os relógios...";
        }
        else {
            $("loadingText").textContent = "A estação está esperando.";
        }

    }, 150);
}


/* =========================================================
   MENU
========================================================= */

function setupMenu() {

    $("startButton").addEventListener("click", () => {

        startNewGame();

    });


    $("continueButton").addEventListener("click", () => {

        loadGame();

    });


    $("deleteSaveButton").addEventListener("click", () => {

        if (
            confirm(
                "Tem certeza que deseja apagar todo o progresso?"
            )
        ) {

            localStorage.removeItem(SAVE_KEY);

            updateContinueButton();

            showCenterMessage(
                "Progresso apagado."
            );
        }

    });

}


function updateContinueButton() {

    const save = localStorage.getItem(SAVE_KEY);

    $("continueButton").style.display =
        save ? "block" : "none";
}


/* =========================================================
   BOTÕES
========================================================= */

function setupButtons() {

    $("dialogueNext").addEventListener(
        "click",
        nextDialogue
    );


    $("itemActionButton").addEventListener(
        "click",
        useSelectedItem
    );


    $("puzzleCancel").addEventListener(
        "click",
        closePuzzle
    );


    $("puzzleConfirm").addEventListener(
        "click",
        confirmPuzzle
    );


    $("trainCancel").addEventListener(
        "click",
        () => {
            $("trainOverlay").classList.add("hidden");
        }
    );


    $("restartButton").addEventListener(
        "click",
        () => {

            $("endingOverlay").classList.add("hidden");

            startNewGame();

        }
    );


    $("endingMenuButton").addEventListener(
        "click",
        () => {

            $("endingOverlay").classList.add("hidden");

            state.running = false;

            if (controls) {
                controls.unlock();
            }

            $("hud").classList.add("hidden");
            $("mobileControls").classList.add("hidden");

            $("startScreen").classList.remove("hidden");

            updateContinueButton();

        }
    );


    document.querySelectorAll("[data-close]").forEach(button => {

        button.addEventListener("click", () => {

            $(button.dataset.close)
                .classList.add("hidden");

        });

    });


    document.querySelectorAll(
        "#trainDestinations button"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                travelByTrain(
                    button.dataset.destination
                );

            }
        );

    });


    setupMobile();

}


/* =========================================================
   COMEÇAR
========================================================= */

function startNewGame() {

    resetState();

    $("startScreen").classList.add("hidden");

    initializeGame();

}


function resetState() {

    state.running = true;

    state.player = {
        x: 0,
        y: PLAYER_HEIGHT,
        z: 5
    };

    state.lives = 100;
    state.energy = 100;

    state.clues = 0;
    state.coins = 0;

    state.gameMinutes =
        GAME_START_HOUR * 60 +
        GAME_START_MINUTE;

    state.flashlight = false;

    state.inventory = [];

    state.discovered = {};

    state.currentArea = "station";

    state.trainUnlocked = false;

    state.hospitalSolved = false;
    state.tunnelsSolved = false;

    state.dialogueActive = false;

    state.dialoguePages = [];
    state.dialogueIndex = 0;

    state.endingShown = false;

    state.missions = {

        station: {
            title: "A estação vazia",
            description:
                "Descubra onde você está e encontre uma forma de sair.",
            completed: false
        },

        olivia: {
            title: "A mulher na plataforma",
            description:
                "Converse com Olivia e descubra por que ela continua esperando.",
            completed: false
        },

        ticket: {
            title: "O bilhete impossível",
            description:
                "Examine o bilhete e descubra o que há de errado com a data.",
            completed: false
        },

        train: {
            title: "O Último Trem",
            description:
                "Descubra por que um trem ainda chega à estação.",
            completed: false
        },

        patient: {
            title: "Paciente 404",
            description:
                "Investigue o prontuário encontrado no Hospital São Lucas.",
            completed: false
        },

        tunnels: {
            title: "Debaixo da cidade",
            description:
                "Encontre a entrada dos túneis antigos.",
            completed: false
        },

        room0: {
            title: "Sala 0",
            description:
                "Descubra o que existe no centro do mistério.",
            completed: false
        }

    };

}


/* =========================================================
   CARREGAR JOGO
========================================================= */

function loadGame() {

    const raw = localStorage.getItem(SAVE_KEY);

    if (!raw) {
        startNewGame();
        return;
    }

    try {

        const saved = JSON.parse(raw);

        Object.assign(
            state,
            saved
        );

        state.running = true;

        $("startScreen").classList.add("hidden");

        initializeGame();

        showCenterMessage(
            "Progresso restaurado."
        );

    }
    catch (error) {

        console.error(error);

        startNewGame();

    }

}


/* =========================================================
   SALVAR
========================================================= */

function saveGame() {

    const save = {

        player: {
            x: state.player.x,
            y: state.player.y,
            z: state.player.z
        },

        lives: state.lives,
        energy: state.energy,

        clues: state.clues,
        coins: state.coins,

        gameMinutes: state.gameMinutes,

        flashlight: state.flashlight,

        inventory: state.inventory,

        missions: state.missions,

        discovered: state.discovered,

        currentArea: state.currentArea,

        trainUnlocked: state.trainUnlocked,

        hospitalSolved: state.hospitalSolved,
        tunnelsSolved: state.tunnelsSolved

    };

    localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(save)
    );

}


/* =========================================================
   INICIALIZAR 3D
========================================================= */

function initializeGame() {

    $("gameContainer").classList.remove("hidden");
    $("hud").classList.remove("hidden");
    $("mobileControls").classList.remove("hidden");

    if (renderer) {

        renderer.domElement.remove();

    }


    scene = new THREE.Scene();

    scene.background =
        new THREE.Color(0x171820);

    scene.fog =
        new THREE.FogExp2(
            0x171820,
            0.018
        );


    camera =
        new THREE.PerspectiveCamera(
            70,
            window.innerWidth /
            window.innerHeight,
            0.05,
            500
        );

    camera.position.set(
        state.player.x,
        state.player.y,
        state.player.z
    );


    renderer =
        new THREE.WebGLRenderer({
            antialias: true
        });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;

    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.15;


    $("gameContainer").appendChild(
        renderer.domElement
    );


    controls =
        new PointerLockControls(
            camera,
            document.body
        );


    renderer.domElement.addEventListener(
        "click",
        () => {

            if (
                state.running &&
                !$("dialogueOverlay").classList.contains("hidden") === false
            ) {

                if (
                    !$("inventoryOverlay").classList.contains("hidden") ||
                    !$("missionsOverlay").classList.contains("hidden") ||
                    !$("puzzleOverlay").classList.contains("hidden") ||
                    !$("trainOverlay").classList.contains("hidden") ||
                    !$("endingOverlay").classList.contains("hidden")
                ) {
                    return;
                }

                controls.lock();

            }

        }
    );


    setupLighting();

    createPlayer();

    createWorld();

    createFlashlight();

    setupRain();

    updateHUD();

    state.running = true;

    clock = new THREE.Clock();

    animate();

    setTimeout(() => {

        showDialogue(
            "Olivia",
            "Uma mulher esperando",
            [
                "Você finalmente acordou.",
                "Não tente se lembrar de tudo de uma vez. A estação não gosta quando as pessoas fazem isso.",
                "Se quiser sair daqui, primeiro descubra por que o relógio continua marcando a mesma noite.",
                "E, por favor... quando o trem chegar, não entre sem olhar o bilhete."
            ],
            "O"
        );

    }, 1800);

}


/* =========================================================
   ILUMINAÇÃO
========================================================= */

function setupLighting() {

    // Luz ambiente muito maior do que na versão anterior.

    const ambient =
        new THREE.HemisphereLight(
            0xaaa5c4,
            0x34313a,
            1.8
        );

    scene.add(ambient);


    const moon =
        new THREE.DirectionalLight(
            0xaaa8ff,
            1.4
        );

    moon.position.set(
        -30,
        40,
        20
    );

    moon.castShadow = true;

    moon.shadow.mapSize.width = 2048;
    moon.shadow.mapSize.height = 2048;

    scene.add(moon);


    const stationLight =
        new THREE.PointLight(
            0xd8c8ff,
            5,
            35
        );

    stationLight.position.set(
        0,
        4,
        0
    );

    scene.add(stationLight);


    // iluminação complementar
    const warmLight =
        new THREE.PointLight(
            0xffd7a0,
            3,
            25
        );

    warmLight.position.set(
        12,
        4,
        -8
    );

    scene.add(warmLight);

}


/* =========================================================
   PLAYER
========================================================= */

function createPlayer() {

    playerGroup =
        new THREE.Group();

    scene.add(playerGroup);

}


/* =========================================================
   LANTERNA
========================================================= */

function createFlashlight() {

    flashlight =
        new THREE.SpotLight(
            0xfff4d6,
            0,
            40,
            Math.PI / 5,
            0.38,
            1.1
        );

    flashlight.castShadow = true;

    flashlight.shadow.mapSize.width = 2048;
    flashlight.shadow.mapSize.height = 2048;

    flashlight.shadow.camera.near = 0.1;
    flashlight.shadow.camera.far = 45;

    flashlight.position.set(
        0,
        -0.08,
        -0.15
    );

    camera.add(
        flashlight
    );


    flashlightGlow =
        new THREE.PointLight(
            0xffeec5,
            0,
            7
        );

    flashlightGlow.position.set(
        0,
        -0.1,
        -0.3
    );

    camera.add(
        flashlightGlow
    );

}


/* =========================================================
   LIGAR/DESLIGAR LANTERNA
========================================================= */

function toggleFlashlight() {

    state.flashlight =
        !state.flashlight;

    flashlight.intensity =
        state.flashlight ? 7.5 : 0;

    flashlightGlow.intensity =
        state.flashlight ? 2.2 : 0;

    $("flashlightText").textContent =
        state.flashlight
            ? "LIGADA"
            : "DESLIGADA";

    $("flashlightStatus").classList.toggle(
        "active",
        state.flashlight
    );

    showCenterMessage(
        state.flashlight
            ? "🔦 Lanterna ligada — pressione F para desligar."
            : "🔦 Lanterna desligada."
    );

}


/* =========================================================
   MATERIAIS
========================================================= */

function material(
    color,
    roughness = .8,
    metalness = 0
) {

    return new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness
    });

}


/* =========================================================
   CUBO
========================================================= */

function cube(
    width,
    height,
    depth,
    color,
    x,
    y,
    z,
    cast = true
) {

    const mesh =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),
            material(color)
        );

    mesh.position.set(
        x,
        y,
        z
    );

    mesh.castShadow = cast;
    mesh.receiveShadow = true;

    scene.add(mesh);

    return mesh;

}


/* =========================================================
   CILINDRO
========================================================= */

function cylinder(
    radius,
    height,
    color,
    x,
    y,
    z
) {

    const mesh =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                radius,
                radius,
                height,
                20
            ),
            material(color)
        );

    mesh.position.set(
        x,
        y,
        z
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);

    return mesh;

}


/* =========================================================
   MUNDO
========================================================= */

function createWorld() {

    createGround();

    createStation();

    createRainDistrict();

    createLanternPark();

    createHospital();

    createOldTown();

    createTunnels();

    createRoom0();

    createTrain();

    createNPCs();

    createObjects();

}


/* =========================================================
   CHÃO
========================================================= */

function createGround() {

    const ground =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                250,
                250
            ),
            material(0x30313a, .95)
        );

    ground.rotation.x =
        -Math.PI / 2;

    ground.receiveShadow = true;

    scene.add(ground);

}


/* =========================================================
   ESTAÇÃO
========================================================= */

function createStation() {

    // plataforma
    cube(
        42,
        .3,
        24,
        0x55545c,
        0,
        .15,
        0
    );


    // teto
    cube(
        42,
        .5,
        24,
        0x292831,
        0,
        7,
        0
    );


    // paredes laterais
    cube(
        .6,
        7,
        24,
        0x414049,
        -21,
        3.5,
        0
    );

    cube(
        .6,
        7,
        24,
        0x414049,
        21,
        3.5,
        0
    );


    // pilares
    for (let x = -18; x <= 18; x += 6) {

        cube(
            .7,
            6.5,
            .7,
            0x55515d,
            x,
            3.25,
            -10
        );

        cube(
            .7,
            6.5,
            .7,
            0x55515d,
            x,
            3.25,
            10
        );

    }


    // trilhos
    cube(
        42,
        .12,
        .12,
        0x888892,
        0,
        .3,
        -5
    );

    cube(
        42,
        .12,
        .12,
        0x888892,
        0,
        .3,
        -7
    );


    // relógio grande
    const clockBody =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                1.5,
                1.5,
                .25,
                32
            ),
            material(0x181820)
        );

    clockBody.rotation.z =
        Math.PI / 2;

    clockBody.position.set(
        0,
        5.2,
        -11.5
    );

    scene.add(clockBody);


    // iluminação da plataforma
    for (let x = -18; x <= 18; x += 6) {

        const light =
            new THREE.PointLight(
                0xd9c8ff,
                4,
                13
            );

        light.position.set(
            x,
            5.8,
            0
        );

        scene.add(light);

    }


    // bancos
    for (let x = -14; x <= 14; x += 7) {

        createBench(
            x,
            .5,
            6
        );

    }

}


/* =========================================================
   BANCO
========================================================= */

function createBench(
    x,
    y,
    z
) {

    cube(
        3.5,
        .15,
        .5,
        0x614936,
        x,
        y,
        z
    );

    cube(
        3.5,
        .15,
        .5,
        0x614936,
        x,
        y + .8,
        z
    );

    cube(
        .15,
        .8,
        .15,
        0x3d3b40,
        x - 1.4,
        y - .35,
        z
    );

    cube(
        .15,
        .8,
        .15,
        0x3d3b40,
        x + 1.4,
        y - .35,
        z
    );

}


/* =========================================================
   DISTRITO DA CHUVA
========================================================= */

function createRainDistrict() {

    areas.rain =
        new THREE.Group();

    areas.rain.position.set(
        60,
        0,
        0
    );

    scene.add(
        areas.rain
    );


    cube(
        45,
        .2,
        35,
        0x34343a,
        60,
        .1,
        0
    );


    // prédios
    for (
        let i = 0;
        i < 12;
        i++
    ) {

        const x =
            42 +
            (i % 4) * 12;

        const z =
            -12 +
            Math.floor(i / 4) * 12;

        cube(
            8,
            8 + Math.random() * 8,
            8,
            0x35343d,
            x,
            5,
            z
        );

    }


    // postes
    for (
        let x = 45;
        x <= 75;
        x += 10
    ) {

        cylinder(
            .12,
            5,
            0x202025,
            x,
            2.5,
            12
        );

        const lamp =
            new THREE.PointLight(
                0xc5a8ff,
                2.5,
                12
            );

        lamp.position.set(
            x,
            5,
            12
        );

        scene.add(lamp);

    }

}


/* =========================================================
   PARQUE DAS LANTERNAS
========================================================= */

function createLanternPark() {

    cube(
        45,
        .2,
        35,
        0x28372e,
        -60,
        .1,
        0
    );


    for (
        let i = 0;
        i < 16;
        i++
    ) {

        const x =
            -76 +
            Math.random() * 32;

        const z =
            -12 +
            Math.random() * 24;

        createTree(
            x,
            z
        );

    }


    for (
        let x = -76;
        x <= -44;
        x += 8
    ) {

        const lamp =
            new THREE.PointLight(
                0xffb86b,
                3,
                12
            );

        lamp.position.set(
            x,
            3.5,
            0
        );

        scene.add(lamp);

        cylinder(
            .08,
            3,
            0x222222,
            x,
            1.5,
            0
        );

        const lantern =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    .3,
                    12,
                    12
                ),
                new THREE.MeshBasicMaterial({
                    color: 0xffc56d
                })
            );

        lantern.position.set(
            x,
            3.2,
            0
        );

        scene.add(lantern);

    }

}


function createTree(x, z) {

    cylinder(
        .35,
        3,
        0x4a3324,
        x,
        1.5,
        z
    );

    const leaves =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                2.2,
                12,
                12
            ),
            material(0x203e2a)
        );

    leaves.position.set(
        x,
        4,
        z
    );

    leaves.castShadow = true;

    scene.add(leaves);

}


/* =========================================================
   HOSPITAL
========================================================= */

function createHospital() {

    cube(
        38,
        14,
        28,
        0x77777b,
        0,
        7,
        -55
    );


    // janelas
    for (
        let x = -14;
        x <= 14;
        x += 7
    ) {

        for (
            let y = 4;
            y <= 10;
            y += 3
        ) {

            cube(
                3.5,
                1.7,
                .12,
                0x303743,
                x,
                y,
                -69.1
            );

        }

    }


    // entrada
    cube(
        7,
        5,
        .3,
        0x22242a,
        0,
        2.5,
        -69.3
    );


    const hospitalLight =
        new THREE.PointLight(
            0xa8caff,
            6,
            22
        );

    hospitalLight.position.set(
        0,
        5,
        -67
    );

    scene.add(hospitalLight);

}


/* =========================================================
   CIDADE ANTIGA
========================================================= */

function createOldTown() {

    cube(
        50,
        .2,
        40,
        0x51463c,
        65,
        .1,
        -55
    );


    for (
        let i = 0;
        i < 14;
        i++
    ) {

        const x =
            43 +
            (i % 5) * 10;

        const z =
            -70 +
            Math.floor(i / 5) * 12;

        const h =
            5 +
            Math.random() * 7;

        cube(
            7,
            h,
            8,
            0x62544a,
            x,
            h / 2,
            z
        );

    }

}


/* =========================================================
   TÚNEIS
========================================================= */

function createTunnels() {

    const tunnel =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                8,
                8,
                40,
                32,
                1,
                true
            ),
            material(0x24232a)
        );

    tunnel.rotation.z =
        Math.PI / 2;

    tunnel.position.set(
        0,
        8,
        45
    );

    scene.add(tunnel);


    // trilhos dentro do túnel
    cube(
        40,
        .1,
        .12,
        0x777780,
        0,
        .3,
        43
    );

    cube(
        40,
        .1,
        .12,
        0x777780,
        0,
        .3,
        45
    );


    for (
        let z = 30;
        z <= 60;
        z += 5
    ) {

        cube(
            12,
            .2,
            .5,
            0x463c34,
            0,
            .4,
            z
        );

    }

}


/* =========================================================
   SALA 0
========================================================= */

function createRoom0() {

    cube(
        25,
        10,
        25,
        0x191820,
        0,
        5,
        85
    );


    const roomLight =
        new THREE.PointLight(
            0xffffff,
            1,
            30
        );

    roomLight.position.set(
        0,
        8,
        85
    );

    scene.add(roomLight);


    const redLight =
        new THREE.PointLight(
            0xff3333,
            5,
            20
        );

    redLight.position.set(
        0,
        5,
        73
    );

    scene.add(redLight);

}


/* =========================================================
   TREM
========================================================= */

let train;

function createTrain() {

    train =
        new THREE.Group();

    train.position.set(
        -30,
        1.7,
        -6
    );

    scene.add(train);


    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                8,
                3,
                4
            ),
            material(
                0x3d3947,
                .4,
                .3
            )
        );

    body.castShadow = true;

    train.add(body);


    // janelas
    for (
        let x = -2.7;
        x <= 2.7;
        x += 1.8
    ) {

        const window =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.2,
                    1.1,
                    .1
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x7b85a5,
                    emissive: 0x353d66,
                    emissiveIntensity: 1
                })
            );

        window.position.set(
            x,
            .4,
            -2.05
        );

        train.add(window);

    }


    const light =
        new THREE.PointLight(
            0xf0dca2,
            7,
            20
        );

    light.position.set(
        0,
        .3,
        -2.5
    );

    train.add(light);

}


/* =========================================================
   PERSONAGENS HUMANOS
========================================================= */

function createHumanCharacter({
    name,
    x,
    y = 0,
    z,
    skin = 0xc58e72,
    hair = 0x2a2025,
    shirt = 0x444454,
    pants = 0x25252d,
    shoes = 0x111115
}) {

    const group =
        new THREE.Group();

    group.position.set(
        x,
        y,
        z
    );

    scene.add(group);


    // pernas
    const leftLeg =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .28,
                1.1,
                .32
            ),
            material(pants)
        );

    leftLeg.position.set(
        -.18,
        .55,
        0
    );

    group.add(leftLeg);


    const rightLeg =
        leftLeg.clone();

    rightLeg.position.x =
        .18;

    group.add(rightLeg);


    // sapatos
    const leftShoe =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .34,
                .18,
                .55
            ),
            material(shoes)
        );

    leftShoe.position.set(
        -.18,
        .08,
        -.07
    );

    group.add(leftShoe);


    const rightShoe =
        leftShoe.clone();

    rightShoe.position.x =
        .18;

    group.add(rightShoe);


    // tronco
    const torso =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .82,
                1.05,
                .46
            ),
            material(shirt)
        );

    torso.position.y =
        1.55;

    group.add(torso);


    // pescoço
    cylinder(
        .13,
        .18,
        skin,
        0,
        2.1,
        0
    );


    // cabeça
    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                .4,
                20,
                20
            ),
            material(skin, .75)
        );

    head.scale.set(
        .9,
        1.05,
        .95
    );

    head.position.set(
        0,
        2.55,
        0
    );

    head.castShadow = true;

    group.add(head);


    // cabelo
    const hairMesh =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                .42,
                20,
                20
            ),
            material(hair)
        );

    hairMesh.scale.set(
        1,
        .65,
        1
    );

    hairMesh.position.set(
        0,
        2.82,
        0
    );

    group.add(hairMesh);


    // braços
    const armGeometry =
        new THREE.CapsuleGeometry(
            .11,
            .65,
            6,
            10
        );

    const leftArm =
        new THREE.Mesh(
            armGeometry,
            material(shirt)
        );

    leftArm.position.set(
        -.53,
        1.55,
        0
    );

    leftArm.rotation.z =
        -.08;

    group.add(leftArm);


    const rightArm =
        leftArm.clone();

    rightArm.position.x =
        .53;

    rightArm.rotation.z =
        .08;

    group.add(rightArm);


    // mãos
    const handGeometry =
        new THREE.SphereGeometry(
            .12,
            12,
            12
        );

    const leftHand =
        new THREE.Mesh(
            handGeometry,
            material(skin)
        );

    leftHand.position.set(
        -.55,
        1.1,
        0
    );

    group.add(leftHand);


    const rightHand =
        leftHand.clone();

    rightHand.position.x =
        .55;

    group.add(rightHand);


    // rosto simples
    const eyeMaterial =
        new THREE.MeshBasicMaterial({
            color: 0x111111
        });


    const leftEye =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                .035,
                8,
                8
            ),
            eyeMaterial
        );

    leftEye.position.set(
        -.13,
        2.6,
        -.37
    );

    group.add(leftEye);


    const rightEye =
        leftEye.clone();

    rightEye.position.x =
        .13;

    group.add(rightEye);


    // marcador
    const marker =
        new THREE.Mesh(
            new THREE.RingGeometry(
                .08,
                .12,
                16
            ),
            new THREE.MeshBasicMaterial({
                color: 0xb984ff,
                side: THREE.DoubleSide
            })
        );

    marker.rotation.x =
        -Math.PI / 2;

    marker.position.y =
        .02;

    group.add(marker);


    group.userData = {
        type: "npc",
        name
    };


    interactables.push({
        object: group,
        type: "npc",
        name
    });


    npcs[name] = group;

    return group;

}


/* =========================================================
   NPCS
========================================================= */

function createNPCs() {

    createHumanCharacter({
        name: "Olivia",
        x: 7,
        z: 3,
        skin: 0xe0aa91,
        hair: 0x241b25,
        shirt: 0x563f61,
        pants: 0x292432
    });


    createHumanCharacter({
        name: "Condutor",
        x: -12,
        z: -1,
        skin: 0xb77d63,
        hair: 0x17151a,
        shirt: 0x1d2532,
        pants: 0x15171d
    });


    createHumanCharacter({
        name: "Kaio",
        x: 0,
        z: -50,
        skin: 0xd59b7c,
        hair: 0x31272a,
        shirt: 0x62718c,
        pants: 0x303644
    });


    createHumanCharacter({
        name: "Senhora",
        x: 63,
        z: -55,
        skin: 0xc9957f,
        hair: 0xaaa9ad,
        shirt: 0x625d68,
        pants: 0x35313b
    });

}


/* =========================================================
   OBJETOS
========================================================= */

function createObjects() {

    // bilhete
    const ticket =
        createInteractableObject(
            "ticket",
            "Bilhete impossível",
            2,
            .9,
            0,
            0xf0dfae
        );

    ticket.rotation.z =
        -.15;


    // cartão hospital
    createInteractableObject(
        "hospitalCard",
        "Cartão do Hospital",
        3,
        1,
        -52,
        0x7890ad
    );


    // fotografia
    createInteractableObject(
        "photo",
        "Fotografia antiga",
        -4,
        .9,
        4,
        0xb5a68e
    );


    // chave
    createInteractableObject(
        "key",
        "Chave antiga",
        -8,
        .9,
        3,
        0xc0a36d
    );


    // moeda
    createInteractableObject(
        "coin",
        "Moeda estranha",
        5,
        .9,
        5,
        0xd4b56b
    );


    // terminal hospital
    const hospitalTerminal =
        cube(
            1.2,
            1.8,
            .5,
            0x272832,
            0,
            1,
            -51
        );

    interactables.push({
        object: hospitalTerminal,
        type: "puzzle",
        puzzle: "hospital",
        name: "Terminal do hospital"
    });


    // terminal túneis
    const tunnelTerminal =
        cube(
            1.2,
            1.8,
            .5,
            0x272832,
            0,
            1,
            57
        );

    interactables.push({
        object: tunnelTerminal,
        type: "puzzle",
        puzzle: "tunnels",
        name: "Terminal antigo"
    });


    // trem
    interactables.push({
        object: train,
        type: "train",
        name: "Último Trem"
    });

}


/* =========================================================
   OBJETO INTERATIVO
========================================================= */

function createInteractableObject(
    type,
    name,
    x,
    y,
    z,
    color
) {

    let geometry;

    if (type === "ticket") {

        geometry =
            new THREE.BoxGeometry(
                1.2,
                .04,
                .7
            );

    }
    else if (type === "photo") {

        geometry =
            new THREE.BoxGeometry(
                .9,
                .05,
                .7
            );

    }
    else if (type === "key") {

        geometry =
            new THREE.TorusGeometry(
                .2,
                .05,
                8,
                20
            );

    }
    else {

        geometry =
            new THREE.CylinderGeometry(
                .3,
                .3,
                .08,
                20
            );

    }


    const mesh =
        new THREE.Mesh(
            geometry,
            material(color, .6)
        );

    mesh.position.set(
        x,
        y,
        z
    );

    mesh.castShadow = true;

    scene.add(mesh);


    interactables.push({
        object: mesh,
        type,
        name
    });


    return mesh;

}


/* =========================================================
   CHUVA
========================================================= */

function setupRain() {

    const count = 1000;

    const positions =
        new Float32Array(
            count * 3
        );

    for (
        let i = 0;
        i < count;
        i++
    ) {

        positions[i * 3] =
            -80 + Math.random() * 160;

        positions[i * 3 + 1] =
            Math.random() * 30;

        positions[i * 3 + 2] =
            -80 + Math.random() * 160;

    }


    const geometry =
        new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            positions,
            3
        )
    );


    const materialRain =
        new THREE.PointsMaterial({
            color: 0x9da6c0,
            size: .08,
            transparent: true,
            opacity: .55
        });


    rain =
        new THREE.Points(
            geometry,
            materialRain
        );

    scene.add(rain);

}


/* =========================================================
   MOVIMENTO
========================================================= */

function updateMovement(delta) {

    if (!controls.isLocked) return;

    const speed =
        (
            keys.ShiftLeft ||
            keys.ShiftRight
        )
            ? RUN_SPEED
            : WALK_SPEED;


    let forward = 0;
    let side = 0;


    if (keys.KeyW) forward += 1;
    if (keys.KeyS) forward -= 1;

    if (keys.KeyA) side -= 1;
    if (keys.KeyD) side += 1;


    if (
        forward === 0 &&
        side === 0
    ) {
        return;
    }


    const direction =
        new THREE.Vector3();

    camera.getWorldDirection(
        direction
    );

    direction.y = 0;

    direction.normalize();


    const right =
        new THREE.Vector3(
            direction.z,
            0,
            -direction.x
        );


    const movement =
        new THREE.Vector3();


    movement.addScaledVector(
        direction,
        forward
    );

    movement.addScaledVector(
        right,
        side
    );


    movement.normalize();

    movement.multiplyScalar(
        speed * delta
    );


    camera.position.add(
        movement
    );


    camera.position.y =
        PLAYER_HEIGHT;


    state.player.x =
        camera.position.x;

    state.player.y =
        camera.position.y;

    state.player.z =
        camera.position.z;


    updateArea();

}


/* =========================================================
   ÁREA ATUAL
========================================================= */

function updateArea() {

    const x =
        camera.position.x;

    const z =
        camera.position.z;


    let area = "station";


    if (
        x > 40 &&
        z > -20 &&
        z < 20
    ) {

        area = "rain";

    }
    else if (
        x < -40 &&
        z > -20 &&
        z < 20
    ) {

        area = "park";

    }
    else if (
        z < -35 &&
        z > -75 &&
        Math.abs(x) < 25
    ) {

        area = "hospital";

    }
    else if (
        x > 40 &&
        z < -30
    ) {

        area = "oldTown";

    }
    else if (
        z > 25 &&
        z < 70
    ) {

        area = "tunnels";

    }
    else if (
        z > 70
    ) {

        area = "room0";

    }


    if (
        state.currentArea !== area
    ) {

        state.currentArea = area;

        updateMissionForArea();

    }

}


/* =========================================================
   MISSÃO POR ÁREA
========================================================= */

function updateMissionForArea() {

    const missionMap = {

        station: "station",
        rain: "ticket",
        park: "olivia",
        hospital: "patient",
        oldTown: "tunnels",
        tunnels: "tunnels",
        room0: "room0"

    };


    const id =
        missionMap[state.currentArea];


    if (
        id &&
        state.missions[id]
    ) {

        $("missionTitle").textContent =
            state.missions[id].title;

        $("missionDescription").textContent =
            state.missions[id].description;

    }

}


/* =========================================================
   INTERAÇÃO
========================================================= */

function getClosestInteractable() {

    const origin =
        camera.getWorldPosition(
            new THREE.Vector3()
        );


    const direction =
        camera.getWorldDirection(
            new THREE.Vector3()
        );


    let closest = null;
    let closestDistance = Infinity;


    for (
        const item of interactables
    ) {

        if (!item.object.visible)
            continue;


        const position =
            item.object.getWorldPosition(
                new THREE.Vector3()
            );


        const toObject =
            position.clone()
                .sub(origin);


        const distance =
            toObject.length();


        if (distance > 5)
            continue;


        const angle =
            direction.angleTo(
                toObject.normalize()
            );


        if (
            angle < .55 &&
            distance < closestDistance
        ) {

            closest = item;
            closestDistance = distance;

        }

    }


    return closest;

}


function updateInteractionHint() {

    if (
        !state.running ||
        !controls.isLocked
    ) {

        $("interactionHint")
            .classList.add("hidden");

        return;

    }


    const item =
        getClosestInteractable();


    if (!item) {

        $("interactionHint")
            .classList.add("hidden");

        return;

    }


    $("interactionHint")
        .classList.remove("hidden");


    $("interactionTitle")
        .textContent =
        item.name;


    let description =
        "Pressione E para interagir";


    if (item.type === "npc") {
        description =
            "Conversar";
    }

    if (item.type === "ticket") {
        description =
            "Pegar e examinar";
    }

    if (item.type === "puzzle") {
        description =
            "Usar terminal";
    }

    if (item.type === "train") {
        description =
            "Entrar no trem";
    }


    $("interactionDescription")
        .textContent =
        description;

}


function interact() {

    if (!state.running) return;

    const item =
        getClosestInteractable();


    if (!item) {

        showCenterMessage(
            "Não há nada para interagir aqui."
        );

        return;

    }


    if (item.type === "npc") {

        interactNPC(
            item.name
        );

        return;

    }


    if (
        item.type === "ticket" ||
        item.type === "hospitalCard" ||
        item.type === "photo" ||
        item.type === "key" ||
        item.type === "coin"
    ) {

        pickupItem(
            item
        );

        return;

    }


    if (item.type === "puzzle") {

        openPuzzle(
            item.puzzle
        );

        return;

    }


    if (item.type === "train") {

        openTrainMenu();

        return;

    }

}


/* =========================================================
   PEGAR ITEM
========================================================= */

function pickupItem(item) {

    if (
        state.inventory.some(
            i => i.id === item.type
        )
    ) {

        showCenterMessage(
            "Você já possui esse item."
        );

        return;

    }


    const itemData =
        getItemData(
            item.type
        );


    state.inventory.push(
        itemData
    );


    item.object.visible = false;


    state.clues++;

    state.discovered[
        item.type
    ] = true;


    if (
        item.type === "ticket"
    ) {

        state.missions.ticket.completed =
            true;

        showCenterMessage(
            "🎟️ Bilhete impossível adquirido."
        );

    }
    else {

        showCenterMessage(
            `${itemData.icon} ${itemData.name} adquirido.`
        );

    }


    saveGame();

    updateHUD();

}


/* =========================================================
   DADOS DOS ITENS
========================================================= */

function getItemData(id) {

    const data = {

        ticket: {
            id: "ticket",
            name: "Bilhete impossível",
            icon: "🎟️",
            description:
                "Um bilhete antigo do metrô. A data impressa nele é impossível: 17/04/1987. No verso existe uma frase quase apagada: 'O trem parte quando o relógio esquece a hora.'",
            action: "Examinar"
        },

        hospitalCard: {
            id: "hospitalCard",
            name: "Cartão do Hospital",
            icon: "🏥",
            description:
                "Cartão de identificação do Hospital São Lucas. O número do paciente é 404.",
            action: "Examinar"
        },

        photo: {
            id: "photo",
            name: "Fotografia antiga",
            icon: "📷",
            description:
                "Uma fotografia da antiga estação. Há várias pessoas na plataforma. Uma delas se parece muito com você.",
            action: "Examinar"
        },

        key: {
            id: "key",
            name: "Chave antiga",
            icon: "🔑",
            description:
                "Uma chave pesada e enferrujada. Uma pequena etiqueta diz: '0'.",
            action: "Usar"
        },

        coin: {
            id: "coin",
            name: "Moeda estranha",
            icon: "🪙",
            description:
                "Uma moeda que parece ter sido fabricada há décadas. O ano gravado nela não existe.",
            action: "Examinar"
        }

    };


    return data[id];

}


/* =========================================================
   NPCS
========================================================= */

function interactNPC(name) {

    if (name === "Olivia") {

        state.missions.olivia.completed =
            true;

        showDialogue(
            "Olivia",
            "A mulher na plataforma",
            [
                "Eu sabia que você viria.",
                "Não me olhe assim. Eu também não sei quanto tempo estou aqui.",
                "A primeira vez que o trem chegou, eu entrei. Quando saí, a estação estava exatamente igual.",
                "Depois percebi uma coisa: o relógio nunca passa da meia-noite.",
                "Existe uma sala escondida em algum lugar abaixo da estação. Eles chamavam de Sala 0.",
                "Se você encontrar o Condutor, pergunte sobre o acidente.",
                "E não confie em ninguém que diga lembrar perfeitamente daquela noite."
            ],
            "O"
        );

        return;

    }


    if (name === "Condutor") {

        state.missions.train.completed =
            true;

        showDialogue(
            "Condutor",
            "Funcionário do último trem",
            [
                "Passageiro.",
                "Seu bilhete.",
                "Não?",
                "Então você ainda não deveria estar aqui.",
                "Este trem não aparece nos mapas porque ele não pertence mais a nenhuma linha.",
                "A última viagem aconteceu há muitos anos.",
                "Mas, de alguma maneira, continuamos chegando à estação.",
                "Quando encontrar a Sala 0, você vai entender."
            ],
            "C"
        );

        return;

    }


    if (name === "Kaio") {

        showDialogue(
            "Kaio",
            "Paciente 404",
            [
                "Você também consegue ouvir o trem daqui?",
                "Os médicos dizem que não existe nenhuma linha funcionando.",
                "Mas toda noite, exatamente no mesmo horário, eu ouço os freios.",
                "No meu prontuário existe uma coisa que eles não querem que eu veja.",
                "Paciente 404.",
                "Esse número não é o meu.",
                "É o número da sala onde tudo começou."
            ],
            "K"
        );

        state.missions.patient.completed =
            true;

        return;

    }


    if (name === "Senhora") {

        showDialogue(
            "Senhora da Cidade Antiga",
            "Uma moradora que lembra do passado",
            [
                "Você veio da estação, não veio?",
                "Eu reconheceria aquele olhar em qualquer lugar.",
                "Muitos anos atrás, homens vieram cavar túneis por baixo desta cidade.",
                "Depois aconteceu um acidente.",
                "Disseram que ninguém sobreviveu.",
                "Mas algumas noites depois, pessoas começaram a ouvir um trem.",
                "O estranho é que o trem sempre leva os passageiros para o mesmo lugar."
            ],
            "S"
        );

    }

}


/* =========================================================
   DIÁLOGOS
========================================================= */

function showDialogue(
    name,
    role,
    pages,
    portrait
) {

    state.dialogueActive = true;

    state.dialoguePages =
        pages;

    state.dialogueIndex = 0;


    $("dialogueName")
        .textContent =
        name;

    $("dialogueRole")
        .textContent =
        role;

    $("dialoguePortrait")
        .textContent =
        portrait;


    $("dialogueOverlay")
        .classList.remove("hidden");


    if (controls.isLocked) {
        controls.unlock();
    }


    renderDialoguePage();

}


function renderDialoguePage() {

    const total =
        state.dialoguePages.length;

    const current =
        state.dialoguePages[
            state.dialogueIndex
        ];


    $("dialogueText")
        .textContent =
        current;


    $("dialogueProgress")
        .textContent =
        `${state.dialogueIndex + 1} / ${total}`;


    $("dialogueNext")
        .textContent =
        state.dialogueIndex === total - 1
            ? "FECHAR"
            : "CONTINUAR →";

}


function nextDialogue() {

    if (
        state.dialogueIndex <
        state.dialoguePages.length - 1
    ) {

        state.dialogueIndex++;

        renderDialoguePage();

        return;

    }


    closeDialogue();

}


function closeDialogue() {

    state.dialogueActive = false;

    $("dialogueOverlay")
        .classList.add("hidden");

    if (
        state.running
    ) {

        setTimeout(() => {

            controls.lock();

        }, 100);

    }

}


/* =========================================================
   INVENTÁRIO
========================================================= */

function toggleModal(id) {

    const element =
        $(id);

    if (
        element.classList.contains("hidden")
    ) {

        closeAllModals();

        element.classList.remove("hidden");

        if (controls.isLocked) {
            controls.unlock();
        }

        if (id === "inventoryOverlay") {
            renderInventory();
        }

        if (id === "missionsOverlay") {
            renderMissions();
        }

    }
    else {

        element.classList.add("hidden");

        if (state.running) {

            setTimeout(() => {
                controls.lock();
            }, 100);

        }

    }

}


function renderInventory() {

    const grid =
        $("inventoryGrid");

    grid.innerHTML = "";


    if (state.inventory.length === 0) {

        grid.innerHTML = `
            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:50px;
                color:#666;
            ">
                Seu inventário está vazio.<br>
                <small>Explore a estação e examine objetos.</small>
            </div>
        `;

        $("itemDetails")
            .classList.add("hidden");

        return;

    }


    state.inventory.forEach(item => {

        const card =
            document.createElement("button");

        card.className =
            "inventoryItem";

        card.innerHTML = `
            <div class="inventoryItemIcon">
                ${item.icon}
            </div>

            <div class="inventoryItemName">
                ${item.name}
            </div>

            <div class="inventoryItemHint">
                Clique para ver detalhes
            </div>
        `;


        card.addEventListener(
            "click",
            () => {

                selectInventoryItem(
                    item
                );

            }
        );


        grid.appendChild(card);

    });

}


let selectedInventoryItem = null;


function selectInventoryItem(item) {

    selectedInventoryItem =
        item;


    $("itemDetails")
        .classList.remove("hidden");


    $("itemDetailName")
        .textContent =
        item.name;


    $("itemDetailDescription")
        .textContent =
        item.description;


    $("itemActionHint")
        .textContent =
        `Ação disponível: ${item.action}`;


    $("itemActionButton")
        .textContent =
        item.action.toUpperCase();


    const visual =
        $("itemVisual");


    if (
        item.id === "ticket"
    ) {

        visual.innerHTML = `
            <div class="itemTicket">
                <strong>METROPOLITANO</strong>
                <small>ÚLTIMO TREM</small>
                <small>17 • 04 • 1987</small>
            </div>
        `;

    }
    else {

        visual.innerHTML = `
            <div style="font-size:65px">
                ${item.icon}
            </div>
        `;

    }

}


function useSelectedItem() {

    if (!selectedInventoryItem)
        return;


    const item =
        selectedInventoryItem;


    if (
        item.id === "key"
    ) {

        showCenterMessage(
            "A chave possui o número 0 gravado."
        );

        return;

    }


    if (
        item.id === "ticket"
    ) {

        showDialogue(
            "Bilhete impossível",
            "Objeto encontrado",
            [
                "METROPOLITANO — ÚLTIMO TREM.",
                "Data: 17/04/1987.",
                "Destino: SALA 0.",
                "No verso há uma frase: 'O trem parte quando o relógio esquece a hora.'"
            ],
            "🎟️"
        );

        return;

    }


    showCenterMessage(
        item.description
    );

}


/* =========================================================
   MISSÕES
========================================================= */

function renderMissions() {

    const list =
        $("missionsList");

    list.innerHTML = "";


    Object.entries(
        state.missions
    ).forEach(
        ([id, mission]) => {

            const card =
                document.createElement("div");

            card.className =
                "missionCard";

            if (
                mission.completed
            ) {

                card.classList.add(
                    "completed"
                );

            }


            card.innerHTML = `

                <h3>
                    ${mission.completed ? "✓ " : ""}
                    ${mission.title}
                </h3>

                <p>
                    ${mission.description}
                </p>

                <div class="missionStatus">
                    ${
                        mission.completed
                            ? "CONCLUÍDA"
                            : "EM ANDAMENTO"
                    }
                </div>

            `;


            list.appendChild(card);

        }
    );

}


/* =========================================================
   PUZZLES
========================================================= */

function openPuzzle(type) {

    state.currentPuzzle =
        type;


    $("puzzleOverlay")
        .classList.remove("hidden");


    $("puzzleInput")
        .value = "";


    $("puzzleError")
        .textContent = "";


    if (type === "hospital") {

        $("puzzleTitle")
            .textContent =
            "Terminal — Hospital São Lucas";

        $("puzzleDescription")
            .textContent =
            "O terminal pede o número do paciente.";

    }
    else {

        $("puzzleTitle")
            .textContent =
            "Terminal antigo";

        $("puzzleDescription")
            .textContent =
            "A tela exibe apenas quatro zeros incompletos.";

    }


    setTimeout(() => {

        $("puzzleInput")
            .focus();

    }, 100);


    if (controls.isLocked) {
        controls.unlock();
    }

}


function confirmPuzzle() {

    const value =
        $("puzzleInput")
            .value
            .trim();


    let correct = false;


    if (
        state.currentPuzzle === "hospital" &&
        value === "0404"
    ) {

        correct = true;

        state.hospitalSolved =
            true;

        state.clues += 2;

        state.missions.patient.completed =
            true;

        showCenterMessage(
            "Terminal desbloqueado. Paciente 404 localizado."
        );

    }


    else if (
        state.currentPuzzle === "tunnels" &&
        value === "0000"
    ) {

        correct = true;

        state.tunnelsSolved =
            true;

        state.trainUnlocked =
            true;

        state.clues += 2;

        state.missions.tunnels.completed =
            true;

        showCenterMessage(
            "Uma porta antiga se abriu."
        );

    }


    if (correct) {

        closePuzzle();

        saveGame();

        updateHUD();

    }
    else {

        $("puzzleError")
            .textContent =
            "Código incorreto.";

    }

}


function closePuzzle() {

    $("puzzleOverlay")
        .classList.add("hidden");

    state.currentPuzzle =
        null;

}


/* =========================================================
   TREM
========================================================= */

function openTrainMenu() {

    $("trainOverlay")
        .classList.remove("hidden");

    if (controls.isLocked) {
        controls.unlock();
    }

}


function travelByTrain(destination) {

    $("trainOverlay")
        .classList.add("hidden");


    if (
        destination === "room0" &&
        !state.trainUnlocked
    ) {

        showCenterMessage(
            "O destino Sala 0 ainda não está disponível."
        );

        return;

    }


    if (
        destination === "hospital"
    ) {

        camera.position.set(
            0,
            PLAYER_HEIGHT,
            -48
        );

        state.currentArea =
            "hospital";

    }


    else if (
        destination === "oldTown"
    ) {

        camera.position.set(
            60,
            PLAYER_HEIGHT,
            -48
        );

        state.currentArea =
            "oldTown";

    }


    else if (
        destination === "tunnels"
    ) {

        camera.position.set(
            0,
            PLAYER_HEIGHT,
            40
        );

        state.currentArea =
            "tunnels";

    }


    else if (
        destination === "room0"
    ) {

        camera.position.set(
            0,
            PLAYER_HEIGHT,
            76
        );

        state.currentArea =
            "room0";

        state.missions.room0.completed =
            true;

        setTimeout(
            determineEnding,
            2000
        );

    }


    showCenterMessage(
        "O trem partiu..."
    );

    saveGame();

}


/* =========================================================
   FINAL
========================================================= */

function determineEnding() {

    if (state.endingShown)
        return;


    state.endingShown = true;

    state.running = false;


    let ending;


    if (
        state.clues >= 7 &&
        state.hospitalSolved &&
        state.tunnelsSolved
    ) {

        ending = {
            symbol: "◉",
            title: "A VERDADE",
            text:
                "As pistas finalmente se encaixam. O Último Trem não é apenas um trem: ele é o ponto de repetição de um experimento que nunca terminou. Yuri descobre sua ligação com a primeira viagem e encontra a origem da Sala 0."
        };

    }

    else if (
        state.tunnelsSolved
    ) {

        ending = {
            symbol: "◇",
            title: "O ÚLTIMO TREM",
            text:
                "Você encontrou a Sala 0, mas algumas respostas continuam escondidas. O trem começa a partir novamente enquanto o relógio retorna para 23:47."
        };

    }

    else if (
        state.inventory.some(
            item => item.id === "ticket"
        )
    ) {

        ending = {
            symbol: "∞",
            title: "CICLO",
            text:
                "O bilhete revela apenas parte da verdade. Quando você percebe o que está acontecendo, o som do trem desaparece e a estação volta ao início."
        };

    }

    else {

        ending = {
            symbol: "?",
            title: "PERDIDO",
            text:
                "Você deixou a estação sem compreender completamente o que aconteceu. Talvez a próxima noite revele mais."
        };

    }


    $("endingSymbol")
        .textContent =
        ending.symbol;

    $("endingTitle")
        .textContent =
        ending.title;

    $("endingText")
        .textContent =
        ending.text;


    $("endingOverlay")
        .classList.remove("hidden");


    if (controls.isLocked) {
        controls.unlock();
    }

}


/* =========================================================
   RELÓGIO
========================================================= */

function updateGameTime(delta) {

    // aproximadamente 1 minuto do jogo a cada 4 segundos reais
    state.gameMinutes +=
        delta / 4;


    if (
        state.gameMinutes >= 1440
    ) {

        state.gameMinutes -=
            1440;

    }


    const total =
        Math.floor(
            state.gameMinutes
        );


    const hours =
        Math.floor(
            total / 60
        ) % 24;

    const minutes =
        total % 60;


    $("gameClock")
        .textContent =
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    $("lifeBar")
        .style.width =
        `${Math.max(0, state.lives)}%`;


    $("energyBar")
        .style.width =
        `${Math.max(0, state.energy)}%`;


    $("clueCount")
        .textContent =
        state.clues;


    $("coinCount")
        .textContent =
        state.coins;


    updateMissionForArea();

}


/* =========================================================
   MENSAGEM
========================================================= */

let messageTimeout;


function showCenterMessage(
    message,
    duration = 2800
) {

    $("centerMessageText")
        .textContent =
        message;


    $("centerMessage")
        .classList.remove("hidden");


    clearTimeout(
        messageTimeout
    );


    messageTimeout =
        setTimeout(
            () => {

                $("centerMessage")
                    .classList.add("hidden");

            },
            duration
        );

}


/* =========================================================
   MOBILE
========================================================= */

function setupMobile() {

    document.querySelectorAll(
        "#mobileJoystick button"
    ).forEach(button => {

        const key =
            button.dataset.key;


        const press = event => {

            event.preventDefault();

            keys[
                "Key" +
                key.toUpperCase()
            ] = true;

        };


        const release = event => {

            event.preventDefault();

            keys[
                "Key" +
                key.toUpperCase()
            ] = false;

        };


        button.addEventListener(
            "touchstart",
            press,
            { passive: false }
        );

        button.addEventListener(
            "touchend",
            release,
            { passive: false }
        );

        button.addEventListener(
            "mousedown",
            press
        );

        button.addEventListener(
            "mouseup",
            release
        );

    });


    $("mobileInteract")
        .addEventListener(
            "click",
            interact
        );


    $("mobileFlashlight")
        .addEventListener(
            "click",
            toggleFlashlight
        );


    $("mobileInventory")
        .addEventListener(
            "click",
            () => {
                toggleModal(
                    "inventoryOverlay"
                );
            }
        );

}


/* =========================================================
   FECHAR MODAIS
========================================================= */

function closeAllModals() {

    [
        "inventoryOverlay",
        "missionsOverlay",
        "puzzleOverlay",
        "trainOverlay"
    ].forEach(id => {

        $(id).classList.add(
            "hidden"
        );

    });

}


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            !camera ||
            !renderer
        ) return;


        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


/* =========================================================
   LOOP PRINCIPAL
========================================================= */

function animate() {

    requestAnimationFrame(
        animate
    );


    if (!state.running)
        return;


    const delta =
        Math.min(
            clock.getDelta(),
            .05
        );


    updateMovement(
        delta
    );


    updateGameTime(
        delta
    );


    updateInteractionHint();


    // chuva
    if (rain) {

        const position =
            rain.geometry
                .attributes
                .position
                .array;


        for (
            let i = 1;
            i < position.length;
            i += 3
        ) {

            position[i] -=
                delta * 15;


            if (
                position[i] < 0
            ) {

                position[i] =
                    30;

            }

        }


        rain.geometry
            .attributes
            .position
            .needsUpdate = true;

    }


    // trem
    if (train) {

        train.position.x =
            -30 +
            Math.sin(
                state.gameMinutes / 3
            ) * 2;

    }


    // personagens respirando / movimento sutil
    Object.values(
        npcs
    ).forEach(npc => {

        npc.position.y =
            Math.sin(
                performance.now() *
                .0015
            ) * .015;

    });


    renderer.render(
        scene,
        camera
    );

}


/* =========================================================
   AUTO SAVE
========================================================= */

setInterval(
    () => {

        if (
            state.running
        ) {

            saveGame();

        }

    },
    10000
);
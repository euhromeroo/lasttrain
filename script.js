import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const SAVE_KEY = "ultimo_trem_save_v3";

let scene;
let camera;
let renderer;
let controls;

let clock = new THREE.Clock();

let flashlight;
let flashlightGlow;
let flashlightOn = true;

let player = {
    health: 100,
    energy: 100,
    x: 0,
    z: 8
};

let gameTime = {
    hour: 23,
    minute: 47
};

let currentLocation = "Estação Central";

let keys = {};

let interactables = [];
let npcs = [];
let pickups = [];
let environmentObjects = [];

let currentInteractable = null;
let currentDialogue = null;
let dialogueIndex = 0;
let typingTimer = null;

let selectedItem = null;

let inventory = {
    ticket: true,
    flashlight: true,
    key: false,
    coin: false,
    hospitalCard: false,
    conductorBadge: false
};

let clues = [];

let missions = [
    {
        title: "A estação vazia",
        description: "Explore a Estação Central e descubra por que ela foi abandonada.",
        active: true,
        done: false
    },
    {
        title: "A mulher na plataforma",
        description: "Encontre Olivia e descubra por que ela ainda está esperando.",
        active: false,
        done: false
    },
    {
        title: "O bilhete impossível",
        description: "Examine o bilhete encontrado e descubra o que significa a Sala 0.",
        active: false,
        done: false
    },
    {
        title: "Paciente 404",
        description: "Investigue o Hospital São Lucas.",
        active: false,
        done: false
    },
    {
        title: "Debaixo da cidade",
        description: "Encontre uma entrada para os túneis antigos.",
        active: false,
        done: false
    },
    {
        title: "Sala 0",
        description: "Descubra o que realmente aconteceu naquela noite.",
        active: false,
        done: false
    }
];


/* =========================================================
   ELEMENTOS HTML
========================================================= */

const $ = id => document.getElementById(id);

const loadingScreen = $("loadingScreen");
const mainMenu = $("mainMenu");
const gameContainer = $("gameContainer");
const hud = $("hud");

const loadingProgress = $("loadingProgress");
const loadingText = $("loadingText");

const gameClock = $("gameClock");
const locationName = $("locationName");

const lifeValue = $("lifeValue");
const energyValue = $("energyValue");

const interactionHint = $("interactionHint");
const interactionText = $("interactionText");

const objectiveText = $("objectiveText");

const inventoryModal = $("inventoryModal");
const itemModal = $("itemModal");
const dialogueModal = $("dialogueModal");
const missionsModal = $("missionsModal");
const ticketModal = $("ticketModal");
const puzzleModal = $("puzzleModal");
const endingModal = $("endingModal");


/* =========================================================
   CORES
========================================================= */

const COLORS = {
    wall: 0x35363a,
    wallDark: 0x202126,
    floor: 0x4b4c4f,
    tile: 0x737478,
    metal: 0x777a7d,
    darkMetal: 0x27292c,
    wood: 0x553e2e,
    brass: 0xb69a58,
    white: 0xe8e7e1,
    warm: 0xffd98a,
    red: 0x8e242b,
    blue: 0x283d59,
    green: 0x334c40
};


/* =========================================================
   MATERIAIS
========================================================= */

function material(color, roughness = 0.75, metalness = 0) {
    return new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness
    });
}

const mat = {
    wall: material(COLORS.wall),
    wallDark: material(COLORS.wallDark),
    floor: material(COLORS.floor),
    tile: material(COLORS.tile),
    metal: material(COLORS.metal, .5, .6),
    darkMetal: material(COLORS.darkMetal, .35, .8),
    wood: material(COLORS.wood),
    brass: material(COLORS.brass, .3, .7),
    white: material(COLORS.white),
    warm: new THREE.MeshStandardMaterial({
        color: COLORS.warm,
        emissive: COLORS.warm,
        emissiveIntensity: 1.5
    }),
    red: material(COLORS.red),
    blue: material(COLORS.blue),
    green: material(COLORS.green),
    skin: new THREE.MeshStandardMaterial({
        color: 0xd19a78,
        roughness: .85
    }),
    skinLight: new THREE.MeshStandardMaterial({
        color: 0xe0b092,
        roughness: .85
    }),
    hair: material(0x211b1b, .9),
    hairLight: material(0x574039, .9),
    clothesDark: material(0x17191e),
    clothesGray: material(0x3e4148),
    shirt: material(0x676b76),
    shoes: material(0x101114)
};


/* =========================================================
   UTILITÁRIOS 3D
========================================================= */

function addMesh(geometry, material, position, rotation = null, parent = scene) {

    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(
        position.x || 0,
        position.y || 0,
        position.z || 0
    );

    if (rotation) {
        mesh.rotation.set(
            rotation.x || 0,
            rotation.y || 0,
            rotation.z || 0
        );
    }

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    parent.add(mesh);

    return mesh;
}


function box(w, h, d, material, x, y, z, parent = scene) {
    return addMesh(
        new THREE.BoxGeometry(w, h, d),
        material,
        { x, y, z },
        null,
        parent
    );
}


function cylinder(radius, height, material, x, y, z, segments = 20, parent = scene) {

    return addMesh(
        new THREE.CylinderGeometry(
            radius,
            radius,
            height,
            segments
        ),
        material,
        { x, y, z },
        null,
        parent
    );
}


function sphere(radius, material, x, y, z, parent = scene) {

    return addMesh(
        new THREE.SphereGeometry(radius, 24, 16),
        material,
        { x, y, z },
        null,
        parent
    );
}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

async function init() {

    try {

        await loadingStep("Construindo a estação...", 20);
        createScene();

        await loadingStep("Acendendo as luzes...", 40);
        createLights();

        await loadingStep("Preparando a plataforma...", 60);
        createStation();

        await loadingStep("Preparando os personagens...", 75);
        createCharacters();

        await loadingStep("Espalhando as pistas...", 88);
        createItems();

        await loadingStep("Quase meia-noite...", 100);

        setupEvents();

        setTimeout(() => {

            loadingScreen.classList.add("hidden");
            mainMenu.classList.remove("hidden");

        }, 500);

    } catch (error) {

        console.error(error);

        loadingText.textContent =
            "Não foi possível carregar a estação. Abra pelo Live Server.";

        loadingProgress.style.width = "100%";
    }
}


function loadingStep(text, progress) {

    return new Promise(resolve => {

        loadingText.textContent = text;
        loadingProgress.style.width = `${progress}%`;

        setTimeout(resolve, 250);
    });
}


/* =========================================================
   CENA
========================================================= */

function createScene() {

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x15171b);

    scene.fog = new THREE.FogExp2(
        0x15171b,
        0.008
    );

    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        500
    );

    camera.position.set(
        player.x,
        1.72,
        player.z
    );

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;

    gameContainer.appendChild(renderer.domElement);

    controls = new PointerLockControls(
        camera,
        renderer.domElement
    );

    controls.pointerSpeed = 0.75;

    gameContainer.addEventListener("click", () => {

        if (
            !mainMenu.classList.contains("hidden") ||
            !dialogueModal.classList.contains("hidden") ||
            !inventoryModal.classList.contains("hidden")
        ) {
            return;
        }

        controls.lock();
    });
}


/* =========================================================
   ILUMINAÇÃO
========================================================= */

function createLights() {

    const hemi = new THREE.HemisphereLight(
        0xbfc5d8,
        0x24262b,
        2.3
    );

    scene.add(hemi);

    const ambient = new THREE.AmbientLight(
        0x9ca3b5,
        1.4
    );

    scene.add(ambient);


    // Luz principal da estação

    const mainLight = new THREE.PointLight(
        0xffe6b0,
        9,
        70,
        1.5
    );

    mainLight.position.set(
        0,
        8,
        0
    );

    mainLight.castShadow = true;

    scene.add(mainLight);


    // Lanternas do jogador

    flashlight = new THREE.SpotLight(
        0xffffff,
        13,
        55,
        Math.PI / 5,
        0.45,
        1.2
    );

    flashlight.position.set(
        0,
        1.7,
        0
    );

    flashlight.castShadow = true;

    flashlight.shadow.mapSize.width = 2048;
    flashlight.shadow.mapSize.height = 2048;

    flashlight.shadow.camera.near = 0.1;
    flashlight.shadow.camera.far = 70;

    flashlight.target.position.set(
        0,
        1.2,
        -10
    );

    camera.add(flashlight);
    camera.add(flashlight.target);


    flashlightGlow = new THREE.PointLight(
        0xdde7ff,
        2.2,
        12
    );

    camera.add(flashlightGlow);
}


/* =========================================================
   ESTAÇÃO
========================================================= */

function createStation() {

    // Piso enorme

    box(
        70,
        .35,
        110,
        mat.floor,
        0,
        -.2,
        -25
    );


    // Teto

    box(
        70,
        .5,
        110,
        mat.wallDark,
        0,
        9,
        -25
    );


    // Parede esquerda

    box(
        .5,
        9,
        110,
        mat.wall,
        -30,
        4.5,
        -25
    );


    // Parede direita

    box(
        .5,
        9,
        110,
        mat.wall,
        30,
        4.5,
        -25
    );


    // Fundo da estação

    box(
        60,
        9,
        .5,
        mat.wall,
        0,
        4.5,
        -80
    );


    createPlatformTiles();

    createColumns();

    createBenches();

    createStationLights();

    createSigns();

    createTracks();

    createTunnel();

    createRain();

    createStationDecorations();
}


/* =========================================================
   PISO / TILES
========================================================= */

function createPlatformTiles() {

    for (let x = -28; x <= 28; x += 4) {

        for (let z = 18; z >= -78; z -= 4) {

            const tile = box(
                3.8,
                .025,
                3.8,
                ((x + z) / 4) % 2 === 0
                    ? mat.tile
                    : mat.floor,
                x,
                -.01,
                z
            );

            tile.receiveShadow = true;
        }
    }


    // Faixa de segurança

    const safety = new THREE.Mesh(
        new THREE.BoxGeometry(
            60,
            .04,
            1.2
        ),
        material(0xd3b05b)
    );

    safety.position.set(
        0,
        .02,
        -5
    );

    safety.receiveShadow = true;

    scene.add(safety);
}


/* =========================================================
   COLUNAS
========================================================= */

function createColumns() {

    for (let z = 14; z >= -74; z -= 11) {

        for (const x of [-23, 23]) {

            cylinder(
                .55,
                8.2,
                mat.darkMetal,
                x,
                4,
                z,
                18
            );

            cylinder(
                .72,
                .18,
                mat.metal,
                x,
                .2,
                z,
                20
            );

            cylinder(
                .72,
                .18,
                mat.metal,
                x,
                8,
                z,
                20
            );

            // faixa metálica decorativa

            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(
                    .57,
                    .07,
                    10,
                    24
                ),
                mat.brass
            );

            ring.position.set(
                x,
                6.4,
                z
            );

            ring.rotation.x = Math.PI / 2;

            scene.add(ring);
        }
    }
}


/* =========================================================
   BANCOS
========================================================= */

function createBench(x, z, rotation = 0) {

    const group = new THREE.Group();

    group.position.set(
        x,
        0,
        z
    );

    group.rotation.y = rotation;

    // assento

    const seat = box(
        3.4,
        .25,
        .65,
        mat.wood,
        0,
        1.05,
        0,
        group
    );

    // encosto

    box(
        3.4,
        1.2,
        .18,
        mat.wood,
        0,
        1.7,
        .22,
        group
    );

    // pés

    for (const side of [-1, 1]) {

        box(
            .14,
            1.05,
            .45,
            mat.darkMetal,
            side * 1.2,
            .5,
            0,
            group
        );
    }

    scene.add(group);

    environmentObjects.push(group);
}


function createBenches() {

    createBench(-12, 8);
    createBench(12, 8);
    createBench(-12, -20);
    createBench(12, -20);
    createBench(-12, -50);
    createBench(12, -50);
}


/* =========================================================
   POSTES / LUMINÁRIAS
========================================================= */

function createStationLights() {

    for (let z = 12; z >= -72; z -= 12) {

        for (const x of [-16, 16]) {

            cylinder(
                .08,
                5,
                mat.darkMetal,
                x,
                2.5,
                z,
                12
            );

            const arm = box(
                1.3,
                .08,
                .08,
                mat.darkMetal,
                x + (x > 0 ? -.6 : .6),
                4.9,
                z
            );

            const lampX =
                x + (x > 0 ? -1.2 : 1.2);

            const lamp = sphere(
                .17,
                mat.warm,
                lampX,
                4.75,
                z
            );

            const light = new THREE.PointLight(
                0xffdca0,
                4.5,
                18
            );

            light.position.set(
                lampX,
                4.7,
                z
            );

            light.castShadow = true;

            scene.add(light);
        }
    }
}


/* =========================================================
   PLACAS
========================================================= */

function createSign(text, x, y, z, rotation = 0) {

    const canvas = document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 128;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#20242a";
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = "#777";
    ctx.lineWidth = 4;
    ctx.strokeRect(3, 3, 506, 122);

    ctx.fillStyle = "#eeeeea";
    ctx.font = "bold 45px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
        text,
        256,
        64
    );

    const texture = new THREE.CanvasTexture(canvas);

    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(5, 1.25),
        new THREE.MeshStandardMaterial({
            map: texture,
            emissive: 0x101010,
            emissiveIntensity: .4
        })
    );

    sign.position.set(
        x,
        y,
        z
    );

    sign.rotation.y = rotation;

    scene.add(sign);
}


function createSigns() {

    createSign(
        "ESTAÇÃO CENTRAL",
        0,
        6.5,
        -2,
        0
    );

    createSign(
        "PLATAFORMA 01",
        -18,
        5,
        -10,
        Math.PI / 2
    );

    createSign(
        "SAÍDA",
        20,
        5,
        -40,
        -Math.PI / 2
    );

    createSign(
        "LINHA 0",
        0,
        6,
        -74,
        0
    );
}


/* =========================================================
   TRILHOS
========================================================= */

function createTracks() {

    const trackZ = -25;

    for (const x of [-9, 9]) {

        box(
            .14,
            .12,
            95,
            mat.metal,
            x,
            -.02,
            trackZ
        );
    }

    for (
        let z = trackZ - 45;
        z <= trackZ + 45;
        z += 2
    ) {

        box(
            22,
            .15,
            .18,
            mat.darkMetal,
            0,
            -.02,
            z
        );
    }
}


/* =========================================================
   TÚNEL
========================================================= */

function createTunnel() {

    const tunnel = new THREE.Mesh(
        new THREE.CylinderGeometry(
            8,
            8,
            16,
            32,
            1,
            false,
            0,
            Math.PI
        ),
        mat.wallDark
    );

    tunnel.rotation.z = Math.PI / 2;

    tunnel.position.set(
        0,
        4,
        -78
    );

    scene.add(tunnel);


    const tunnelDark = new THREE.Mesh(
        new THREE.CircleGeometry(
            7.7,
            32
        ),
        new THREE.MeshBasicMaterial({
            color: 0x020305
        })
    );

    tunnelDark.position.set(
        0,
        4,
        -79
    );

    tunnelDark.rotation.y = Math.PI;

    scene.add(tunnelDark);
}


/* =========================================================
   DECORAÇÕES
========================================================= */

function createStationDecorations() {

    // Lixeiras

    for (const pos of [
        [-19, 1, 4],
        [19, 1, 4],
        [-19, 1, -30],
        [19, 1, -30],
        [-19, 1, -60]
    ]) {

        cylinder(
            .3,
            1.2,
            mat.darkMetal,
            pos[0],
            .6,
            pos[2],
            18
        );
    }


    // Relógio grande

    const clockGroup = new THREE.Group();

    clockGroup.position.set(
        0,
        5.5,
        -1.5
    );

    const clockFace = cylinder(
        1.15,
        .18,
        mat.white,
        0,
        0,
        0,
        32,
        clockGroup
    );

    clockFace.rotation.x = Math.PI / 2;

    const clockCenter = sphere(
        .1,
        mat.darkMetal,
        0,
        0,
        -.15,
        clockGroup
    );

    const hand1 = box(
        .06,
        .7,
        .04,
        mat.darkMetal,
        0,
        .3,
        -.18,
        clockGroup
    );

    hand1.rotation.z = -.7;

    const hand2 = box(
        .05,
        .45,
        .04,
        mat.darkMetal,
        0,
        .2,
        -.2,
        clockGroup
    );

    hand2.rotation.z = 1;

    scene.add(clockGroup);
}


/* =========================================================
   CHUVA
========================================================= */

function createRain() {

    const count = 1500;

    const positions = new Float32Array(
        count * 3
    );

    for (let i = 0; i < count; i++) {

        positions[i * 3] =
            (Math.random() - .5) * 65;

        positions[i * 3 + 1] =
            Math.random() * 20;

        positions[i * 3 + 2] =
            Math.random() * 100 - 80;
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
            color: 0xb8c6d9,
            size: .035,
            transparent: true,
            opacity: .38
        });

    const rain =
        new THREE.Points(
            geometry,
            materialRain
        );

    rain.userData.isRain = true;

    scene.add(rain);

    environmentObjects.push(rain);
}


/* =========================================================
   PERSONAGENS
========================================================= */

function createHuman({
    name,
    x,
    z,
    shirtMaterial,
    pantsMaterial,
    hairMaterial,
    skinMaterial = mat.skin
}) {

    const group = new THREE.Group();

    group.position.set(
        x,
        0,
        z
    );

    group.userData.name = name;

    // pernas

    const legL = new THREE.Mesh(
        new THREE.CapsuleGeometry(
            .17,
            .75,
            5,
            12
        ),
        pantsMaterial
    );

    legL.position.set(
        -.2,
        .65,
        0
    );

    group.add(legL);

    const legR = new THREE.Mesh(
        new THREE.CapsuleGeometry(
            .17,
            .75,
            5,
            12
        ),
        pantsMaterial
    );

    legR.position.set(
        .2,
        .65,
        0
    );

    group.add(legR);


    // sapatos

    const shoeL = new THREE.Mesh(
        new THREE.BoxGeometry(
            .34,
            .16,
            .65
        ),
        mat.shoes
    );

    shoeL.position.set(
        -.2,
        .18,
        -.12
    );

    group.add(shoeL);

    const shoeR = new THREE.Mesh(
        new THREE.BoxGeometry(
            .34,
            .16,
            .65
        ),
        mat.shoes
    );

    shoeR.position.set(
        .2,
        .18,
        -.12
    );

    group.add(shoeR);


    // torso

    const torso = new THREE.Mesh(
        new THREE.CapsuleGeometry(
            .42,
            .65,
            6,
            16
        ),
        shirtMaterial
    );

    torso.position.y = 1.45;

    group.add(torso);


    // pescoço

    cylinder(
        .13,
        .18,
        skinMaterial,
        0,
        1.95,
        0,
        16,
        group
    );


    // cabeça

    const head = sphere(
        .39,
        skinMaterial,
        0,
        2.35,
        0,
        group
    );


    // cabelo

    const hair = new THREE.Mesh(
        new THREE.SphereGeometry(
            .405,
            24,
            16,
            0,
            Math.PI * 2,
            0,
            Math.PI * .62
        ),
        hairMaterial
    );

    hair.position.set(
        0,
        2.46,
        .01
    );

    group.add(hair);


    // olhos

    for (const eyeX of [-.13, .13]) {

        sphere(
            .035,
            mat.white,
            eyeX,
            2.38,
            -.36,
            group
        );

        sphere(
            .018,
            mat.darkMetal,
            eyeX,
            2.38,
            -.393,
            group
        );
    }


    // nariz

    const nose = new THREE.Mesh(
        new THREE.ConeGeometry(
            .055,
            .13,
            8
        ),
        skinMaterial
    );

    nose.rotation.x = Math.PI / 2;

    nose.position.set(
        0,
        2.28,
        -.39
    );

    group.add(nose);


    // boca

    const mouth = new THREE.Mesh(
        new THREE.BoxGeometry(
            .12,
            .018,
            .018
        ),
        material(0x5d302f)
    );

    mouth.position.set(
        0,
        2.16,
        -.39
    );

    group.add(mouth);


    // braços

    for (const side of [-1, 1]) {

        const arm = new THREE.Mesh(
            new THREE.CapsuleGeometry(
                .12,
                .62,
                5,
                12
            ),
            shirtMaterial
        );

        arm.position.set(
            side * .52,
            1.43,
            0
        );

        arm.rotation.z =
            side * -.12;

        group.add(arm);


        // mão

        sphere(
            .13,
            skinMaterial,
            side * .54,
            .98,
            0,
            group
        );
    }


    // pequeno detalhe de roupa

    box(
        .3,
        .12,
        .03,
        mat.white,
        0,
        1.6,
        -.43,
        group
    );


    scene.add(group);

    npcs.push({
        name,
        object: group,
        talked: false
    });

    return group;
}


/* =========================================================
   PERSONAGENS DA HISTÓRIA
========================================================= */

function createCharacters() {

    createHuman({
        name: "Olivia",
        x: -6,
        z: -1,
        shirtMaterial: material(0x424c5d),
        pantsMaterial: material(0x1c2028),
        hairMaterial: mat.hairLight,
        skinMaterial: mat.skinLight
    });


    createHuman({
        name: "Condutor",
        x: 8,
        z: -18,
        shirtMaterial: material(0x202328),
        pantsMaterial: material(0x111216),
        hairMaterial: mat.hair,
        skinMaterial: mat.skin
    });


    createHuman({
        name: "Kaio",
        x: -8,
        z: -42,
        shirtMaterial: material(0x66727b),
        pantsMaterial: material(0x262b30),
        hairMaterial: mat.hair,
        skinMaterial: mat.skin
    });


    createHuman({
        name: "Senhora da Cidade Antiga",
        x: 10,
        z: -62,
        shirtMaterial: material(0x514b57),
        pantsMaterial: material(0x302d36),
        hairMaterial: material(0x77716e),
        skinMaterial: mat.skinLight
    });
}


/* =========================================================
   OBJETOS / ITENS
========================================================= */

function createItems() {

    createTicket(
        -1.5,
        .35,
        4
    );

    createKey(
        5,
        .45,
        -34
    );

    createCoin(
        -6,
        .25,
        -54
    );
}


/* =========================================================
   BILHETE 3D
========================================================= */

function createTicket(x, y, z) {

    const group = new THREE.Group();

    group.position.set(
        x,
        y,
        z
    );

    const paper = new THREE.Mesh(
        new THREE.BoxGeometry(
            1.8,
            .06,
            .85
        ),
        new THREE.MeshStandardMaterial({
            color: 0xd3c29c,
            roughness: .9
        })
    );

    group.add(paper);


    // faixa vermelha

    box(
        1.7,
        .065,
        .13,
        mat.red,
        0,
        .05,
        -.2,
        group
    );


    // letras

    const canvas =
        document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 256;

    const ctx =
        canvas.getContext("2d");

    ctx.fillStyle = "#302b21";
    ctx.font = "bold 42px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "ÚLTIMO TREM",
        256,
        90
    );

    ctx.font = "bold 28px monospace";

    ctx.fillText(
        "00:00  •  LINHA 0",
        256,
        145
    );

    ctx.font = "20px Arial";

    ctx.fillText(
        "SALA 0",
        256,
        190
    );

    const texture =
        new THREE.CanvasTexture(canvas);

    const face =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                1.7,
                .75
            ),
            new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true
            })
        );

    face.position.z = -.44;

    face.rotation.x = -Math.PI / 2;

    group.add(face);


    // iluminação

    const light =
        new THREE.PointLight(
            0xffe2a5,
            1.2,
            4
        );

    light.position.y = .5;

    group.add(light);


    group.userData.itemType = "ticket";
    group.userData.interaction =
        "Pegar o bilhete";

    scene.add(group);

    pickups.push(group);
}


/* =========================================================
   CHAVE 3D
========================================================= */

function createKey(x, y, z) {

    const group = new THREE.Group();

    group.position.set(
        x,
        y,
        z
    );

    const shaft = new THREE.Mesh(
        new THREE.BoxGeometry(
            .18,
            .15,
            1.5
        ),
        mat.brass
    );

    shaft.rotation.y = .5;

    group.add(shaft);


    const ring =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                .38,
                .1,
                12,
                24
            ),
            mat.brass
        );

    ring.rotation.x = Math.PI / 2;

    ring.position.set(
        -.55,
        0,
        .3
    );

    group.add(ring);


    const tooth1 = box(
        .22,
        .14,
        .28,
        mat.brass,
        .48,
        0,
        -.1,
        group
    );

    tooth1.rotation.y = .5;


    const tooth2 = box(
        .22,
        .14,
        .25,
        mat.brass,
        .66,
        0,
        -.1,
        group
    );

    tooth2.rotation.y = .5;


    group.userData.itemType = "key";
    group.userData.interaction =
        "Pegar a chave antiga";

    scene.add(group);

    pickups.push(group);
}


/* =========================================================
   MOEDA 3D
========================================================= */

function createCoin(x, y, z) {

    const group = new THREE.Group();

    group.position.set(
        x,
        y,
        z
    );

    const coin =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                .42,
                .42,
                .12,
                32
            ),
            mat.brass
        );

    coin.rotation.x =
        Math.PI / 2;

    group.add(coin);


    const center =
        new THREE.Mesh(
            new THREE.CircleGeometry(
                .28,
                32
            ),
            material(0x80652b)
        );

    center.position.z = .07;

    group.add(center);


    const innerRing =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                .31,
                .025,
                8,
                32
            ),
            mat.gold
                ? mat.gold
                : mat.brass
        );

    innerRing.position.z = .08;

    group.add(innerRing);


    group.userData.itemType = "coin";
    group.userData.interaction =
        "Pegar a moeda estranha";

    scene.add(group);

    pickups.push(group);
}


/* =========================================================
   EVENTOS
========================================================= */

function setupEvents() {

    $("startButton").addEventListener(
        "click",
        startGame
    );

    $("continueButton").addEventListener(
        "click",
        continueGame
    );

    $("deleteSaveButton").addEventListener(
        "click",
        deleteSave
    );

    $("flashlightButton").addEventListener(
        "click",
        toggleFlashlight
    );

    $("inventoryButton").addEventListener(
        "click",
        openInventory
    );

    $("missionsButton").addEventListener(
        "click",
        openMissions
    );

    $("dialogueNext").addEventListener(
        "click",
        nextDialogue
    );

    $("endingRestart").addEventListener(
        "click",
        () => {
            endingModal.classList.add("hidden");
            location.reload();
        }
    );


    document.querySelectorAll(
        "[data-close]"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const id =
                    button.dataset.close;

                $(id).classList.add(
                    "hidden"
                );
            }
        );
    });


    $("useItemButton").addEventListener(
        "click",
        useSelectedItem
    );


    $("puzzleSubmit").addEventListener(
        "click",
        solvePuzzle
    );


    window.addEventListener(
        "keydown",
        onKeyDown
    );

    window.addEventListener(
        "keyup",
        onKeyUp
    );


    window.addEventListener(
        "resize",
        onResize
    );


    // Mobile

    bindMobileButton(
        "mobileUp",
        "KeyW"
    );

    bindMobileButton(
        "mobileLeft",
        "KeyA"
    );

    bindMobileButton(
        "mobileDown",
        "KeyS"
    );

    bindMobileButton(
        "mobileRight",
        "KeyD"
    );


    $("mobileFlashlight")
        .addEventListener(
            "click",
            toggleFlashlight
        );

    $("mobileInteract")
        .addEventListener(
            "click",
            interact
        );

    $("mobileInventory")
        .addEventListener(
            "click",
            openInventory
        );
}


/* =========================================================
   CONTROLES MOBILE
========================================================= */

function bindMobileButton(
    id,
    key
) {

    const button = $(id);

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

    button.addEventListener(
        "mousedown",
        () => {
            keys[key] = true;
        }
    );

    button.addEventListener(
        "mouseup",
        () => {
            keys[key] = false;
        }
    );

    button.addEventListener(
        "mouseleave",
        () => {
            keys[key] = false;
        }
    );
}


/* =========================================================
   TECLADO
========================================================= */

function onKeyDown(event) {

    keys[event.code] = true;

    if (
        event.code === "KeyF"
    ) {
        toggleFlashlight();
    }

    if (
        event.code === "KeyE"
    ) {
        interact();
    }

    if (
        event.code === "KeyI"
    ) {
        openInventory();
    }

    if (
        event.code === "KeyM"
    ) {
        openMissions();
    }

    if (
        event.code === "Escape"
    ) {
        closeAllModals();
    }
}


function onKeyUp(event) {

    keys[event.code] = false;
}


/* =========================================================
   INICIAR JOGO
========================================================= */

function startGame() {

    mainMenu.classList.add(
        "hidden"
    );

    gameContainer.classList.remove(
        "hidden"
    );

    hud.classList.remove(
        "hidden"
    );

    if (
        "ontouchstart" in window
    ) {
        $("mobileControls")
            .classList.remove(
                "hidden"
            );
    }

    player.x = 0;
    player.z = 8;

    camera.position.set(
        0,
        1.72,
        8
    );

    updateObjective();

    saveGame();

    animate();
}


function continueGame() {

    loadGame();

    mainMenu.classList.add(
        "hidden"
    );

    gameContainer.classList.remove(
        "hidden"
    );

    hud.classList.remove(
        "hidden"
    );

    if (
        "ontouchstart" in window
    ) {
        $("mobileControls")
            .classList.remove(
                "hidden"
            );
    }

    camera.position.set(
        player.x,
        1.72,
        player.z
    );

    updateObjective();

    animate();
}


/* =========================================================
   MOVIMENTO
========================================================= */

function updateMovement(delta) {

    if (
        !controls ||
        !controls.isLocked
    ) {
        return;
    }


    let forward = 0;
    let sideways = 0;


    // W / seta para cima

    if (
        keys["KeyW"] ||
        keys["ArrowUp"]
    ) {
        forward += 1;
    }


    // S / seta para baixo

    if (
        keys["KeyS"] ||
        keys["ArrowDown"]
    ) {
        forward -= 1;
    }


    // A / seta para esquerda
    // CORRIGIDO

    if (
        keys["KeyA"] ||
        keys["ArrowLeft"]
    ) {
        sideways -= 1;
    }


    // D / seta para direita
    // CORRIGIDO

    if (
        keys["KeyD"] ||
        keys["ArrowRight"]
    ) {
        sideways += 1;
    }


    if (
        forward === 0 &&
        sideways === 0
    ) {
        return;
    }


    const sprint =
        keys["ShiftLeft"] ||
        keys["ShiftRight"];


    const speed =
        sprint
            ? 6
            : 3.2;


    const direction =
        new THREE.Vector3(
            sideways,
            0,
            -forward
        );


    direction.normalize();


    const move =
        direction.multiplyScalar(
            speed * delta
        );


    controls.moveRight(
        move.x
    );

    controls.moveForward(
        -move.z
    );


    // Limites da estação

    camera.position.x =
        THREE.MathUtils.clamp(
            camera.position.x,
            -27,
            27
        );

    camera.position.z =
        THREE.MathUtils.clamp(
            camera.position.z,
            -76,
            16
        );


    player.x =
        camera.position.x;

    player.z =
        camera.position.z;


    if (sprint) {

        player.energy =
            Math.max(
                0,
                player.energy -
                delta * 4
            );

    } else {

        player.energy =
            Math.min(
                100,
                player.energy +
                delta * 1.5
            );
    }


    energyValue.textContent =
        Math.round(
            player.energy
        );
}


/* =========================================================
   INTERAÇÃO
========================================================= */

function findClosestInteraction() {

    currentInteractable = null;

    let closestDistance = Infinity;


    // NPCs

    for (const npc of npcs) {

        const distance =
            camera.position.distanceTo(
                npc.object.position
            );

        if (
            distance < 3.2 &&
            distance < closestDistance
        ) {

            closestDistance = distance;

            currentInteractable = {
                type: "npc",
                object: npc.object,
                npc
            };
        }
    }


    // pickups

    for (const pickup of pickups) {

        if (
            !pickup.parent
        ) {
            continue;
        }

        const distance =
            camera.position.distanceTo(
                pickup.position
            );

        if (
            distance < 2.7 &&
            distance < closestDistance
        ) {

            closestDistance = distance;

            currentInteractable = {
                type: "pickup",
                object: pickup
            };
        }
    }


    // terminal da Sala 0

    const terminal =
        scene.getObjectByName(
            "hospitalTerminal"
        );

    if (terminal) {

        const distance =
            camera.position.distanceTo(
                terminal.position
            );

        if (
            distance < 3 &&
            distance < closestDistance
        ) {

            currentInteractable = {
                type: "terminal",
                object: terminal
            };
        }
    }


    if (
        currentInteractable
    ) {

        interactionHint.classList.remove(
            "hidden"
        );


        if (
            currentInteractable.type === "npc"
        ) {

            interactionText.textContent =
                `Conversar com ${currentInteractable.npc.name}`;

        } else if (
            currentInteractable.type === "pickup"
        ) {

            const type =
                currentInteractable.object
                    .userData.itemType;

            const names = {
                ticket: "Pegar bilhete",
                key: "Pegar chave",
                coin: "Pegar moeda"
            };

            interactionText.textContent =
                names[type] || "Pegar objeto";

        } else {

            interactionText.textContent =
                "Examinar terminal";
        }

    } else {

        interactionHint.classList.add(
            "hidden"
        );
    }
}


/* =========================================================
   INTERAGIR
========================================================= */

function interact() {

    if (
        !currentInteractable
    ) {
        return;
    }


    const interaction =
        currentInteractable;


    if (
        interaction.type === "npc"
    ) {

        talkTo(
            interaction.npc
        );

        return;
    }


    if (
        interaction.type === "pickup"
    ) {

        collectItem(
            interaction.object
        );

        return;
    }


    if (
        interaction.type === "terminal"
    ) {

        openPuzzle();

        return;
    }
}


/* =========================================================
   PEGAR ITEM
========================================================= */

function collectItem(object) {

    const type =
        object.userData.itemType;


    if (
        type === "ticket"
    ) {

        inventory.ticket = true;

        addClue(
            "O bilhete impossível menciona a Sala 0."
        );

        completeMission(
            "A estação vazia"
        );

        activateMission(
            "A mulher na plataforma"
        );

        showTicket();

    } else if (
        type === "key"
    ) {

        inventory.key = true;

        addClue(
            "A chave possui o mesmo símbolo encontrado na entrada dos túneis."
        );

        activateMission(
            "Debaixo da cidade"
        );

        showItem(
            "key"
        );

    } else if (
        type === "coin"
    ) {

        inventory.coin = true;

        addClue(
            "A moeda tem o número 0 gravado no centro."
        );

        showItem(
            "coin"
        );
    }


    scene.remove(
        object
    );


    saveGame();

    currentInteractable = null;

    interactionHint.classList.add(
        "hidden"
    );
}


/* =========================================================
   INVENTÁRIO
========================================================= */

function openInventory() {

    if (
        mainMenu.classList.contains(
            "hidden"
        ) === false
    ) {
        return;
    }

    renderInventory();

    inventoryModal.classList.remove(
        "hidden"
    );
}


function renderInventory() {

    const grid =
        $("inventoryGrid");

    grid.innerHTML = "";


    const items = [

        {
            id: "ticket",
            name: "Bilhete impossível",
            icon: "🎫",
            description:
                "Um bilhete que não deveria existir."
        },

        {
            id: "flashlight",
            name: "Lanterna",
            icon: "🔦",
            description:
                "Sua principal fonte de luz."
        },

        {
            id: "key",
            name: "Chave antiga",
            icon: "🗝️",
            description:
                "Parece abrir alguma coisa nos túneis."
        },

        {
            id: "coin",
            name: "Moeda estranha",
            icon: "🪙",
            description:
                "Uma moeda marcada com o número 0."
        },

        {
            id: "hospitalCard",
            name: "Cartão hospitalar",
            icon: "🏥",
            description:
                "Um cartão ligado ao Hospital São Lucas."
        },

        {
            id: "conductorBadge",
            name: "Insígnia do condutor",
            icon: "🎖️",
            description:
                "Pertence ao funcionário do Último Trem."
        }
    ];


    for (const item of items) {

        if (
            !inventory[item.id]
        ) {
            continue;
        }


        const card =
            document.createElement(
                "div"
            );

        card.className =
            "inventory-card";


        card.innerHTML = `
            <div class="inventory-icon">
                ${item.icon}
            </div>

            <div>
                <h3>${item.name}</h3>
                <p>${item.description}</p>
            </div>
        `;


        card.addEventListener(
            "click",
            () => {

                showItem(
                    item.id
                );
            }
        );


        grid.appendChild(card);
    }
}


/* =========================================================
   MOSTRAR ITEM
========================================================= */

function showItem(id) {

    selectedItem = id;

    const content =
        $("itemContent");

    const visual =
        $("itemVisual");


    if (
        id === "ticket"
    ) {

        visual.innerHTML =
            `<div class="big-ticket">
                <strong>ÚLTIMO TREM</strong>
                <br>
                LINHA 0
                <br><br>
                00:00
                <br><br>
                SALA 0
            </div>`;

        content.innerHTML = `
            <h2>Bilhete impossível</h2>
            <p>
                Este bilhete parece antigo, mas está
                perfeitamente conservado.
                Ele indica uma viagem às 00:00,
                na Linha 0, com destino desconhecido.
            </p>
            <p>
                <strong>Como usar:</strong>
                examine o bilhete quando encontrar
                alguma pista relacionada à Sala 0.
            </p>
        `;

        $("useItemButton").textContent =
            "EXAMINAR BILHETE";


    } else if (
        id === "flashlight"
    ) {

        visual.innerHTML =
            `<div style="font-size:75px">🔦</div>`;

        content.innerHTML = `
            <h2>Lanterna</h2>
            <p>
                Uma lanterna resistente.
                Ela ilumina uma área grande ao redor
                de Yuri.
            </p>
            <p>
                <strong>Como usar:</strong>
                pressione F ou use o botão
                LANTERNA na tela.
            </p>
        `;

        $("useItemButton").textContent =
            flashlightOn
                ? "DESLIGAR LANTERNA"
                : "LIGAR LANTERNA";


    } else if (
        id === "key"
    ) {

        visual.innerHTML =
            `<div class="big-key"></div>`;

        content.innerHTML = `
            <h2>Chave antiga</h2>
            <p>
                Uma chave pesada, provavelmente usada
                em alguma porta antiga da estação.
            </p>
            <p>
                <strong>Como usar:</strong>
                ela será utilizada automaticamente
                quando Yuri encontrar uma fechadura
                compatível.
            </p>
        `;

        $("useItemButton").textContent =
            "EXAMINAR";


    } else if (
        id === "coin"
    ) {

        visual.innerHTML =
            `<div class="big-coin">0</div>`;

        content.innerHTML = `
            <h2>Moeda estranha</h2>
            <p>
                Uma moeda metálica com uma marca
                impossível no centro.
            </p>
            <p>
                <strong>Como usar:</strong>
                guarde-a. Algumas portas podem
                reconhecer o símbolo.
            </p>
        `;

        $("useItemButton").textContent =
            "EXAMINAR";


    } else {

        visual.innerHTML =
            `<div style="font-size:70px">🏥</div>`;

        content.innerHTML = `
            <h2>Cartão hospitalar</h2>
            <p>
                Um cartão ligado ao Hospital São Lucas.
            </p>
        `;

        $("useItemButton").textContent =
            "EXAMINAR";
    }


    itemModal.classList.remove(
        "hidden"
    );
}


/* =========================================================
   USAR ITEM
========================================================= */

function useSelectedItem() {

    if (
        selectedItem === "ticket"
    ) {

        showTicket();

    } else if (
        selectedItem === "flashlight"
    ) {

        toggleFlashlight();

        showItem(
            "flashlight"
        );

    } else {

        addClue(
            "Yuri examinou o objeto, mas ainda não sabe como utilizá-lo."
        );
    }
}


/* =========================================================
   BILHETE
========================================================= */

function showTicket() {

    itemModal.classList.add(
        "hidden"
    );

    ticketModal.classList.remove(
        "hidden"
    );
}


/* =========================================================
   LANTERNA
========================================================= */

function toggleFlashlight() {

    flashlightOn =
        !flashlightOn;


    if (
        flashlightOn
    ) {

        flashlight.intensity = 13;
        flashlightGlow.intensity = 2.2;

        $("flashlightButton")
            .classList.add(
                "active"
            );

    } else {

        flashlight.intensity = 0;
        flashlightGlow.intensity = 0;

        $("flashlightButton")
            .classList.remove(
                "active"
            );
    }
}


/* =========================================================
   DIÁLOGOS
========================================================= */

function talkTo(npc) {

    if (
        npc.name === "Olivia"
    ) {

        startDialogue(
            "Olivia",
            [
                "Você finalmente chegou.",
                "Eu estava começando a achar que o Último Trem tinha escolhido outra pessoa desta vez.",
                "Não tente entender a estação olhando apenas para o que está diante dos seus olhos.",
                "Aqui, algumas coisas aconteceram antes de acontecerem.",
                "E outras ainda estão esperando para acontecer.",
                "Você tem um bilhete, não tem?",
                "Então precisa descobrir o que significa a Sala 0."
            ]
        );


        npc.talked = true;

        completeMission(
            "A mulher na plataforma"
        );

        activateMission(
            "O bilhete impossível"
        );


    } else if (
        npc.name === "Condutor"
    ) {

        startDialogue(
            "Condutor",
            [
                "O trem chega à meia-noite.",
                "Sempre chegou.",
                "O problema é que esta linha foi fechada há muitos anos.",
                "Você quer saber para onde ele vai?",
                "Não é o destino que importa.",
                "É o que você traz consigo quando entra."
            ]
        );


        inventory.conductorBadge = true;

        addClue(
            "O Condutor conhece a história da Linha 0."
        );


    } else if (
        npc.name === "Kaio"
    ) {

        startDialogue(
            "Kaio",
            [
                "Meu nome é Kaio.",
                "Eu estava no hospital quando os relógios começaram a funcionar ao contrário.",
                "Depois disso, algumas pessoas começaram a aparecer em lugares onde nunca tinham estado.",
                "Os médicos chamaram de confusão.",
                "Mas eu vi o trem.",
                "Ele passou pelo hospital sem trilhos."
            ]
        );


        inventory.hospitalCard = true;

        completeMission(
            "Paciente 404"
        );

        activateMission(
            "Debaixo da cidade"
        );


    } else {

        startDialogue(
            "Senhora da Cidade Antiga",
            [
                "Você está procurando a Sala 0.",
                "Todo mundo que procura acaba encontrando.",
                "O problema é voltar.",
                "A cidade antiga guarda uma entrada.",
                "Mas somente aquilo que pertence à Linha 0 pode abri-la."
            ]
        );


        addClue(
            "A entrada da Sala 0 pode estar escondida sob a cidade."
        );
    }


    saveGame();
}


function startDialogue(
    name,
    messages
) {

    currentDialogue = {
        name,
        messages
    };

    dialogueIndex = 0;

    $("dialogueName")
        .textContent = name;

    $("dialogueAvatar")
        .textContent =
        name.charAt(0);

    dialogueModal.classList.remove(
        "hidden"
    );

    showDialogueText();
}


function showDialogueText() {

    clearTimeout(
        typingTimer
    );


    const text =
        currentDialogue.messages[
            dialogueIndex
        ];


    $("dialogueCounter")
        .textContent =
        `${dialogueIndex + 1} / ${currentDialogue.messages.length}`;


    const element =
        $("dialogueText");


    element.textContent = "";


    let i = 0;


    function type() {

        if (
            i >= text.length
        ) {
            return;
        }

        element.textContent +=
            text.charAt(i);

        i++;

        typingTimer =
            setTimeout(
                type,
                20
            );
    }


    type();
}


function nextDialogue() {

    if (
        !currentDialogue
    ) {
        return;
    }


    dialogueIndex++;


    if (
        dialogueIndex >=
        currentDialogue.messages.length
    ) {

        dialogueModal.classList.add(
            "hidden"
        );

        currentDialogue = null;

        return;
    }


    showDialogueText();
}


/* =========================================================
   MISSÕES
========================================================= */

function openMissions() {

    renderMissions();

    missionsModal.classList.remove(
        "hidden"
    );
}


function renderMissions() {

    const list =
        $("missionsList");

    list.innerHTML = "";


    for (const mission of missions) {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "mission-card";


        if (
            mission.active
        ) {
            card.classList.add(
                "active"
            );
        }

        if (
            mission.done
        ) {
            card.classList.add(
                "done"
            );
        }


        card.innerHTML = `
            <h3>
                ${mission.done ? "✓ " : ""}
                ${mission.title}
            </h3>

            <p>
                ${mission.description}
            </p>
        `;


        list.appendChild(card);
    }
}


function completeMission(title) {

    const mission =
        missions.find(
            m => m.title === title
        );

    if (
        mission
    ) {

        mission.done = true;
        mission.active = false;
    }

    updateObjective();
}


function activateMission(title) {

    const mission =
        missions.find(
            m => m.title === title
        );

    if (
        mission &&
        !mission.done
    ) {
        mission.active = true;
    }

    updateObjective();
}


function updateObjective() {

    const active =
        missions.find(
            m =>
                m.active &&
                !m.done
        );


    objectiveText.textContent =
        active
            ? active.description
            : "Explore a estação e descubra o próximo caminho.";
}


/* =========================================================
   PISTAS
========================================================= */

function addClue(text) {

    if (
        !clues.includes(text)
    ) {
        clues.push(text);
    }
}


/* =========================================================
   PUZZLE
========================================================= */

function openPuzzle() {

    $("puzzleTitle")
        .textContent =
        "TERMINAL DA LINHA 0";

    $("puzzleDescription")
        .textContent =
        "O terminal está desligado, mas uma luz vermelha pisca no canto. Na tela aparece apenas uma mensagem: 'PACIENTE 404'.";

    $("puzzleInput").value = "";

    $("puzzleMessage")
        .textContent = "";

    puzzleModal.classList.remove(
        "hidden"
    );
}


function solvePuzzle() {

    const input =
        $("puzzleInput")
            .value
            .trim();


    if (
        input === "0404"
    ) {

        $("puzzleMessage")
            .textContent =
            "ACESSO AUTORIZADO.";

        inventory.key = true;

        addClue(
            "O código 0404 abriu o acesso secreto."
        );

        activateMission(
            "Sala 0"
        );

        setTimeout(
            () => {

                puzzleModal.classList.add(
                    "hidden"
                );

                saveGame();

            },
            1000
        );

    } else {

        $("puzzleMessage")
            .textContent =
            "Código incorreto.";
    }
}


/* =========================================================
   LOCALIZAÇÃO
========================================================= */

function updateLocation() {

    const z =
        camera.position.z;


    let location =
        "ESTAÇÃO CENTRAL";


    if (
        z < -20 &&
        z > -45
    ) {
        location =
            "DISTRITO DA CHUVA";
    }


    if (
        z <= -45 &&
        z > -58
    ) {
        location =
            "PARQUE DAS LANTERNAS";
    }


    if (
        z <= -58 &&
        z > -68
    ) {
        location =
            "CIDADE ANTIGA";
    }


    if (
        z <= -68
    ) {
        location =
            "TÚNEIS";
    }


    locationName.textContent =
        location;

    currentLocation =
        location;
}


/* =========================================================
   RELÓGIO
========================================================= */

function updateGameClock(delta) {

    // Aproximadamente 1 minuto de jogo
    // a cada 12 segundos reais.

    gameTime.minute +=
        delta * 5;


    if (
        gameTime.minute >= 60
    ) {

        gameTime.minute -= 60;

        gameTime.hour++;

        if (
            gameTime.hour >= 24
        ) {
            gameTime.hour = 0;
        }
    }


    const h =
        String(
            Math.floor(
                gameTime.hour
            )
        ).padStart(2, "0");


    const m =
        String(
            Math.floor(
                gameTime.minute
            )
        ).padStart(2, "0");


    gameClock.textContent =
        `${h}:${m}`;
}


/* =========================================================
   SAVE
========================================================= */

function saveGame() {

    const data = {

        player,

        gameTime,

        inventory,

        clues,

        missions,

        position: {
            x: camera
                ? camera.position.x
                : 0,

            z: camera
                ? camera.position.z
                : 8
        }
    };


    localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(data)
    );
}


function loadGame() {

    const raw =
        localStorage.getItem(
            SAVE_KEY
        );


    if (
        !raw
    ) {
        return;
    }


    try {

        const data =
            JSON.parse(raw);


        player = {
            ...player,
            ...data.player
        };


        gameTime = {
            ...gameTime,
            ...data.gameTime
        };


        inventory = {
            ...inventory,
            ...data.inventory
        };


        clues =
            data.clues || [];


        if (
            data.missions
        ) {
            missions =
                data.missions;
        }


        if (
            data.position
        ) {

            player.x =
                data.position.x;

            player.z =
                data.position.z;
        }

    } catch (error) {

        console.error(
            "Erro ao carregar save:",
            error
        );
    }
}


function deleteSave() {

    const confirmed =
        confirm(
            "Tem certeza que deseja apagar todo o progresso?"
        );


    if (
        !confirmed
    ) {
        return;
    }


    localStorage.removeItem(
        SAVE_KEY
    );

    alert(
        "Progresso apagado."
    );
}


/* =========================================================
   FINAIS
========================================================= */

function showEnding(
    type
) {

    let title =
        "A VERDADE";

    let text =
        "Você descobriu parte da história, mas a estação ainda guarda respostas.";


    if (
        type === "secret"
    ) {

        title =
            "SALA 0";

        text =
            "A porta finalmente se abriu. Dentro dela não havia uma sala comum, mas o lugar onde o tempo da estação parecia começar e terminar ao mesmo tempo.";
    }


    if (
        type === "loop"
    ) {

        title =
            "O CICLO";

        text =
            "O relógio marcou 00:00 novamente. O trem chegou. E Yuri percebeu que talvez nunca tivesse realmente saído da estação.";
    }


    if (
        type === "truth"
    ) {

        title =
            "O ÚLTIMO TREM";

        text =
            "Agora você sabe o que aconteceu naquela noite. Mas descobrir a verdade não significa que a Linha 0 tenha terminado.";
    }


    if (
        type === "incomplete"
    ) {

        title =
            "PERDIDO";

        text =
            "A estação ficou para trás, mas muitas perguntas permaneceram sem resposta.";
    }


    $("endingTitle")
        .textContent = title;

    $("endingText")
        .textContent = text;

    endingModal.classList.remove(
        "hidden"
    );
}


/* =========================================================
   FECHAR MODAIS
========================================================= */

function closeAllModals() {

    document.querySelectorAll(
        ".modal"
    ).forEach(modal => {

        modal.classList.add(
            "hidden"
        );
    });
}


/* =========================================================
   ANIMAÇÃO
========================================================= */

function animate() {

    requestAnimationFrame(
        animate
    );


    const delta =
        Math.min(
            clock.getDelta(),
            .05
        );


    updateMovement(
        delta
    );


    updateLocation();

    updateGameClock(
        delta
    );

    findClosestInteraction();

    animateObjects(
        delta
    );


    renderer.render(
        scene,
        camera
    );


    // Autosave periódico

    if (
        Math.random() < .001
    ) {
        saveGame();
    }
}


/* =========================================================
   ANIMAÇÃO DE OBJETOS
========================================================= */

function animateObjects(delta) {

    const time =
        performance.now() * .001;


    for (
        const pickup of pickups
    ) {

        if (
            !pickup.parent
        ) {
            continue;
        }

        pickup.rotation.y +=
            delta * .8;

        pickup.position.y +=
            Math.sin(time * 2) *
            delta *
            .1;
    }


    for (
        const npc of npcs
    ) {

        if (
            npc.object
        ) {

            npc.object.position.y =
                Math.sin(
                    time * 1.5
                ) * .008;
        }
    }


    for (
        const object
        of environmentObjects
    ) {

        if (
            object.userData &&
            object.userData.isRain
        ) {

            const positions =
                object.geometry
                    .attributes
                    .position;

            for (
                let i = 0;
                i < positions.count;
                i++
            ) {

                let y =
                    positions.getY(i);

                y -=
                    delta * 14;

                if (
                    y < 0
                ) {
                    y = 20;
                }

                positions.setY(
                    i,
                    y
                );
            }

            positions.needsUpdate = true;
        }
    }
}


/* =========================================================
   RESIZE
========================================================= */

function onResize() {

    if (
        !camera ||
        !renderer
    ) {
        return;
    }


    camera.aspect =
        window.innerWidth /
        window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
}


/* =========================================================
   INÍCIO
========================================================= */

init();
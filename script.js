import * as THREE from "three";


/* =========================================================
   ÚLTIMO TREM
   SCRIPT PRINCIPAL
========================================================= */


/* =========================================================
   ELEMENTOS HTML
========================================================= */

const loadingScreen =
    document.getElementById("loadingScreen");

const loadingText =
    document.getElementById("loadingText");

const loadingProgress =
    document.getElementById("loadingProgress");

const menuScreen =
    document.getElementById("menuScreen");

const gameContainer =
    document.getElementById("gameContainer");

const hud =
    document.getElementById("hud");


/* =========================================================
   THREE.JS
========================================================= */

let scene;
let camera;
let renderer;


/* =========================================================
   JOGADOR
========================================================= */

const player = {

    x: 0,

    z: 14,

    y: 1.72,

    speed: 5.5,

    sprintSpeed: 9,

    health: 100,

    energy: 100

};


/* =========================================================
   CONTROLES
========================================================= */

const keys = {

    w: false,
    a: false,
    s: false,
    d: false,
    shift: false

};

let yaw = 0;
let pitch = 0;

let mouseLocked = false;


/* =========================================================
   LANTERNA
========================================================= */

let flashlight;

let flashlightGlow;

let flashlightOn = true;


/* =========================================================
   GAME STATE
========================================================= */

const state = {

    started: false,

    currentArea: "station",

    timeMinutes: 0,

    clues: 0,

    coins: 0,

    dialogueIndex: 0,

    currentDialogue: null,

    selectedItem: null,

    hasTicket: true,

    hasKey: false,

    hasCoin: false,

    hasMasterKey: false,

    metOlivia: false,

    metKaio: false,

    metConductor: false,

    talkedOldWoman: false,

    hospitalSolved: false,

    tunnelSolved: false,

    roomZeroReached: false,

    ticketRead: false,

    flashlightUsed: false,

    ending: false

};


/* =========================================================
   OBJETOS
========================================================= */

const inventory = [

    {
        id: "ticket",

        name: "Bilhete impossível",

        icon: "🎫",

        description:
            "Um bilhete antigo do metrô. A data impressa é impossível: 31/12/1999. No verso existe uma referência à Sala 0.",

        usable: true
    },

    {
        id: "flashlight",

        name: "Lanterna",

        icon: "🔦",

        description:
            "Uma lanterna encontrada na estação. Pressione F ou use o botão LANTERNA para ligá-la ou desligá-la.",

        usable: true
    },

    {
        id: "key",

        name: "Chave antiga",

        icon: "🔑",

        description:
            "Uma chave pesada e envelhecida. Parece pertencer a uma porta antiga da estação.",

        usable: true
    },

    {
        id: "coin",

        name: "Moeda estranha",

        icon: "🪙",

        description:
            "Uma moeda metálica com um símbolo circular gravado. O ano não pode ser identificado.",

        usable: true
    },

    {
        id: "masterkey",

        name: "Chave mestra",

        icon: "🗝️",

        description:
            "Uma chave maior encontrada depois de compreender parte do mistério.",

        usable: true
    },

    {
        id: "hospital",

        name: "Cartão do Hospital",

        icon: "🏥",

        description:
            "Cartão pertencente ao Hospital São Lucas. O número do paciente está parcialmente apagado.",

        usable: false
    },

    {
        id: "badge",

        name: "Insígnia do Condutor",

        icon: "🎖️",

        description:
            "Uma insígnia antiga usada por um condutor que deveria ter desaparecido há muitos anos.",

        usable: true
    }

];


/* =========================================================
   CORES
========================================================= */

const COLORS = {

    wall: 0x666a70,

    wallDark: 0x454950,

    floor: 0x5c6167,

    tile1: 0x6c7177,

    tile2: 0x595e64,

    metal: 0x969ba1,

    darkMetal: 0x363a40,

    wood: 0x705038,

    brass: 0xbda15f,

    white: 0xe9e7df,

    warm: 0xffdba0,

    red: 0x8f2b32,

    blue: 0x405978,

    green: 0x52634f,

    black: 0x15181c

};


/* =========================================================
   MATERIAIS
========================================================= */

function material(
    color,
    roughness = 0.8,
    metalness = 0
) {

    return new THREE.MeshStandardMaterial({

        color,

        roughness,

        metalness
    });
}


/* =========================================================
   OBJETOS GEOMÉTRICOS
========================================================= */

function box(
    width,
    height,
    depth,
    mat,
    x,
    y,
    z
) {

    const geometry =
        new THREE.BoxGeometry(
            width,
            height,
            depth
        );

    const mesh =
        new THREE.Mesh(
            geometry,
            mat
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


function cylinder(
    radius,
    height,
    mat,
    x,
    y,
    z,
    segments = 24
) {

    const geometry =
        new THREE.CylinderGeometry(
            radius,
            radius,
            height,
            segments
        );

    const mesh =
        new THREE.Mesh(
            geometry,
            mat
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
   INICIALIZAÇÃO
========================================================= */

function init() {

    loadingProgress.style.width = "20%";

    loadingText.textContent =
        "Criando a estação...";


    scene =
        new THREE.Scene();


    scene.background =
        new THREE.Color(
            0x252a31
        );


    scene.fog =
        new THREE.Fog(
            0x252a31,
            55,
            190
        );


    /* =====================================================
       CÂMERA
    ====================================================== */

    camera =
        new THREE.PerspectiveCamera(
            72,
            window.innerWidth /
            window.innerHeight,
            0.05,
            500
        );


    camera.position.set(
        player.x,
        player.y,
        player.z
    );


    scene.add(camera);


    /* =====================================================
       RENDERER
    ====================================================== */

    renderer =
        new THREE.WebGLRenderer({

            antialias: true,

            powerPreference:
                "high-performance"
        });


    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );


    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            2
        )
    );


    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;


    renderer.outputColorSpace =
        THREE.SRGBColorSpace;


    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;


    renderer.toneMappingExposure =
        1.9;


    gameContainer.appendChild(
        renderer.domElement
    );


    loadingProgress.style.width = "40%";

    loadingText.textContent =
        "Iluminando a plataforma...";


    createLights();


    loadingProgress.style.width = "55%";

    loadingText.textContent =
        "Construindo a estação...";


    createStation();


    loadingProgress.style.width = "70%";

    loadingText.textContent =
        "Preparando personagens...";


    createCharacters();


    loadingProgress.style.width = "82%";

    loadingText.textContent =
        "Colocando objetos...";


    createObjects();


    loadingProgress.style.width = "92%";

    loadingText.textContent =
        "Preparando a chuva...";


    createRain();


    loadingProgress.style.width = "100%";

    loadingText.textContent =
        "Estação pronta.";


    setTimeout(() => {

        loadingScreen.classList.add(
            "hidden"
        );

        menuScreen.classList.remove(
            "hidden"
        );

    }, 700);


    window.addEventListener(
        "resize",
        onResize
    );


    setupControls();

    setupButtons();

    updateHUD();

    animate();
}


/* =========================================================
   ILUMINAÇÃO
========================================================= */

function createLights() {

    /* =====================================================
       LUZ AMBIENTE
    ====================================================== */

    const hemisphere =
        new THREE.HemisphereLight(
            0xe6edff,
            0x555960,
            3.2
        );

    scene.add(hemisphere);


    const ambient =
        new THREE.AmbientLight(
            0xffffff,
            1.7
        );

    scene.add(ambient);


    /* =====================================================
       LUZ PRINCIPAL
    ====================================================== */

    const directional =
        new THREE.DirectionalLight(
            0xe9edff,
            2.5
        );

    directional.position.set(
        10,
        15,
        10
    );

    directional.castShadow = true;

    directional.shadow.mapSize.set(
        2048,
        2048
    );

    scene.add(
        directional
    );


    /* =====================================================
       LUZ CENTRAL
    ====================================================== */

    const centerLight =
        new THREE.PointLight(
            0xffe8c7,
            18,
            55,
            1.4
        );

    centerLight.position.set(
        0,
        6,
        -5
    );

    scene.add(
        centerLight
    );


    /* =====================================================
       LUZES DA ESTAÇÃO
    ====================================================== */

    const lightPositions = [

        [-22, 5.7, 12],
        [-11, 5.7, 12],
        [0, 5.7, 12],
        [11, 5.7, 12],
        [22, 5.7, 12],

        [-22, 5.7, -8],
        [-11, 5.7, -8],
        [0, 5.7, -8],
        [11, 5.7, -8],
        [22, 5.7, -8],

        [-22, 5.7, -30],
        [-11, 5.7, -30],
        [0, 5.7, -30],
        [11, 5.7, -30],
        [22, 5.7, -30],

        [-22, 5.7, -52],
        [-11, 5.7, -52],
        [0, 5.7, -52],
        [11, 5.7, -52],
        [22, 5.7, -52],

        [-22, 5.7, -74],
        [-11, 5.7, -74],
        [0, 5.7, -74],
        [11, 5.7, -74],
        [22, 5.7, -74]
    ];


    lightPositions.forEach(
        position => {

            const light =
                new THREE.PointLight(
                    0xffe6bf,
                    7,
                    24,
                    1.5
                );

            light.position.set(
                position[0],
                position[1],
                position[2]
            );

            scene.add(light);


            /* luminária */

            cylinder(
                0.18,
                0.15,

                material(
                    0xffffff,
                    .35
                ),

                position[0],
                8.85,
                position[2],

                20
            );
        }
    );


    /* =====================================================
       LANTERNA
    ====================================================== */

    flashlight =
        new THREE.SpotLight(
            0xfff4df,
            32,
            85,
            Math.PI / 4.5,
            .38,
            1
        );


    flashlight.position.set(
        .18,
        -.15,
        -.25
    );


    flashlight.castShadow = true;


    flashlight.shadow.mapSize.width =
        2048;

    flashlight.shadow.mapSize.height =
        2048;


    flashlight.shadow.camera.near =
        .1;

    flashlight.shadow.camera.far =
        90;


    flashlight.target.position.set(
        0,
        -.15,
        -14
    );


    camera.add(
        flashlight
    );

    camera.add(
        flashlight.target
    );


    /* =====================================================
       BRILHO DA LANTERNA
    ====================================================== */

    flashlightGlow =
        new THREE.PointLight(
            0xffe9ca,
            6,
            15,
            1.4
        );


    flashlightGlow.position.set(
        0,
        -.3,
        -1
    );


    camera.add(
        flashlightGlow
    );
}


/* =========================================================
   ESTAÇÃO
========================================================= */

function createStation() {

    /* =====================================================
       PISO PRINCIPAL
    ====================================================== */

    box(
        59,
        .2,
        100,

        material(
            COLORS.floor,
            .9
        ),

        0,
        -.1,
        -30
    );


    /* =====================================================
       PISO EM TILES
    ====================================================== */

    for (
        let x = -28;
        x <= 28;
        x += 4
    ) {

        for (
            let z = 16;
            z >= -76;
            z -= 4
        ) {

            const checker =
                (
                    Math.floor(x / 4) +
                    Math.floor(z / 4)
                ) % 2;


            box(
                3.85,
                .04,
                3.85,

                material(
                    checker === 0
                        ? COLORS.tile1
                        : COLORS.tile2,

                    .88
                ),

                x,
                .03,
                z
            );
        }
    }


    /* =====================================================
       PAREDES
    ====================================================== */

    box(
        .7,
        9,
        110,

        material(
            COLORS.wall,
            .9
        ),

        -30,
        4.5,
        -30
    );


    box(
        .7,
        9,
        110,

        material(
            COLORS.wall,
            .9
        ),

        30,
        4.5,
        -30
    );


    /* =====================================================
       TETO
    ====================================================== */

    box(
        61,
        .4,
        110,

        material(
            COLORS.wallDark,
            .85
        ),

        0,
        9,
        -30
    );


    /* =====================================================
       COLUNAS
    ====================================================== */

    for (
        let z = 13;
        z >= -76;
        z -= 11
    ) {

        createColumn(
            -22,
            z
        );

        createColumn(
            22,
            z
        );
    }


    /* =====================================================
       TRILHOS
    ====================================================== */

    createTracks();


    /* =====================================================
       LINHA DE SEGURANÇA
    ====================================================== */

    box(
        57,
        .07,
        .8,

        material(
            0xd5b94d,
            .8
        ),

        0,
        .08,
        -4.8
    );


    /* =====================================================
       BANCOS
    ====================================================== */

    for (
        let z = 8;
        z >= -70;
        z -= 15
    ) {

        createBench(
            -13,
            z
        );

        createBench(
            13,
            z - 6
        );
    }


    /* =====================================================
       POSTES
    ====================================================== */

    for (
        let z = 8;
        z >= -70;
        z -= 16
    ) {

        createLampPost(
            -7,
            z
        );

        createLampPost(
            7,
            z - 8
        );
    }


    /* =====================================================
       PLACAS
    ====================================================== */

    createStationSign(
        "ESTAÇÃO CENTRAL",
        0,
        4.8,
        5
    );


    createStationSign(
        "PLATAFORMA 01",
        -20,
        3.5,
        -18
    );


    createStationSign(
        "PLATAFORMA 02",
        20,
        3.5,
        -38
    );


    createStationSign(
        "ÚLTIMO TREM",
        0,
        4.5,
        -72
    );


    /* =====================================================
       RELÓGIO
    ====================================================== */

    createClock(
        0,
        6,
        -1
    );


    /* =====================================================
       PORTA PARA SALA 0
    ====================================================== */

    createRoomZeroDoor();


    /* =====================================================
       TREM
    ====================================================== */

    createTrain(
        0,
        1.8,
        -75
    );
}


/* =========================================================
   COLUNA
========================================================= */

function createColumn(
    x,
    z
) {

    box(
        1.4,
        7,
        1.4,

        material(
            COLORS.metal,
            .7,
            .25
        ),

        x,
        3.5,
        z
    );


    box(
        2.1,
        .35,
        2.1,

        material(
            COLORS.darkMetal,
            .65,
            .35
        ),

        x,
        7.1,
        z
    );


    box(
        1.9,
        .25,
        1.9,

        material(
            COLORS.brass,
            .4,
            .45
        ),

        x,
        .15,
        z
    );
}


/* =========================================================
   BANCO
========================================================= */

function createBench(
    x,
    z
) {

    const wood =
        material(
            COLORS.wood,
            .78
        );


    const metal =
        material(
            COLORS.darkMetal,
            .55,
            .4
        );


    box(
        3.8,
        .25,
        .75,
        wood,
        x,
        1.15,
        z
    );


    box(
        3.8,
        .18,
        .7,
        wood,
        x,
        1.65,
        z + .12
    );


    [-1.4, 1.4].forEach(
        dx => {

            box(
                .18,
                1.1,
                .5,
                metal,

                x + dx,
                .55,
                z
            );
        }
    );
}


/* =========================================================
   POSTE
========================================================= */

function createLampPost(
    x,
    z
) {

    const pole =
        material(
            COLORS.darkMetal,
            .5,
            .45
        );


    cylinder(
        .12,
        5.5,
        pole,
        x,
        2.75,
        z
    );


    box(
        1.2,
        .18,
        .45,

        pole,

        x,
        5.45,
        z
    );


    const lamp =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                .23,
                20,
                12
            ),

            new THREE.MeshStandardMaterial({

                color:
                    COLORS.warm,

                emissive:
                    COLORS.warm,

                emissiveIntensity:
                    2.2,

                roughness:
                    .25
            })
        );


    lamp.position.set(
        x,
        5.65,
        z
    );


    scene.add(lamp);


    const light =
        new THREE.PointLight(
            COLORS.warm,
            5,
            18,
            1.5
        );


    light.position.set(
        x,
        5.6,
        z
    );


    scene.add(light);
}


/* =========================================================
   PLACAS
========================================================= */

function createStationSign(
    text,
    x,
    y,
    z
) {

    const board =
        box(
            6,
            1.3,
            .15,

            material(
                0x24282e,
                .65,
                .15
            ),

            x,
            y,
            z
        );


    board.userData.signText =
        text;
}


/* =========================================================
   RELÓGIO
========================================================= */

function createClock(
    x,
    y,
    z
) {

    const frame =
        cylinder(
            1.15,
            .22,

            material(
                0x282c31,
                .55,
                .4
            ),

            x,
            y,
            z,

            40
        );


    frame.rotation.x =
        Math.PI / 2;


    const face =
        cylinder(
            .95,
            .05,

            material(
                0xe1e0d9,
                .5
            ),

            x,
            y,
            z - .13,

            40
        );


    face.rotation.x =
        Math.PI / 2;
}


/* =========================================================
   TRILHOS
========================================================= */

function createTracks() {

    const railMaterial =
        material(
            0x555a60,
            .42,
            .8
        );


    [-4.8, -2.5].forEach(
        x => {

            box(
                .18,
                .12,
                100,

                railMaterial,

                x,
                .13,
                -30
            );
        }
    );


    for (
        let z = 16;
        z >= -78;
        z -= 1.2
    ) {

        box(
            8,
            .08,
            .16,

            material(
                0x474b50,
                .7,
                .3
            ),

            -3.65,
            .1,
            z
        );
    }
}


/* =========================================================
   PORTA SALA 0
========================================================= */

function createRoomZeroDoor() {

    box(
        6,
        5,
        .5,

        material(
            0x262a30,
            .5,
            .4
        ),

        0,
        2.5,
        -66
    );


    box(
        4.8,
        3.8,
        .08,

        material(
            0x101216,
            .35,
            .1
        ),

        0,
        2.1,
        -65.7
    );


    createStationSign(
        "SALA 0",
        0,
        5.3,
        -65.5
    );
}


/* =========================================================
   TREM
========================================================= */

function createTrain(
    x,
    y,
    z
) {

    const train =
        new THREE.Group();


    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                11,
                4.2,
                8
            ),

            material(
                0x4b5057,
                .5,
                .4
            )
        );


    body.position.y = 2.4;

    train.add(body);


    const front =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                10.5,
                3.6,
                .4
            ),

            material(
                0x22262b,
                .4,
                .6
            )
        );


    front.position.set(
        0,
        2.5,
        -4.1
    );


    train.add(front);


    /* janelas */

    for (
        let i = -3.5;
        i <= 3.5;
        i += 1.75
    ) {

        box(
            1.35,
            1.1,
            .12,

            material(
                0x1b3448,
                .25,
                .45
            ),

            i,
            3,
            z - 4.13
        );
    }


    /* luzes frontais */

    [-2.6, 2.6].forEach(
        dx => {

            const lamp =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        .25,
                        16,
                        10
                    ),

                    new THREE.MeshStandardMaterial({

                        color:
                            0xfff2c4,

                        emissive:
                            0xffe4a0,

                        emissiveIntensity:
                            4
                    })
                );


            lamp.position.set(
                dx,
                2,
                z - 4.35
            );


            scene.add(lamp);
        }
    );


    train.position.set(
        x,
        y,
        z
    );


    scene.add(train);


    train.userData.isTrain = true;

    train.userData.interact =
        true;
}


/* =========================================================
   PERSONAGENS
========================================================= */

const characters = [];


function createCharacters() {

    createHuman(
        "Olivia",
        7,
        1,
        -8,
        0x6e516f,
        0x2d2029
    );


    createHuman(
        "Kaio",
        -13,
        1,
        -35,
        0x53657d,
        0x292d34
    );


    createHuman(
        "Condutor",
        5,
        1,
        -72,
        0x30343b,
        0x17191c
    );


    createHuman(
        "Senhora",
        -10,
        1,
        -55,
        0x5e665b,
        0x45423e
    );
}


/* =========================================================
   PERSONAGEM HUMANO
========================================================= */

function createHuman(
    name,
    x,
    y,
    z,
    shirtColor,
    pantsColor
) {

    const group =
        new THREE.Group();


    /* pernas */

    const legMaterial =
        material(
            pantsColor,
            .85
        );


    [-.18, .18].forEach(
        lx => {

            const leg =
                new THREE.Mesh(
                    new THREE.CylinderGeometry(
                        .15,
                        .17,
                        .9,
                        12
                    ),

                    legMaterial
                );


            leg.position.set(
                lx,
                .95,
                0
            );


            leg.castShadow = true;

            group.add(leg);


            const shoe =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        .3,
                        .15,
                        .5
                    ),

                    material(
                        0x191a1d,
                        .8
                    )
                );


            shoe.position.set(
                lx,
                .48,
                -.08
            );


            shoe.castShadow = true;

            group.add(shoe);
        }
    );


    /* corpo */

    const torso =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                .43,
                .5,
                1.15,
                16
            ),

            material(
                shirtColor,
                .78
            )
        );


    torso.position.y =
        1.8;


    torso.castShadow = true;

    group.add(torso);


    /* pescoço */

    const neck =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                .13,
                .15,
                .18,
                12
            ),

            material(
                0xc79572,
                .9
            )
        );


    neck.position.y =
        2.43;

    group.add(neck);


    /* cabeça */

    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                .4,
                24,
                18
            ),

            material(
                0xc79572,
                .9
            )
        );


    head.scale.set(
        .9,
        1.08,
        .9
    );


    head.position.y =
        2.78;


    head.castShadow = true;

    group.add(head);


    /* cabelo */

    const hair =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                .42,
                24,
                16
            ),

            material(
                0x282126,
                .95
            )
        );


    hair.scale.set(
        .96,
        .55,
        .96
    );


    hair.position.set(
        0,
        3.04,
        .01
    );


    group.add(hair);


    /* olhos */

    const eyeMaterial =
        new THREE.MeshBasicMaterial({
            color: 0x171717
        });


    [-.14, .14].forEach(
        ex => {

            const eye =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        .045,
                        8,
                        8
                    ),

                    eyeMaterial
                );


            eye.position.set(
                ex,
                2.82,
                -.36
            );


            group.add(eye);
        }
    );


    /* braços */

    const armMaterial =
        material(
            shirtColor,
            .78
        );


    [-.56, .56].forEach(
        ax => {

            const arm =
                new THREE.Mesh(
                    new THREE.CylinderGeometry(
                        .11,
                        .13,
                        1,
                        12
                    ),

                    armMaterial
                );


            arm.position.set(
                ax,
                1.82,
                0
            );


            arm.rotation.z =
                ax > 0
                    ? -.08
                    : .08;


            arm.castShadow = true;

            group.add(arm);
        }
    );


    group.position.set(
        x,
        y,
        z
    );


    scene.add(group);


    group.userData.character =
        name;


    group.userData.interact =
        true;


    characters.push(group);
}


/* =========================================================
   OBJETOS
========================================================= */

function createObjects() {

    createTicketObject(
        -2,
        .25,
        8
    );


    createKeyObject(
        9,
        .45,
        -16
    );


    createCoinObject(
        -8,
        .25,
        -35
    );


    createHospitalCard(
        -13,
        .35,
        -35
    );
}


/* =========================================================
   BILHETE 3D
========================================================= */

function createTicketObject(
    x,
    y,
    z
) {

    const group =
        new THREE.Group();


    const paper =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.3,
                .04,
                .65
            ),

            material(
                0xe0cf9e,
                .9
            )
        );


    group.add(paper);


    const stripe =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.15,
                .012,
                .09
            ),

            material(
                0x25231f,
                .7
            )
        );


    stripe.position.y =
        .03;


    stripe.position.z =
        -.14;


    group.add(stripe);


    const number =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .35,
                .012,
                .06
            ),

            material(
                0x8b252b,
                .7
            )
        );


    number.position.set(
        -.3,
        .031,
        .08
    );


    group.add(number);


    group.position.set(
        x,
        y,
        z
    );


    group.rotation.y =
        .3;


    scene.add(group);


    group.userData.objectId =
        "ticket";


    group.userData.interact =
        true;
}


/* =========================================================
   CHAVE
========================================================= */

function createKeyObject(
    x,
    y,
    z
) {

    const group =
        new THREE.Group();


    const keyMaterial =
        material(
            COLORS.brass,
            .35,
            .8
        );


    const ring =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                .22,
                .07,
                10,
                24
            ),

            keyMaterial
        );


    ring.rotation.x =
        Math.PI / 2;


    group.add(ring);


    const shaft =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .75,
                .09,
                .1
            ),

            keyMaterial
        );


    shaft.position.x =
        .45;


    group.add(shaft);


    const teeth =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .3,
                .18,
                .1
            ),

            keyMaterial
        );


    teeth.position.x =
        .8;


    group.add(teeth);


    group.position.set(
        x,
        y,
        z
    );


    group.rotation.y =
        -.5;


    scene.add(group);


    group.userData.objectId =
        "key";


    group.userData.interact =
        true;
}


/* =========================================================
   MOEDA
========================================================= */

function createCoinObject(
    x,
    y,
    z
) {

    const group =
        new THREE.Group();


    const coinMaterial =
        material(
            0xa88b4e,
            .3,
            .8
        );


    const coin =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                .3,
                .3,
                .08,
                32
            ),

            coinMaterial
        );


    coin.rotation.x =
        Math.PI / 2;


    group.add(coin);


    const symbol =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                .12,
                .025,
                8,
                20
            ),

            material(
                0x5b4823,
                .5,
                .6
            )
        );


    symbol.rotation.x =
        Math.PI / 2;


    symbol.position.z =
        -.05;


    group.add(symbol);


    group.position.set(
        x,
        y,
        z
    );


    scene.add(group);


    group.userData.objectId =
        "coin";


    group.userData.interact =
        true;
}


/* =========================================================
   CARTÃO DO HOSPITAL
========================================================= */

function createHospitalCard(
    x,
    y,
    z
) {

    const card =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.2,
                .035,
                .7
            ),

            material(
                0xe4e6e1,
                .75
            )
        );


    card.position.set(
        x,
        y,
        z
    );


    card.rotation.y =
        .2;


    scene.add(card);


    card.userData.objectId =
        "hospital";


    card.userData.interact =
        true;
}


/* =========================================================
   CHUVA
========================================================= */

function createRain() {

    const count = 350;


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
            (Math.random() - .5) * 80;

        positions[i * 3 + 1] =
            Math.random() * 35;

        positions[i * 3 + 2] =
            -80 +
            Math.random() * 100;
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

            color:
                0xaeb9c9,

            size:
                .025,

            transparent:
                true,

            opacity:
                .18,

            depthWrite:
                false
        });


    const rain =
        new THREE.Points(
            geometry,
            materialRain
        );


    scene.add(rain);
}


/* =========================================================
   CONTROLES
========================================================= */

function setupControls() {

    window.addEventListener(
        "keydown",
        event => {

            const key =
                event.key.toLowerCase();


            if (key === "w")
                keys.w = true;

            if (key === "a")
                keys.a = true;

            if (key === "s")
                keys.s = true;

            if (key === "d")
                keys.d = true;

            if (key === "shift")
                keys.shift = true;


            if (
                key === "f" &&
                state.started
            ) {

                toggleFlashlight();
            }


            if (
                key === "e" &&
                state.started
            ) {

                interact();
            }


            if (
                key === "i" &&
                state.started
            ) {

                toggleModal(
                    "inventoryModal"
                );
            }


            if (
                key === "m" &&
                state.started
            ) {

                toggleModal(
                    "missionsModal"
                );
            }
        }
    );


    window.addEventListener(
        "keyup",
        event => {

            const key =
                event.key.toLowerCase();


            if (key === "w")
                keys.w = false;

            if (key === "a")
                keys.a = false;

            if (key === "s")
                keys.s = false;

            if (key === "d")
                keys.d = false;

            if (key === "shift")
                keys.shift = false;
        }
    );


    renderer.domElement.addEventListener(
        "click",
        () => {

            if (
                state.started &&
                !anyModalOpen()
            ) {

                renderer.domElement.requestPointerLock();
            }
        }
    );


    document.addEventListener(
        "pointerlockchange",
        () => {

            mouseLocked =
                document.pointerLockElement ===
                renderer.domElement;
        }
    );


    document.addEventListener(
        "mousemove",
        event => {

            if (!mouseLocked)
                return;


            yaw -=
                event.movementX *
                .0022;


            pitch -=
                event.movementY *
                .0022;


            pitch =
                Math.max(
                    -1.45,
                    Math.min(
                        1.45,
                        pitch
                    )
                );


            camera.rotation.order =
                "YXZ";


            camera.rotation.y =
                yaw;


            camera.rotation.x =
                pitch;
        }
    );
}


/* =========================================================
   BOTÕES
========================================================= */

function setupButtons() {

    document
        .getElementById("newGameBtn")
        .addEventListener(
            "click",
            startNewGame
        );


    document
        .getElementById("continueBtn")
        .addEventListener(
            "click",
            continueGame
        );


    document
        .getElementById("deleteSaveBtn")
        .addEventListener(
            "click",
            deleteSave
        );


    document
        .getElementById("flashlightButton")
        .addEventListener(
            "click",
            toggleFlashlight
        );


    document
        .getElementById("inventoryButton")
        .addEventListener(
            "click",
            () =>
                toggleModal(
                    "inventoryModal"
                )
        );


    document
        .getElementById("missionsButton")
        .addEventListener(
            "click",
            () =>
                toggleModal(
                    "missionsModal"
                )
        );


    document
        .getElementById("closeInventory")
        .addEventListener(
            "click",
            () =>
                closeModal(
                    "inventoryModal"
                )
        );


    document
        .getElementById("closeMissions")
        .addEventListener(
            "click",
            () =>
                closeModal(
                    "missionsModal"
                )
        );


    document
        .getElementById("closeItem")
        .addEventListener(
            "click",
            () =>
                closeModal(
                    "itemModal"
                )
        );


    document
        .getElementById("closeItemBottom")
        .addEventListener(
            "click",
            () =>
                closeModal(
                    "itemModal"
                )
        );


    document
        .getElementById("closeTicket")
        .addEventListener(
            "click",
            () =>
                closeModal(
                    "ticketModal"
                )
        );


    document
        .getElementById("closeTicketBottom")
        .addEventListener(
            "click",
            () =>
                closeModal(
                    "ticketModal"
                )
        );


    document
        .getElementById("closePuzzle")
        .addEventListener(
            "click",
            () =>
                closeModal(
                    "puzzleModal"
                )
        );


    document
        .getElementById("closeTrain")
        .addEventListener(
            "click",
            () =>
                closeModal(
                    "trainModal"
                )
        );


    document
        .getElementById("dialogueNext")
        .addEventListener(
            "click",
            nextDialogue
        );


    document
        .getElementById("useItemButton")
        .addEventListener(
            "click",
            useSelectedItem
        );


    document
        .getElementById("puzzleSubmit")
        .addEventListener(
            "click",
            solvePuzzle
        );


    document
        .getElementById("endingRestart")
        .addEventListener(
            "click",
            () => {

                closeModal(
                    "endingModal"
                );

                startNewGame();
            }
        );


    document
        .querySelectorAll(
            ".train-destinations button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        travelTo(
                            button.dataset.destination
                        );
                    }
                );
            }
        );


    setupMobileControls();
}


/* =========================================================
   NOVO JOGO
========================================================= */

function startNewGame() {

    localStorage.removeItem(
        "ultimoTremSave"
    );


    resetState();


    state.started = true;


    menuScreen.classList.add(
        "hidden"
    );


    gameContainer.classList.remove(
        "hidden"
    );


    hud.classList.remove(
        "hidden"
    );


    player.x = 0;
    player.z = 14;


    camera.position.set(
        0,
        1.72,
        14
    );


    yaw = 0;
    pitch = 0;


    camera.rotation.set(
        0,
        0,
        0
    );


    updateHUD();


    showDialogue(
        "Yuri",
        "👤",
        [
            "Onde eu estou...?",
            "Eu lembro da cidade. Lembro de estar voltando para casa.",
            "Mas não lembro de ter entrado nesta estação.",
            "O relógio está marcando meia-noite... e não há ninguém aqui.",
            "Preciso descobrir o que aconteceu."
        ]
    );


    saveGame();
}


/* =========================================================
   RESET
========================================================= */

function resetState() {

    state.currentArea =
        "station";

    state.timeMinutes =
        0;

    state.clues =
        0;

    state.coins =
        0;

    state.hasTicket =
        true;

    state.hasKey =
        false;

    state.hasCoin =
        false;

    state.hasMasterKey =
        false;

    state.metOlivia =
        false;

    state.metKaio =
        false;

    state.metConductor =
        false;

    state.talkedOldWoman =
        false;

    state.hospitalSolved =
        false;

    state.tunnelSolved =
        false;

    state.roomZeroReached =
        false;

    state.ticketRead =
        false;

    state.flashlightUsed =
        false;

    state.ending =
        false;


    player.health =
        100;

    player.energy =
        100;


    flashlightOn =
        true;

    flashlight.visible =
        true;

    flashlightGlow.visible =
        true;
}


/* =========================================================
   CONTINUAR
========================================================= */

function continueGame() {

    const saved =
        localStorage.getItem(
            "ultimoTremSave"
        );


    if (!saved) {

        startNewGame();

        return;
    }


    try {

        const data =
            JSON.parse(saved);


        Object.assign(
            state,
            data.state
        );


        Object.assign(
            player,
            data.player
        );


        state.started =
            true;


        menuScreen.classList.add(
            "hidden"
        );


        gameContainer.classList.remove(
            "hidden"
        );


        hud.classList.remove(
            "hidden"
        );


        camera.position.set(
            player.x,
            player.y,
            player.z
        );


        updateHUD();


    } catch {

        startNewGame();
    }
}


/* =========================================================
   APAGAR SAVE
========================================================= */

function deleteSave() {

    localStorage.removeItem(
        "ultimoTremSave"
    );


    alert(
        "O progresso foi apagado."
    );
}


/* =========================================================
   SALVAR
========================================================= */

function saveGame() {

    localStorage.setItem(
        "ultimoTremSave",

        JSON.stringify({

            state,

            player: {

                x: player.x,

                z: player.z,

                health:
                    player.health,

                energy:
                    player.energy,

                y:
                    player.y
            }
        })
    );
}


/* =========================================================
   LANTERNA
========================================================= */

function toggleFlashlight() {

    flashlightOn =
        !flashlightOn;


    flashlight.visible =
        flashlightOn;


    flashlightGlow.visible =
        flashlightOn;


    state.flashlightUsed =
        true;


    const button =
        document.getElementById(
            "flashlightButton"
        );


    button.style.borderColor =
        flashlightOn
            ? "rgba(210,180,240,.55)"
            : "rgba(255,255,255,.13)";


    button.querySelector(
        "span"
    ).textContent =
        flashlightOn
            ? "LANTERNA ON"
            : "LANTERNA OFF";


    saveGame();
}


/* =========================================================
   INTERAÇÃO
========================================================= */

function interact() {

    const target =
        findInteractionTarget();


    if (!target) {

        return;
    }


    if (
        target.userData.character
    ) {

        interactCharacter(
            target.userData.character
        );

        return;
    }


    if (
        target.userData.objectId
    ) {

        interactObject(
            target.userData.objectId
        );

        return;
    }


    if (
        target.userData.isTrain
    ) {

        openTrain();

        return;
    }
}


/* =========================================================
   ENCONTRAR OBJETO
========================================================= */

function findInteractionTarget() {

    const raycaster =
        new THREE.Raycaster();


    raycaster.setFromCamera(
        new THREE.Vector2(0, 0),
        camera
    );


    const objects =
        [];


    scene.traverse(
        object => {

            if (
                object.userData &&
                object.userData.interact
            ) {

                objects.push(
                    object
                );
            }
        }
    );


    const hits =
        raycaster.intersectObjects(
            objects,
            true
        );


    if (
        hits.length === 0
    ) {

        return null;
    }


    if (
        hits[0].distance > 5
    ) {

        return null;
    }


    let object =
        hits[0].object;


    while (
        object.parent &&
        !object.userData.interact
    ) {

        object =
            object.parent;
    }


    return object;
}


/* =========================================================
   PERSONAGENS
========================================================= */

function interactCharacter(
    name
) {

    if (name === "Olivia") {

        state.metOlivia =
            true;


        state.clues++;


        showDialogue(
            "Olivia",
            "👩",
            [
                "Você finalmente chegou.",
                "Yuri... não é?",
                "Não faça essa cara. Eu sei que você não se lembra de mim.",
                "Mas eu lembro de você.",
                "Esta estação foi fechada há muitos anos.",
                "O problema é que, de tempos em tempos, o Último Trem continua chegando.",
                "Se quiser entender o que está acontecendo, procure o bilhete vermelho.",
                "E não confie no relógio."
            ]
        );


        updateObjective(
            "Encontre o bilhete vermelho e descubra por que Olivia conhece Yuri."
        );


        saveGame();

        return;
    }


    if (name === "Kaio") {

        state.metKaio =
            true;


        state.clues++;


        showDialogue(
            "Kaio",
            "👨",
            [
                "Você também está preso aqui?",
                "Meu nome é Kaio.",
                "Disseram que eu era o Paciente 404.",
                "Mas quando procurei meu prontuário, encontrei datas que ainda não aconteceram.",
                "Existe um terminal no hospital.",
                "O código é 0404.",
                "Depois que você descobrir o que há lá, talvez entenda por que o trem nunca para de voltar."
            ]
        );


        updateObjective(
            "Descubra o que aconteceu com o Paciente 404."
        );


        saveGame();

        return;
    }


    if (name === "Condutor") {

        state.metConductor =
            true;


        state.clues++;


        showDialogue(
            "Condutor",
            "🚉",
            [
                "Passageiros não deveriam estar nesta plataforma.",
                "Principalmente você.",
                "Esse trem não pertence mais ao horário normal.",
                "Ele passa exatamente à meia-noite.",
                "Sempre leva alguém para um lugar diferente.",
                "Se encontrar a Sala 0, não entre sem a chave mestra.",
                "E lembre-se: o trem sempre retorna."
            ]
        );


        updateObjective(
            "Encontre a Chave Mestra e descubra a entrada da Sala 0."
        );


        saveGame();

        return;
    }


    if (name === "Senhora") {

        state.talkedOldWoman =
            true;


        state.clues++;


        showDialogue(
            "Senhora da Cidade Antiga",
            "👵",
            [
                "Eu vi a primeira vez que aquele trem passou.",
                "Foi antes de você nascer.",
                "A cidade mudou desde então.",
                "Mas aquela estação continuou igual.",
                "Se você encontrou uma moeda estranha, guarde-a.",
                "Ela pertence a quem passou pelo trem antes de você.",
                "Algumas coisas precisam ser lembradas para que o ciclo termine."
            ]
        );


        updateObjective(
            "Descubra a origem da moeda estranha."
        );


        saveGame();
    }
}


/* =========================================================
   OBJETOS
========================================================= */

function interactObject(
    id
) {

    if (id === "ticket") {

        state.ticketRead =
            true;


        showTicket();


        updateObjective(
            "Descubra o significado da Sala 0."
        );


        saveGame();

        return;
    }


    if (id === "key") {

        state.hasKey =
            true;


        state.clues++;


        showDialogue(
            "Yuri",
            "👤",
            [
                "Uma chave antiga.",
                "Parece pesada demais para uma porta comum.",
                "Talvez pertença a alguma área que foi trancada quando a estação fechou."
            ]
        );


        updateObjective(
            "Encontre a porta que pode ser aberta com a chave."
        );


        saveGame();

        return;
    }


    if (id === "coin") {

        state.hasCoin =
            true;


        state.coins++;


        state.clues++;


        showDialogue(
            "Yuri",
            "👤",
            [
                "Uma moeda...",
                "Tem um símbolo gravado no centro.",
                "Eu já vi esse símbolo antes.",
                "No bilhete."
            ]
        );


        updateObjective(
            "Descubra a relação entre a moeda e o bilhete."
        );


        saveGame();

        return;
    }


    if (id === "hospital") {

        showDialogue(
            "Yuri",
            "👤",
            [
                "Um cartão do Hospital São Lucas.",
                "O número 404 ainda pode ser lido.",
                "Talvez Kaio esteja relacionado a isso."
            ]
        );


        updateObjective(
            "Leve as pistas até o Hospital São Lucas."
        );


        saveGame();
    }
}


/* =========================================================
   DIÁLOGO
========================================================= */

function showDialogue(
    name,
    avatar,
    lines
) {

    state.currentDialogue = {

        name,

        avatar,

        lines
    };


    state.dialogueIndex =
        0;


    document
        .getElementById(
            "dialogueModal"
        )
        .classList.remove(
            "hidden"
        );


    updateDialogue();
}


function updateDialogue() {

    const dialogue =
        state.currentDialogue;


    if (!dialogue)
        return;


    document
        .getElementById(
            "dialogueName"
        )
        .textContent =
        dialogue.name;


    document
        .getElementById(
            "dialogueAvatar"
        )
        .textContent =
        dialogue.avatar;


    document
        .getElementById(
            "dialogueText"
        )
        .textContent =
        dialogue.lines[
            state.dialogueIndex
        ];


    document
        .getElementById(
            "dialogueProgress"
        )
        .textContent =
        `${state.dialogueIndex + 1} / ${dialogue.lines.length}`;


    const button =
        document.getElementById(
            "dialogueNext"
        );


    button.textContent =
        state.dialogueIndex ===
        dialogue.lines.length - 1
            ? "FECHAR"
            : "CONTINUAR";
}


function nextDialogue() {

    const dialogue =
        state.currentDialogue;


    if (!dialogue)
        return;


    if (
        state.dialogueIndex <
        dialogue.lines.length - 1
    ) {

        state.dialogueIndex++;

        updateDialogue();

        return;
    }


    closeModal(
        "dialogueModal"
    );


    state.currentDialogue =
        null;


    saveGame();
}


/* =========================================================
   INVENTÁRIO
========================================================= */

function openInventory() {

    const list =
        document.getElementById(
            "inventoryList"
        );


    list.innerHTML = "";


    const owned =
        inventory.filter(
            item => {

                if (
                    item.id === "ticket"
                )
                    return state.hasTicket;

                if (
                    item.id === "key"
                )
                    return state.hasKey;

                if (
                    item.id === "coin"
                )
                    return state.hasCoin;

                if (
                    item.id === "masterkey"
                )
                    return state.hasMasterKey;

                if (
                    item.id === "hospital"
                )
                    return state.metKaio;

                if (
                    item.id === "badge"
                )
                    return state.metConductor;

                if (
                    item.id === "flashlight"
                )
                    return true;

                return false;
            }
        );


    if (
        owned.length === 0
    ) {

        list.innerHTML =
            "<p>Seu inventário está vazio.</p>";

        return;
    }


    owned.forEach(
        item => {

            const card =
                document.createElement(
                    "button"
                );


            card.className =
                "inventory-card";


            card.innerHTML = `

                <div class="inventory-icon">
                    ${item.icon}
                </div>

                <strong>
                    ${item.name}
                </strong>

                <small>
                    Clique para examinar
                </small>
            `;


            card.addEventListener(
                "click",
                () => {

                    openItem(
                        item
                    );
                }
            );


            list.appendChild(card);
        }
    );
}


function openItem(
    item
) {

    state.selectedItem =
        item;


    document
        .getElementById(
            "itemIcon"
        )
        .textContent =
        item.icon;


    document
        .getElementById(
            "itemName"
        )
        .textContent =
        item.name;


    document
        .getElementById(
            "itemDescription"
        )
        .textContent =
        item.description;


    const button =
        document.getElementById(
            "useItemButton"
        );


    button.style.display =
        item.usable
            ? "block"
            : "none";


    closeModal(
        "inventoryModal"
    );


    toggleModal(
        "itemModal"
    );
}


/* =========================================================
   USAR OBJETO
========================================================= */

function useSelectedItem() {

    const item =
        state.selectedItem;


    if (!item)
        return;


    if (
        item.id === "flashlight"
    ) {

        closeModal(
            "itemModal"
        );

        toggleFlashlight();

        return;
    }


    if (
        item.id === "ticket"
    ) {

        closeModal(
            "itemModal"
        );

        showTicket();

        return;
    }


    if (
        item.id === "key"
    ) {

        closeModal(
            "itemModal"
        );


        showDialogue(
            "Yuri",
            "👤",
            [
                "A chave parece combinar com alguma porta antiga.",
                "Não posso usá-la aqui.",
                "Preciso encontrar a fechadura certa."
            ]
        );


        return;
    }


    if (
        item.id === "coin"
    ) {

        closeModal(
            "itemModal"
        );


        showDialogue(
            "Yuri",
            "👤",
            [
                "O símbolo da moeda é igual ao símbolo do bilhete.",
                "Isso não parece uma coincidência."
            ]
        );


        return;
    }


    if (
        item.id === "masterkey"
    ) {

        closeModal(
            "itemModal"
        );


        showDialogue(
            "Yuri",
            "👤",
            [
                "A chave mestra.",
                "Talvez finalmente seja possível abrir a Sala 0."
            ]
        );


        return;
    }


    if (
        item.id === "badge"
    ) {

        closeModal(
            "itemModal"
        );


        showDialogue(
            "Yuri",
            "👤",
            [
                "A insígnia do condutor.",
                "Ela parece antiga... muito antiga."
            ]
        );
    }
}


/* =========================================================
   BILHETE
========================================================= */

function showTicket() {

    state.ticketRead =
        true;


    document
        .getElementById(
            "ticketModal"
        )
        .classList.remove(
            "hidden"
        );
}


/* =========================================================
   MISSÕES
========================================================= */

function updateMissions() {

    const list =
        document.getElementById(
            "missionsList"
        );


    const missions = [

        {
            title:
                "A estação vazia",

            text:
                "Explore a Estação Central e descubra por que ela foi abandonada.",

            done:
                state.metOlivia
        },

        {
            title:
                "Olivia",

            text:
                "Descubra por que Olivia conhece Yuri.",

            done:
                state.metOlivia
        },

        {
            title:
                "O bilhete impossível",

            text:
                "Examine o bilhete e descubra a importância da Sala 0.",

            done:
                state.ticketRead
        },

        {
            title:
                "O Último Trem",

            text:
                "Descubra por que o trem continua chegando à meia-noite.",

            done:
                state.metConductor
        },

        {
            title:
                "Paciente 404",

            text:
                "Investigue o Hospital São Lucas.",

            done:
                state.hospitalSolved
        },

        {
            title:
                "Debaixo da cidade",

            text:
                "Descubra o que existe nos túneis.",

            done:
                state.tunnelSolved
        },

        {
            title:
                "Sala 0",

            text:
                "Encontre a Sala 0 e descubra a verdade.",

            done:
                state.roomZeroReached
        }

    ];


    list.innerHTML = "";


    missions.forEach(
        mission => {

            const div =
                document.createElement(
                    "div"
                );


            div.style.padding =
                "15px";

            div.style.marginBottom =
                "8px";

            div.style.background =
                "rgba(255,255,255,.04)";

            div.style.border =
                "1px solid rgba(255,255,255,.08)";


            div.innerHTML = `

                <strong>
                    ${mission.done ? "✓ " : "○ "}
                    ${mission.title}
                </strong>

                <p style="
                    margin-top:8px;
                    color:#9299a2;
                    font-size:12px;
                    line-height:1.5;
                ">
                    ${mission.text}
                </p>
            `;


            list.appendChild(div);
        }
    );
}


/* =========================================================
   OBJETIVO
========================================================= */

function updateObjective(
    text
) {

    document
        .getElementById(
            "objectiveText"
        )
        .textContent =
        text;


    updateMissions();
}


/* =========================================================
   TREM
========================================================= */

function openTrain() {

    document
        .getElementById(
            "trainModal"
        )
        .classList.remove(
            "hidden"
        );
}


function travelTo(
    destination
) {

    closeModal(
        "trainModal"
    );


    if (
        destination === "hospital"
    ) {

        showDialogue(
            "Yuri",
            "👤",
            [
                "O trem para no Hospital São Lucas.",
                "Talvez eu encontre respostas lá."
            ]
        );


        state.currentArea =
            "hospital";


        updateLocation(
            "HOSPITAL SÃO LUCAS"
        );


        updateObjective(
            "Procure Kaio e investigue o Paciente 404."
        );


        player.x = 0;
        player.z = -35;

        camera.position.set(
            player.x,
            player.y,
            player.z
        );


        return;
    }


    if (
        destination === "oldtown"
    ) {

        state.currentArea =
            "oldtown";


        updateLocation(
            "CIDADE ANTIGA"
        );


        updateObjective(
            "Converse com a Senhora da Cidade Antiga."
        );


        player.x = -10;
        player.z = -55;


        camera.position.set(
            player.x,
            player.y,
            player.z
        );


        return;
    }


    if (
        destination === "tunnels"
    ) {

        state.currentArea =
            "tunnels";


        updateLocation(
            "TÚNEIS"
        );


        updateObjective(
            "Encontre a entrada da Sala 0."
        );


        player.x = 0;
        player.z = -60;


        camera.position.set(
            player.x,
            player.y,
            player.z
        );


        return;
    }


    if (
        destination === "rain"
    ) {

        state.currentArea =
            "rain";


        updateLocation(
            "DISTRITO DA CHUVA"
        );


        updateObjective(
            "Procure pistas sobre o antigo sistema ferroviário."
        );


        player.x = 15;
        player.z = -20;


        camera.position.set(
            player.x,
            player.y,
            player.z
        );


        return;
    }


    if (
        destination === "park"
    ) {

        state.currentArea =
            "park";


        updateLocation(
            "PARQUE DAS LANTERNAS"
        );


        updateObjective(
            "Descubra por que as lanternas permanecem acesas."
        );


        player.x = -15;
        player.z = -20;


        camera.position.set(
            player.x,
            player.y,
            player.z
        );
    }
}


/* =========================================================
   SALA 0
========================================================= */

function enterRoomZero() {

    if (
        !state.hasMasterKey
    ) {

        showDialogue(
            "Yuri",
            "👤",
            [
                "A porta está trancada.",
                "Preciso de uma chave mais forte."
            ]
        );


        return;
    }


    state.roomZeroReached =
        true;


    showEnding(
        "A VERDADE",
        "A Sala 0 não estava abandonada. Ela estava esperando por Yuri."
    );
}


/* =========================================================
   PUZZLE
========================================================= */

function openPuzzle(
    title,
    description
) {

    document
        .getElementById(
            "puzzleTitle"
        )
        .textContent =
        title;


    document
        .getElementById(
            "puzzleDescription"
        )
        .textContent =
        description;


    document
        .getElementById(
            "puzzleInput"
        )
        .value = "";


    document
        .getElementById(
            "puzzleMessage"
        )
        .textContent = "";


    document
        .getElementById(
            "puzzleModal"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "puzzleInput"
        )
        .focus();
}


function solvePuzzle() {

    const input =
        document
            .getElementById(
                "puzzleInput"
            )
            .value.trim();


    const description =
        document
            .getElementById(
                "puzzleDescription"
            )
            .textContent;


    let correctCode =
        "";


    if (
        description.includes(
            "hospital"
        ) ||
        description.includes(
            "Paciente"
        )
    ) {

        correctCode =
            "0404";

    } else {

        correctCode =
            "0000";
    }


    if (
        input === correctCode
    ) {

        document
            .getElementById(
                "puzzleMessage"
            )
            .textContent =
            "CÓDIGO CORRETO.";


        if (
            correctCode === "0404"
        ) {

            state.hospitalSolved =
                true;


            state.hasMasterKey =
                true;


            updateObjective(
                "Você encontrou a Chave Mestra. Descubra onde ela pode ser usada."
            );

        } else {

            state.tunnelSolved =
                true;


            state.hasMasterKey =
                true;


            updateObjective(
                "A Sala 0 está próxima."
            );
        }


        saveGame();


        setTimeout(
            () => {

                closeModal(
                    "puzzleModal"
                );

            },
            900
        );


    } else {

        document
            .getElementById(
                "puzzleMessage"
            )
            .textContent =
            "Código incorreto.";
    }
}


/* =========================================================
   FINAL
========================================================= */

function showEnding(
    title,
    text
) {

    state.ending =
        true;


    document
        .getElementById(
            "endingTitle"
        )
        .textContent =
        title;


    document
        .getElementById(
            "endingText"
        )
        .textContent =
        text;


    document
        .getElementById(
            "endingModal"
        )
        .classList.remove(
            "hidden"
        );


    saveGame();
}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    document
        .getElementById(
            "healthText"
        )
        .textContent =
        Math.round(
            player.health
        );


    document
        .getElementById(
            "energyText"
        )
        .textContent =
        Math.round(
            player.energy
        );


    updateClock();

    updateMissions();
}


function updateLocation(
    location
) {

    document
        .getElementById(
            "locationText"
        )
        .textContent =
        location;
}


/* =========================================================
   RELÓGIO
========================================================= */

function updateClock() {

    const hours =
        Math.floor(
            state.timeMinutes / 60
        );


    const minutes =
        state.timeMinutes % 60;


    document
        .getElementById(
            "clockText"
        )
        .textContent =
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}


/* =========================================================
   TEMPO
========================================================= */

let lastTime =
    performance.now();


function updateGameTime(
    delta
) {

    state.timeMinutes +=
        delta * .7;


    if (
        state.timeMinutes >= 60
    ) {

        state.timeMinutes = 0;
    }


    updateClock();
}


/* =========================================================
   MOVIMENTO
========================================================= */

function updateMovement(
    delta
) {

    if (!state.started)
        return;


    if (anyModalOpen())
        return;


    const moving =
        keys.w ||
        keys.a ||
        keys.s ||
        keys.d;


    if (!moving)
        return;


    const speed =
        keys.shift &&
        player.energy > 0
            ? player.sprintSpeed
            : player.speed;


    if (
        keys.shift &&
        player.energy > 0
    ) {

        player.energy -=
            delta * 12;

    } else {

        player.energy +=
            delta * 6;
    }


    player.energy =
        THREE.MathUtils.clamp(
            player.energy,
            0,
            100
        );


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


    if (keys.w)
        movement.add(direction);


    if (keys.s)
        movement.sub(direction);


    if (keys.d)
        movement.add(right);


    if (keys.a)
        movement.sub(right);


    if (
        movement.lengthSq() > 0
    ) {

        movement.normalize();

        movement.multiplyScalar(
            speed * delta
        );


        player.x +=
            movement.x;


        player.z +=
            movement.z;


        /* limites da estação */

        player.x =
            THREE.MathUtils.clamp(
                player.x,
                -27,
                27
            );


        player.z =
            THREE.MathUtils.clamp(
                player.z,
                -82,
                17
            );


        camera.position.x =
            player.x;


        camera.position.z =
            player.z;
    }
}


/* =========================================================
   INTERAÇÃO AUTOMÁTICA
========================================================= */

function updateInteractionHint() {

    if (!state.started)
        return;


    const target =
        findInteractionTarget();


    const hint =
        document.getElementById(
            "interactionHint"
        );


    if (target) {

        hint.classList.add(
            "visible"
        );

    } else {

        hint.classList.remove(
            "visible"
        );
    }
}


/* =========================================================
   MODAIS
========================================================= */

function toggleModal(
    id
) {

    const modal =
        document.getElementById(
            id
        );


    if (
        modal.classList.contains(
            "hidden"
        )
    ) {

        if (
            id === "inventoryModal"
        ) {

            openInventory();
        }


        if (
            id === "missionsModal"
        ) {

            updateMissions();
        }


        modal.classList.remove(
            "hidden"
        );

    } else {

        modal.classList.add(
            "hidden"
        );
    }
}


function closeModal(
    id
) {

    document
        .getElementById(
            id
        )
        .classList.add(
            "hidden"
        );
}


function anyModalOpen() {

    const modals =
        document.querySelectorAll(
            ".modal"
        );


    for (
        const modal of modals
    ) {

        if (
            !modal.classList.contains(
                "hidden"
            )
        ) {

            return true;
        }
    }


    return false;
}


/* =========================================================
   MOBILE
========================================================= */

function setupMobileControls() {

    const hold =
        (
            button,
            key
        ) => {

            button.addEventListener(
                "touchstart",
                event => {

                    event.preventDefault();

                    keys[key] =
                        true;
                },
                {
                    passive: false
                }
            );


            button.addEventListener(
                "touchend",
                event => {

                    event.preventDefault();

                    keys[key] =
                        false;
                },
                {
                    passive: false
                }
            );
        };


    hold(
        document.getElementById(
            "mobileForward"
        ),
        "w"
    );


    hold(
        document.getElementById(
            "mobileBackward"
        ),
        "s"
    );


    /* =====================================================
       DIREITA E ESQUERDA CORRETAS
    ====================================================== */

    hold(
        document.getElementById(
            "mobileLeft"
        ),
        "a"
    );


    hold(
        document.getElementById(
            "mobileRight"
        ),
        "d"
    );


    document
        .getElementById(
            "mobileInteract"
        )
        .addEventListener(
            "click",
            interact
        );


    document
        .getElementById(
            "mobileFlashlight"
        )
        .addEventListener(
            "click",
            toggleFlashlight
        );


    document
        .getElementById(
            "mobileInventory"
        )
        .addEventListener(
            "click",
            () =>
                toggleModal(
                    "inventoryModal"
                )
        );
}


/* =========================================================
   RESIZE
========================================================= */

function onResize() {

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
   ANIMAÇÃO
========================================================= */

function animate(
    currentTime = performance.now()
) {

    requestAnimationFrame(
        animate
    );


    const delta =
        Math.min(
            (currentTime - lastTime) /
            1000,
            .05
        );


    lastTime =
        currentTime;


    updateMovement(
        delta
    );


    updateGameTime(
        delta
    );


    updateInteractionHint();


    renderer.render(
        scene,
        camera
    );
}


/* =========================================================
   INICIAR
========================================================= */

init();
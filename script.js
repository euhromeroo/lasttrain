import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/PointerLockControls.js";


// ============================================================
// ESTADO DO JOGO
// ============================================================

const gameState = {

    player: {
        lives: 3,
        energy: 100,
        x: 0,
        y: 1.7,
        z: 12
    },

    inventory: [],

    clues: 0,

    mission:
        "Descubra onde você está.",

    flags: {
        metOlivia: false,
        foundTicket: false,
        inspectedClock: false,
        flashlight: false,
        trainSeen: false
    }

};


// ============================================================
// CENA
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x050509);

scene.fog = new THREE.FogExp2(
    0x050509,
    0.035
);


// ============================================================
// CÂMERA
// ============================================================

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    200
);

camera.position.set(
    gameState.player.x,
    gameState.player.y,
    gameState.player.z
);


// ============================================================
// RENDERER
// ============================================================

const renderer = new THREE.WebGLRenderer({
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

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

document
    .getElementById("game")
    .prepend(renderer.domElement);


// ============================================================
// CONTROLES
// ============================================================

const controls =
    new PointerLockControls(
        camera,
        renderer.domElement
    );

renderer.domElement.addEventListener(
    "click",
    () => {

        if (
            !gameState.dialogueOpen &&
            !gameState.inventoryOpen
        ) {
            controls.lock();
        }

    }
);


// ============================================================
// LUZES
// ============================================================

const ambientLight =
    new THREE.HemisphereLight(
        0x777788,
        0x080808,
        0.55
    );

scene.add(ambientLight);


const moonLight =
    new THREE.DirectionalLight(
        0xaaaaff,
        0.35
    );

moonLight.position.set(
    20,
    30,
    10
);

moonLight.castShadow = true;

scene.add(moonLight);


// ============================================================
// MATERIAIS
// ============================================================

const floorMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x292930,
        roughness: 0.85
    });

const wallMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x17171e,
        roughness: 0.9
    });

const metalMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x55555d,
        metalness: 0.7,
        roughness: 0.4
    });

const yellowMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xb5a23a,
        roughness: 0.6
    });


// ============================================================
// FUNÇÃO PARA CRIAR CUBOS
// ============================================================

function createBox(
    width,
    height,
    depth,
    material,
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
            material
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


// ============================================================
// CHÃO DA ESTAÇÃO
// ============================================================

createBox(
    70,
    0.4,
    45,
    floorMaterial,
    0,
    -0.2,
    0
);


// ============================================================
// PAREDES
// ============================================================

createBox(
    70,
    8,
    1,
    wallMaterial,
    0,
    4,
    -22
);

createBox(
    70,
    8,
    1,
    wallMaterial,
    0,
    4,
    22
);

createBox(
    1,
    8,
    45,
    wallMaterial,
    -35,
    4,
    0
);

createBox(
    1,
    8,
    45,
    wallMaterial,
    35,
    4,
    0
);


// ============================================================
// COLUNAS
// ============================================================

for (let x = -30; x <= 30; x += 10) {

    createBox(
        1.2,
        7,
        1.2,
        wallMaterial,
        x,
        3.5,
        -5
    );

    createBox(
        1.2,
        7,
        1.2,
        wallMaterial,
        x,
        3.5,
        15
    );

}


// ============================================================
// PLATAFORMA
// ============================================================

createBox(
    70,
    0.8,
    6,
    metalMaterial,
    0,
    0.25,
    -8
);


// ============================================================
// TRILHOS
// ============================================================

function createRail(x) {

    createBox(
        70,
        0.15,
        0.18,
        metalMaterial,
        x,
        0.75,
        -8
    );

}

createRail(-1.4);
createRail(1.4);


// ============================================================
// DORMENTES
// ============================================================

for (
    let x = -32;
    x <= 32;
    x += 2
) {

    createBox(
        0.9,
        0.18,
        4,
        wallMaterial,
        x,
        0.62,
        -8
    );

}


// ============================================================
// LUMINÁRIAS
// ============================================================

function createLamp(x, z) {

    const pole =
        createBox(
            0.2,
            4,
            0.2,
            metalMaterial,
            x,
            2,
            z
        );

    const light =
        new THREE.PointLight(
            0xcfcfff,
            3,
            10
        );

    light.position.set(
        x,
        4.1,
        z
    );

    light.castShadow = true;

    scene.add(light);

    const bulb =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.18,
                12,
                12
            ),
            new THREE.MeshBasicMaterial({
                color: 0xffffff
            })
        );

    bulb.position.copy(light.position);

    scene.add(bulb);
}


for (
    let x = -30;
    x <= 30;
    x += 10
) {

    createLamp(x, 4);

}


// ============================================================
// RELÓGIO
// ============================================================

const clockGroup =
    new THREE.Group();

const clockBody =
    new THREE.Mesh(
        new THREE.CylinderGeometry(
            2,
            2,
            0.4,
            32
        ),
        new THREE.MeshStandardMaterial({
            color: 0x111116
        })
    );

clockBody.rotation.x =
    Math.PI / 2;

clockGroup.add(clockBody);

clockGroup.position.set(
    0,
    5,
    -21.4
);

scene.add(clockGroup);


// ============================================================
// BILHETE
// ============================================================

const ticket =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            1.2,
            0.04,
            0.6
        ),
        new THREE.MeshStandardMaterial({
            color: 0xd8c18a
        })
    );

ticket.position.set(
    7,
    0.9,
    6
);

ticket.rotation.y = 0.3;

ticket.userData.interactable = true;
ticket.userData.type = "ticket";

scene.add(ticket);


// ============================================================
// LANTERNA
// ============================================================

const flashlight =
    new THREE.SpotLight(
        0xffffff,
        0,
        35,
        Math.PI / 7,
        0.5,
        1
    );

flashlight.position.set(
    0,
    1.6,
    0
);

flashlight.castShadow = true;

camera.add(flashlight);

scene.add(camera);


// ============================================================
// OBJETO PARA OLIVIA
// ============================================================

const oliviaGroup =
    new THREE.Group();

const oliviaBody =
    new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.55,
            0.7,
            1.8,
            12
        ),
        new THREE.MeshStandardMaterial({
            color: 0x292033
        })
    );

oliviaBody.position.y = 1;

oliviaGroup.add(oliviaBody);


const oliviaHead =
    new THREE.Mesh(
        new THREE.SphereGeometry(
            0.45,
            16,
            16
        ),
        new THREE.MeshStandardMaterial({
            color: 0xc9967e
        })
    );

oliviaHead.position.y = 2.15;

oliviaGroup.add(oliviaHead);


oliviaGroup.position.set(
    -7,
    0,
    5
);

oliviaGroup.userData.interactable = true;
oliviaGroup.userData.type = "olivia";

scene.add(oliviaGroup);


// ============================================================
// PLACA "ESTAÇÃO CENTRAL"
// ============================================================

const signCanvas =
    document.createElement("canvas");

signCanvas.width = 1024;
signCanvas.height = 256;

const signContext =
    signCanvas.getContext("2d");

signContext.fillStyle =
    "#11111a";

signContext.fillRect(
    0,
    0,
    1024,
    256
);

signContext.fillStyle =
    "#d9d9e6";

signContext.font =
    "bold 90px Arial";

signContext.textAlign =
    "center";

signContext.fillText(
    "ESTAÇÃO CENTRAL",
    512,
    155
);

const signTexture =
    new THREE.CanvasTexture(
        signCanvas
    );

const sign =
    new THREE.Mesh(
        new THREE.PlaneGeometry(
            16,
            4
        ),
        new THREE.MeshBasicMaterial({
            map: signTexture
        })
    );

sign.position.set(
    0,
    6,
    -21
);

scene.add(sign);


// ============================================================
// OBJETOS DE INVESTIGAÇÃO
// ============================================================

const oldNote =
    createBox(
        1,
        0.05,
        0.7,
        new THREE.MeshStandardMaterial({
            color: 0xddd1a8
        }),
        -5,
        0.85,
        8
    );

oldNote.userData.interactable = true;
oldNote.userData.type = "note";


// ============================================================
// DETECÇÃO DE INTERAÇÃO
// ============================================================

const raycaster =
    new THREE.Raycaster();

const center =
    new THREE.Vector2(0, 0);

let currentObject = null;


function findInteraction() {

    raycaster.setFromCamera(
        center,
        camera
    );

    const objects =
        scene.children.filter(
            object =>
                object.userData &&
                object.userData.interactable
        );

    const hits =
        raycaster.intersectObjects(
            objects,
            true
        );

    if (
        hits.length > 0 &&
        hits[0].distance < 5
    ) {

        currentObject =
            hits[0].object;

        document.getElementById(
            "interaction"
        ).style.display = "block";

    } else {

        currentObject = null;

        document.getElementById(
            "interaction"
        ).style.display = "none";
    }
}


// ============================================================
// INTERAÇÕES
// ============================================================

function interact() {

    if (!currentObject) return;

    const type =
        currentObject.userData.type;

    if (type === "olivia") {

        talkToOlivia();

    }

    if (type === "ticket") {

        collectTicket(
            currentObject
        );

    }

    if (type === "note") {

        inspectNote();

    }

}


// ============================================================
// OLIVIA
// ============================================================

let dialogueLines = [];
let dialogueIndex = 0;


function talkToOlivia() {

    if (gameState.flags.metOlivia) {

        openDialogue(
            "Olivia",
            [
                "Você ainda está procurando respostas?",
                "Então procure o trem.",
                "Mas não confie no horário que aparece no relógio."
            ]
        );

        return;
    }

    gameState.flags.metOlivia = true;

    gameState.mission =
        "Encontre uma maneira de descobrir o que aconteceu na estação.";

    updateMission();

    openDialogue(
        "Olivia",
        [
            "Você finalmente acordou.",
            "Olivia... é esse o meu nome.",
            "Esta estação deveria estar vazia.",
            "Mas você não é a primeira pessoa a aparecer aqui.",
            "Se quiser sair daqui, encontre o bilhete.",
            "Depois procure pelo trem."
        ]
    );

}


// ============================================================
// DIÁLOGO
// ============================================================

function openDialogue(
    name,
    lines
) {

    dialogueLines = lines;
    dialogueIndex = 0;

    gameState.dialogueOpen = true;

    document.getElementById(
        "dialogue"
    ).style.display = "block";

    document.getElementById(
        "dialogue-name"
    ).textContent = name;

    document.getElementById(
        "dialogue-text"
    ).textContent =
        dialogueLines[0];

    controls.unlock();

}


function nextDialogue() {

    dialogueIndex++;

    if (
        dialogueIndex >=
        dialogueLines.length
    ) {

        closeDialogue();

        return;
    }

    document.getElementById(
        "dialogue-text"
    ).textContent =
        dialogueLines[
            dialogueIndex
        ];

}


function closeDialogue() {

    gameState.dialogueOpen = false;

    document.getElementById(
        "dialogue"
    ).style.display = "none";
}


// ============================================================
// BILHETE
// ============================================================

function collectTicket(
    object
) {

    if (
        gameState.flags.foundTicket
    ) return;

    gameState.flags.foundTicket =
        true;

    gameState.inventory.push({
        name: "Bilhete antigo",
        icon: "🎫",
        description:
            "Um bilhete de metrô com uma data impossível."
    });

    gameState.clues++;

    gameState.mission =
        "Converse novamente com Olivia.";

    updateMission();

    scene.remove(object);

    notify(
        "🎫 Bilhete antigo encontrado."
    );

}


// ============================================================
// NOTA
// ============================================================

function inspectNote() {

    gameState.clues++;

    gameState.flags.inspectedClock = true;

    notify(
        "🔎 Você encontrou uma anotação: 'O trem chega sempre à meia-noite.'"
    );

    gameState.mission =
        "Descubra por que o trem continua chegando.";

    updateMission();

}


// ============================================================
// NOTIFICAÇÃO
// ============================================================

let notificationTimer;


function notify(
    text
) {

    const element =
        document.getElementById(
            "notification"
        );

    element.textContent = text;
    element.style.display = "block";

    clearTimeout(
        notificationTimer
    );

    notificationTimer =
        setTimeout(() => {

            element.style.display =
                "none";

        }, 3500);

}


// ============================================================
// INVENTÁRIO
// ============================================================

function openInventory() {

    const inventory =
        document.getElementById(
            "inventory"
        );

    const items =
        document.getElementById(
            "items"
        );

    items.innerHTML = "";

    if (
        gameState.inventory.length === 0
    ) {

        items.innerHTML =
            "Nenhum item encontrado.";

    } else {

        gameState.inventory.forEach(
            item => {

                const div =
                    document.createElement(
                        "div"
                    );

                div.className = "item";

                div.innerHTML = `
                    <div class="item-name">
                        ${item.icon} ${item.name}
                    </div>

                    <div class="item-description">
                        ${item.description}
                    </div>
                `;

                items.appendChild(div);

            }
        );

    }

    inventory.style.display = "block";

    gameState.inventoryOpen = true;

    controls.unlock();
}


function closeInventory() {

    document.getElementById(
        "inventory"
    ).style.display = "none";

    gameState.inventoryOpen = false;
}


// ============================================================
// MISSÃO
// ============================================================

function updateMission() {

    document.getElementById(
        "mission"
    ).textContent =
        gameState.mission;

}


// ============================================================
// TECLADO
// ============================================================

const keys = {};

document.addEventListener(
    "keydown",
    event => {

        keys[event.code] = true;

        if (
            event.code === "KeyE" &&
            !gameState.dialogueOpen &&
            !gameState.inventoryOpen
        ) {

            interact();

        }

        if (
            event.code === "KeyI"
        ) {

            if (
                gameState.inventoryOpen
            ) {

                closeInventory();

            } else {

                openInventory();

            }

        }

    }
);


document.addEventListener(
    "keyup",
    event => {

        keys[event.code] = false;

    }
);


// ============================================================
// MOVIMENTO
// ============================================================

const clock =
    new THREE.Clock();


function movePlayer(
    delta
) {

    if (
        !controls.isLocked ||
        gameState.dialogueOpen ||
        gameState.inventoryOpen
    ) {
        return;
    }

    const speed = 5;

    let direction =
        new THREE.Vector3();

    if (keys["KeyW"])
        direction.z -= 1;

    if (keys["KeyS"])
        direction.z += 1;

    if (keys["KeyA"])
        direction.x -= 1;

    if (keys["KeyD"])
        direction.x += 1;

    if (
        direction.length() > 0
    ) {

        direction.normalize();

        controls.moveRight(
            direction.x *
            speed *
            delta
        );

        controls.moveForward(
            -direction.z *
            speed *
            delta
        );

    }

    camera.position.x =
        THREE.MathUtils.clamp(
            camera.position.x,
            -32,
            32
        );

    camera.position.z =
        THREE.MathUtils.clamp(
            camera.position.z,
            -19,
            19
        );

    camera.position.y =
        1.7;

}


// ============================================================
// LANTERNA
// ============================================================

function toggleFlashlight() {

    if (
        !gameState.flags.flashlight
    ) {

        gameState.flags.flashlight =
            true;

        flashlight.intensity = 4;

        notify(
            "🔦 Lanterna ligada."
        );

    } else {

        flashlight.intensity = 0;

        notify(
            "🔦 Lanterna desligada."
        );

    }

}


// tecla F
document.addEventListener(
    "keydown",
    event => {

        if (
            event.code === "KeyF" &&
            !gameState.dialogueOpen &&
            !gameState.inventoryOpen
        ) {

            toggleFlashlight();

        }

    }
);


// ============================================================
// BOTÕES
// ============================================================

document.getElementById(
    "dialogue-next"
).addEventListener(
    "click",
    nextDialogue
);


document.getElementById(
    "close-inventory"
).addEventListener(
    "click",
    closeInventory
);


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

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


// ============================================================
// ANIMAÇÃO
// ============================================================

function animate() {

    requestAnimationFrame(
        animate
    );

    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );

    movePlayer(delta);

    findInteraction();

    renderer.render(
        scene,
        camera
    );

}


updateMission();


// ============================================================
// INICIAR
// ============================================================

setTimeout(() => {

    document.getElementById(
        "loading"
    ).style.display = "none";

    notify(
        "Você acordou na Estação Central."
    );

}, 1200);


animate();
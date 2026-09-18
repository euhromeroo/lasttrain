import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/PointerLockControls.js";


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const SAVE_KEY = "ultimoTrem3D-save-v4";


/* =========================================================
   ITENS
========================================================= */

const ITEMS = {

  ticket:{
    icon:"🎫",
    name:"Bilhete impossível",
    desc:"Bilhete emitido para uma linha encerrada há anos."
  },

  flashlight:{
    icon:"🔦",
    name:"Lanterna",
    desc:"Uma lanterna velha. A bateria parece não acabar."
  },

  photo:{
    icon:"📷",
    name:"Fotografia",
    desc:"Yuri aparece ao fundo de uma foto datada de antes de nascer."
  },

  redNote:{
    icon:"📝",
    name:"Bilhete vermelho",
    desc:"Não deixe o trem chegar à Sala 0."
  },

  hospitalCard:{
    icon:"💳",
    name:"Cartão do Hospital",
    desc:"Acesso do Hospital São Lucas. Nome apagado."
  },

  oldKey:{
    icon:"🗝️",
    name:"Chave antiga",
    desc:"Tem o símbolo da antiga Companhia Metropolitana."
  },

  masterKey:{
    icon:"🔑",
    name:"Chave mestra",
    desc:"Abre os setores técnicos da estação."
  },

  strangeCoin:{
    icon:"🪙",
    name:"Moeda estranha",
    desc:"Marcada com o mesmo símbolo do trem."
  },

  badge:{
    icon:"🎖️",
    name:"Insígnia do Condutor",
    desc:"O último passageiro escolhe o destino."
  }

};


/* =========================================================
   MISSÕES
========================================================= */

const MISSIONS = {

  wake:{
    name:"A estação vazia",
    desc:"Investigue a Estação Central.",
    complete:false
  },

  olivia:{
    name:"Olivia",
    desc:"Converse com a mulher perto da plataforma.",
    complete:false
  },

  ticket:{
    name:"O bilhete impossível",
    desc:"Encontre o bilhete mencionado por Olivia.",
    complete:false
  },

  train:{
    name:"O Último Trem",
    desc:"Descubra como embarcar no trem.",
    complete:false
  },

  hospital:{
    name:"Paciente 404",
    desc:"Encontre Kaio no Hospital São Lucas.",
    complete:false
  },

  tunnel:{
    name:"Debaixo da cidade",
    desc:"Acesse os túneis da companhia.",
    complete:false
  },

  room0:{
    name:"Sala 0",
    desc:"Descubra o que existe atrás da porta sem número.",
    complete:false
  }

};


/* =========================================================
   ESTADO
========================================================= */

const defaultState = () => ({

  lives:3,

  energy:100,

  coins:0,

  clues:0,

  xp:0,

  level:1,

  time:23 * 60 + 47,

  location:"central",

  trainTrips:0,

  inventory:[],

  endings:[],

  flags:{

    metOlivia:false,

    gotTicket:false,

    trainUnlocked:false,

    metConductor:false,

    hospitalUnlocked:false,

    metKaio:false,

    oldtownUnlocked:false,

    tunnelUnlocked:false,

    terminalSolved:false,

    room0Unlocked:false,

    room0Started:false,

    flashlightOwned:false,

    photoFound:false,

    redNoteFound:false

  },

  missions:
    JSON.parse(
      JSON.stringify(MISSIONS)
    ),

  pos:{
    x:0,
    y:1.7,
    z:15
  }

});


let state = defaultState();


/* =========================================================
   ÁREAS
========================================================= */

const AREAS = {

  central:{
    label:"ESTAÇÃO CENTRAL",
    spawn:[0,1.7,15],
    fog:0x080b09,
    density:.026
  },

  rain:{
    label:"DISTRITO DA CHUVA",
    spawn:[0,1.7,10],
    fog:0x0b1114,
    density:.035
  },

  park:{
    label:"PARQUE DAS LANTERNAS",
    spawn:[0,1.7,12],
    fog:0x0a120d,
    density:.023
  },

  hospital:{
    label:"HOSPITAL SÃO LUCAS",
    spawn:[0,1.7,14],
    fog:0x101314,
    density:.020
  },

  oldtown:{
    label:"CIDADE ANTIGA",
    spawn:[0,1.7,12],
    fog:0x17120d,
    density:.028
  },

  tunnels:{
    label:"TÚNEIS",
    spawn:[0,1.7,12],
    fog:0x050606,
    density:.040
  },

  room0:{
    label:"SALA 0",
    spawn:[0,1.7,9],
    fog:0x09070b,
    density:.018
  }

};


/* =========================================================
   THREE.JS
========================================================= */

const scene =
  new THREE.Scene();


const camera =
  new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    .1,
    300
  );


const renderer =
  new THREE.WebGLRenderer({

    antialias:true,

    powerPreference:"high-performance"

  });


renderer.setSize(
  innerWidth,
  innerHeight
);

renderer.setPixelRatio(
  Math.min(devicePixelRatio,2)
);


renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;


renderer.outputColorSpace =
  THREE.SRGBColorSpace;


/* aparência cinematográfica */

renderer.toneMapping =
  THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure =
  .82;


$("#game").prepend(
  renderer.domElement
);


const controls =
  new PointerLockControls(
    camera,
    renderer.domElement
  );


const world =
  new THREE.Group();

scene.add(world);


const interactables = [];

const colliders = [];

const animated = [];

const keys = {};

let currentInteract = null;

let gameStarted = false;

let activeDialogue = null;

let dialogueIndex = 0;

let notificationTimer;


const raycaster =
  new THREE.Raycaster();


const clock =
  new THREE.Clock();


/* =========================================================
   ILUMINAÇÃO
========================================================= */

scene.add(
  new THREE.HemisphereLight(
    0x778078,
    0x030404,
    .42
  )
);


const moon =
  new THREE.DirectionalLight(
    0xaab7ff,
    .22
  );

moon.position.set(
  15,
  30,
  10
);

scene.add(moon);


/* =========================================================
   LANTERNA
========================================================= */

const flashlight =
  new THREE.SpotLight(
    0xffffff,
    0,
    42,
    Math.PI / 7,
    .5,
    1.2
  );


flashlight.position.set(
  0,
  0,
  0
);


flashlight.target.position.set(
  0,
  0,
  -10
);


camera.add(flashlight);

camera.add(
  flashlight.target
);

scene.add(camera);


/* =========================================================
   MATERIAIS
========================================================= */

function mat(
  color,
  rough=.75,
  metal=.05,
  emissive=0x000000,
  ei=0
){

  return new THREE.MeshStandardMaterial({

    color,

    roughness:rough,

    metalness:metal,

    emissive,

    emissiveIntensity:ei

  });

}


/* =========================================================
   OBJETOS
========================================================= */

function box(
  w,
  h,
  d,
  m,
  x,
  y,
  z,
  collide=false
){

  const mesh =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        w,
        h,
        d
      ),
      m
    );


  mesh.position.set(
    x,
    y,
    z
  );


  mesh.castShadow = true;

  mesh.receiveShadow = true;


  world.add(mesh);


  if(collide){

    colliders.push(mesh);

  }


  return mesh;

}


function cylinder(
  r,
  h,
  m,
  x,
  y,
  z
){

  const mesh =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        r,
        r,
        h,
        20
      ),
      m
    );


  mesh.position.set(
    x,
    y,
    z
  );


  mesh.castShadow = true;


  world.add(mesh);


  return mesh;

}


/* =========================================================
   PLACAS
========================================================= */

function label(
  text,
  w=5,
  h=1.1
){

  const canvas =
    document.createElement(
      "canvas"
    );


  canvas.width = 768;

  canvas.height = 192;


  const ctx =
    canvas.getContext("2d");


  ctx.fillStyle =
    "#111312";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  ctx.strokeStyle =
    "#6f302f";

  ctx.lineWidth = 7;


  ctx.strokeRect(
    4,
    4,
    canvas.width-8,
    canvas.height-8
  );


  ctx.fillStyle =
    "#e4e4dd";


  ctx.font =
    "700 54px Arial";


  ctx.textAlign =
    "center";


  ctx.textBaseline =
    "middle";


  ctx.fillText(
    text,
    canvas.width/2,
    canvas.height/2
  );


  const texture =
    new THREE.CanvasTexture(
      canvas
    );


  texture.colorSpace =
    THREE.SRGBColorSpace;


  return new THREE.Mesh(

    new THREE.PlaneGeometry(
      w,
      h
    ),

    new THREE.MeshBasicMaterial({

      map:texture,

      transparent:true

    })

  );

}


/* =========================================================
   INTERAÇÃO
========================================================= */

function addInteract(
  obj,
  type,
  data={}
){

  obj.userData.interactable =
    true;

  obj.userData.type =
    type;

  Object.assign(
    obj.userData,
    data
  );


  interactables.push(obj);


  return obj;

}


/* =========================================================
   LUZES
========================================================= */

function pointLight(
  x,
  y,
  z,
  color=0xdde2ff,
  intensity=2.4,
  dist=14
){

  const light =
    new THREE.PointLight(
      color,
      intensity,
      dist
    );


  light.position.set(
    x,
    y,
    z
  );


  world.add(light);


  return light;

}


function lamp(
  x,
  z,
  color=0xe7e8ff
){

  cylinder(
    .08,
    3.5,
    mat(
      0x303331,
      .4,
      .7
    ),
    x,
    1.75,
    z
  );


  const bulb =
    new THREE.Mesh(

      new THREE.SphereGeometry(
        .14,
        12,
        12
      ),

      new THREE.MeshBasicMaterial({
        color
      })

    );


  bulb.position.set(
    x,
    3.55,
    z
  );


  world.add(bulb);


  pointLight(
    x,
    3.5,
    z,
    color,
    2.2,
    12
  );

}


/* =========================================================
   CHÃO
========================================================= */

function floorGrid(
  size=60
){

  box(
    size,
    .3,
    size,

    mat(
      0x242725,
      .95
    ),

    0,
    -.2,
    0,

    true
  );

}


/* =========================================================
   LIMPAR ÁREA
========================================================= */

function clearWorld(){

  while(
    world.children.length
  ){

    world.remove(
      world.children[0]
    );

  }


  interactables.length = 0;

  colliders.length = 0;

  animated.length = 0;

}


/* =========================================================
   PAREDES
========================================================= */

function wall(
  w,
  h,
  d,
  x,
  y,
  z,
  c=0x161917
){

  return box(
    w,
    h,
    d,
    mat(
      c,
      .92
    ),
    x,
    y,
    z,
    true
  );

}


/* =========================================================
   CAIXAS
========================================================= */

function propCrate(
  x,
  z
){

  box(
    1.2,
    1.2,
    1.2,

    mat(
      0x3e3429,
      .9
    ),

    x,
    .6,
    z,

    true
  );

}


/* =========================================================
   NPC
========================================================= */

function makeNpc(
  name,
  x,
  z,
  color=0x352941
){

  const group =
    new THREE.Group();


  const body =
    new THREE.Mesh(

      new THREE.CapsuleGeometry(
        .42,
        .9,
        6,
        12
      ),

      mat(
        color,
        .8
      )

    );


  body.position.y =
    1.05;


  group.add(body);


  const head =
    new THREE.Mesh(

      new THREE.SphereGeometry(
        .33,
        20,
        20
      ),

      mat(
        0xc7967e,
        .72
      )

    );


  head.position.y =
    2;


  group.add(head);


  group.position.set(
    x,
    0,
    z
  );


  world.add(group);


  addInteract(
    group,
    "npc",
    {
      name
    }
  );


  return group;

}


/* =========================================================
   ITENS
========================================================= */

function makePickup(
  id,
  x,
  z
){

  const item =
    ITEMS[id];


  const mesh =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        .7,
        .12,
        .5
      ),

      mat(
        id === "redNote"
          ? 0x7f161d
          : 0xd8c89a,
        .7
      )

    );


  mesh.position.set(
    x,
    .55,
    z
  );


  addInteract(
    mesh,
    "pickup",
    {
      itemId:id
    }
  );


  world.add(mesh);


  animated.push({

    obj:mesh,

    type:"bob",

    baseY:.55,

    phase:
      Math.random() * 6.28

  });


  return mesh;

}


/* =========================================================
   PORTAS
========================================================= */

function makeDoor(
  labelText,
  x,
  z,
  type,
  data={},
  rot=0
){

  const door =
    box(

      2.3,
      3.2,
      .25,

      mat(
        0x292c29,
        .55,
        .35
      ),

      x,
      1.6,
      z,

      true

    );


  door.rotation.y =
    rot;


  addInteract(
    door,
    type,
    data
  );


  const sign =
    label(
      labelText,
      2,
      .52
    );


  sign.position.set(
    x,
    2.2,
    z + (
      rot === 0
        ? .14
        : 0
    )
  );


  sign.rotation.y =
    rot;


  world.add(sign);


  return door;

}


/* =========================================================
   BANCOS
========================================================= */

function benches(){

  for(
    let x=-14;
    x<=14;
    x+=7
  ){

    box(
      3,
      .25,
      1,

      mat(
        0x4a3c2d,
        .8
      ),

      x,
      .7,
      6,

      true
    );


    box(
      3,
      1,
      .18,

      mat(
        0x4a3c2d,
        .8
      ),

      x,
      1.2,
      6.4,

      true
    );

  }

}


/* =========================================================
   ESTAÇÃO CENTRAL
========================================================= */

function buildCentral(){

  clearWorld();


  floorGrid(70);


  wall(
    70,
    7,
    1,
    0,
    3.5,
    -22
  );


  wall(
    70,
    7,
    1,
    0,
    3.5,
    22
  );


  wall(
    1,
    7,
    44,
    -35,
    3.5,
    0
  );


  wall(
    1,
    7,
    44,
    35,
    3.5,
    0
  );


  /* plataforma */

  box(
    70,
    .6,
    6,

    mat(
      0x4b4d4a,
      .9
    ),

    0,
    .15,
    -10,

    true
  );


  /* trilhos */

  box(
    70,
    .15,
    .14,

    mat(
      0x787880,
      .3,
      .9
    ),

    0,
    .75,
    -11.1
  );


  box(
    70,
    .15,
    .14,

    mat(
      0x787880,
      .3,
      .9
    ),

    0,
    .75,
    -8.9
  );


  for(
    let x=-33;
    x<=33;
    x+=2
  ){

    box(
      .55,
      .14,
      4,

      mat(
        0x312b28,
        .9
      ),

      x,
      .62,
      -10
    );

  }


  /* iluminação */

  for(
    let x=-28;
    x<=28;
    x+=8
  ){

    lamp(
      x,
      3.2
    );

  }


  /* colunas */

  for(
    let x=-30;
    x<=30;
    x+=10
  ){

    wall(
      1.1,
      7,
      1.1,
      x,
      3.5,
      -3,
      0x202321
    );


    wall(
      1.1,
      7,
      1.1,
      x,
      3.5,
      15,
      0x202321
    );

  }


  benches();


  /* placa */

  const sign =
    label(
      "ESTAÇÃO CENTRAL",
      12,
      2
    );


  sign.position.set(
    0,
    5.2,
    -21.4
  );


  world.add(sign);


  /* NPCs */

  makeNpc(
    "Olivia",
    -8,
    3,
    0x372946
  );


  makeNpc(
    "Condutor",
    17,
    -5,
    0x20252c
  );


  /* itens */

  if(
    !state.inventory.includes(
      "ticket"
    )
  ){

    makePickup(
      "ticket",
      7,
      7
    );

  }


  if(
    !state.inventory.includes(
      "flashlight"
    )
  ){

    makePickup(
      "flashlight",
      -18,
      7
    );

  }


  if(
    !state.inventory.includes(
      "redNote"
    )
  ){

    makePickup(
      "redNote",
      23,
      14
    );

  }


  /* relógio */

  const clockMesh =
    addInteract(

      new THREE.Mesh(

        new THREE.CylinderGeometry(
          1.25,
          1.25,
          .24,
          32
        ),

        mat(
          0x111116,
          .5,
          .2
        )

      ),

      "clock"

    );


  clockMesh.rotation.x =
    Math.PI / 2;


  clockMesh.position.set(
    0,
    4.3,
    -21.25
  );


  world.add(
    clockMesh
  );


  /* portas */

  makeDoor(
    "ARQUIVO",
    -26,
    21.65,
    "archiveDoor"
  );


  makeDoor(
    "TÚNEIS",
    28,
    21.65,
    "tunnelDoor"
  );


  if(
    state.flags.room0Unlocked
  ){

    makeDoor(
      "0",
      0,
      21.65,
      "room0Door"
    );

  }


  /* caixas */

  for(
    let i=0;
    i<12;
    i++
  ){

    propCrate(
      -31 + Math.random()*62,
      18 + Math.random()*2
    );

  }


  buildTrain();

}


/* =========================================================
   TREM
========================================================= */

function buildTrain(){

  const train =
    new THREE.Group();


  const body =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        18,
        3.2,
        3.6
      ),

      mat(
        0x3d4148,
        .42,
        .75
      )

    );


  body.position.y =
    2;


  train.add(body);


  /* janelas */

  for(
    let i=-7;
    i<=7;
    i+=3.5
  ){

    const window =
      new THREE.Mesh(

        new THREE.PlaneGeometry(
          2.2,
          1
        ),

        new THREE.MeshBasicMaterial({
          color:0x9bb6c8
        })

      );


    window.position.set(
      i,
      2.3,
      1.81
    );


    train.add(window);

  }


  /* farol */

  const frontLight =
    new THREE.PointLight(
      0xf4e8c0,
      4,
      20
    );


  frontLight.position.set(
    -9,
    1.8,
    0
  );


  train.add(
    frontLight
  );


  train.position.set(
    70,
    0,
    -10
  );


  train.userData.arrived =
    false;


  world.add(train);


  addInteract(
    train,
    "train"
  );


  animated.push({

    obj:train,

    type:"train"

  });

}


/* =========================================================
   DISTRITO DA CHUVA
========================================================= */

function buildRain(){

  clearWorld();

  floorGrid(64);


  wall(
    64,
    5,
    1,
    0,
    2.5,
    -24
  );


  wall(
    64,
    5,
    1,
    0,
    2.5,
    24
  );


  wall(
    1,
    5,
    48,
    -32,
    2.5,
    0
  );


  wall(
    1,
    5,
    48,
    32,
    2.5,
    0
  );


  for(
    let x=-24;
    x<=24;
    x+=8
  ){

    lamp(
      x,
      4,
      0x9ab6ff
    );

  }


  for(
    let i=0;
    i<22;
    i++
  ){

    const h =
      2 + Math.random()*6;


    box(
      3 + Math.random()*4,
      h,
      3 + Math.random()*4,

      mat(
        0x171b21,
        .9
      ),

      -27 + Math.random()*54,
      h/2,
      -18 + Math.random()*36,

      true
    );

  }


  if(
    !state.inventory.includes(
      "strangeCoin"
    )
  ){

    makePickup(
      "strangeCoin",
      -12,
      8
    );

  }


  makeDoor(
    "PLATAFORMA",
    0,
    -23.6,
    "returnTrain"
  );


  addRain();

}


/* =========================================================
   CHUVA
========================================================= */

function addRain(){

  const count =
    900;


  const geo =
    new THREE.BufferGeometry();


  const arr =
    new Float32Array(
      count * 3
    );


  for(
    let i=0;
    i<count;
    i++
  ){

    arr[i*3] =
      -30 + Math.random()*60;

    arr[i*3+1] =
      Math.random()*18;

    arr[i*3+2] =
      -22 + Math.random()*44;

  }


  geo.setAttribute(
    "position",
    new THREE.BufferAttribute(
      arr,
      3
    )
  );


  const pts =
    new THREE.Points(

      geo,

      new THREE.PointsMaterial({

        color:0xaabbd5,

        size:.045,

        transparent:true,

        opacity:.65

      })

    );


  world.add(pts);


  animated.push({

    obj:pts,

    type:"rain"

  });

}


/* =========================================================
   PARQUE
========================================================= */

function buildPark(){

  clearWorld();

  floorGrid(64);


  for(
    let i=0;
    i<28;
    i++
  ){

    const x =
      -28 + Math.random()*56;

    const z =
      -22 + Math.random()*44;


    cylinder(
      .35,
      4,

      mat(
        0x352a22,
        .95
      ),

      x,
      2,
      z
    );


    const crown =
      new THREE.Mesh(

        new THREE.SphereGeometry(
          1.7,
          12,
          12
        ),

        mat(
          0x17331d,
          .95
        )

      );


    crown.position.set(
      x,
      4.3,
      z
    );


    world.add(crown);

  }


  for(
    let x=-24;
    x<=24;
    x+=6
  ){

    lamp(
      x,
      2,
      0xffd27a
    );

  }


  if(
    !state.inventory.includes(
      "photo"
    )
  ){

    makePickup(
      "photo",
      11,
      -6
    );

  }


  makeDoor(
    "PLATAFORMA",
    0,
    -23.6,
    "returnTrain"
  );

}


/* =========================================================
   HOSPITAL
========================================================= */

function buildHospital(){

  clearWorld();

  floorGrid(58);


  wall(
    58,
    6,
    1,
    0,
    3,
    -21
  );


  wall(
    58,
    6,
    1,
    0,
    3,
    21
  );


  wall(
    1,
    6,
    42,
    -29,
    3,
    0
  );


  wall(
    1,
    6,
    42,
    29,
    3,
    0
  );


  for(
    let x=-22;
    x<=22;
    x+=11
  ){

    pointLight(
      x,
      4.5,
      0,
      0xddeeff,
      1.8,
      12
    );

  }


  for(
    let z=-15;
    z<=15;
    z+=10
  ){

    wall(
      20,
      4,
      .3,
      -18,
      2,
      z,
      0xe4e2df
    );


    wall(
      20,
      4,
      .3,
      18,
      2,
      z,
      0xe4e2df
    );

  }


  makeNpc(
    "Kaio",
    0,
    -10,
    0x293640
  );


  const terminal =
    box(
      1.2,
      1.4,
      .6,

      mat(
        0x22262a,
        .35,
        .65,
        0x102b35,
        .4
      ),

      14,
      .7,
      8,

      true
    );


  addInteract(
    terminal,
    "terminal"
  );


  if(
    !state.inventory.includes(
      "hospitalCard"
    )
  ){

    makePickup(
      "hospitalCard",
      -15,
      12
    );

  }


  makeDoor(
    "PLATAFORMA",
    0,
    20.6,
    "returnTrain"
  );

}


/* =========================================================
   CIDADE ANTIGA
========================================================= */

function buildOldtown(){

  clearWorld();

  floorGrid(66);


  for(
    let i=0;
    i<16;
    i++
  ){

    const x =
      -28 + Math.random()*56;

    const z =
      -22 + Math.random()*44;

    const h =
      3 + Math.random()*6;


    box(
      4 + Math.random()*4,
      h,
      4 + Math.random()*4,

      mat(
        0x4a382a,
        .93
      ),

      x,
      h/2,
      z,

      true
    );

  }


  for(
    let x=-24;
    x<=24;
    x+=8
  ){

    lamp(
      x,
      3,
      0xffc078
    );

  }


  makeNpc(
    "Senhora da Cidade Antiga",
    -6,
    7,
    0x4b342c
  );


  if(
    !state.inventory.includes(
      "oldKey"
    )
  ){

    makePickup(
      "oldKey",
      14,
      -5
    );

  }


  makeDoor(
    "PLATAFORMA",
    0,
    -23.6,
    "returnTrain"
  );

}


/* =========================================================
   TÚNEIS
========================================================= */

function buildTunnels(){

  clearWorld();

  floorGrid(50);


  wall(
    50,
    5,
    1,
    0,
    2.5,
    -15
  );


  wall(
    50,
    5,
    1,
    0,
    2.5,
    15
  );


  wall(
    1,
    5,
    30,
    -25,
    2.5,
    0
  );


  wall(
    1,
    5,
    30,
    25,
    2.5,
    0
  );


  for(
    let x=-20;
    x<=20;
    x+=5
  ){

    pointLight(
      x,
      3.8,
      0,
      0xb9c7d8,
      1.1,
      8
    );

  }


  for(
    let i=0;
    i<15;
    i++
  ){

    propCrate(
      -20 + Math.random()*40,
      -11 + Math.random()*22
    );

  }


  if(
    !state.inventory.includes(
      "masterKey"
    )
  ){

    makePickup(
      "masterKey",
      -18,
      -8
    );

  }


  const terminal =
    box(
      1.4,
      1.2,
      .8,

      mat(
        0x22252a,
        .3,
        .7,
        0x1a0c26,
        .8
      ),

      16,
      .6,
      -6,

      true
    );


  addInteract(
    terminal,
    "loopTerminal"
  );


  makeDoor(
    "VOLTAR",
    0,
    14.6,
    "returnTrain"
  );

}


/* =========================================================
   SALA 0
========================================================= */

function buildRoom0(){

  clearWorld();

  floorGrid(38);


  wall(
    38,
    6,
    1,
    0,
    3,
    -14
  );


  wall(
    38,
    6,
    1,
    0,
    3,
    14
  );


  wall(
    1,
    6,
    28,
    -19,
    3,
    0
  );


  wall(
    1,
    6,
    28,
    19,
    3,
    0
  );


  pointLight(
    0,
    5,
    0,
    0x9b6cff,
    3.4,
    26
  );


  const core =
    new THREE.Mesh(

      new THREE.IcosahedronGeometry(
        2.2,
        2
      ),

      mat(
        0x30143e,
        .18,
        .4,
        0x652781,
        1.6
      )

    );


  core.position.set(
    0,
    2,
    -3
  );


  world.add(core);


  animated.push({

    obj:core,

    type:"core"

  });


  const panel =
    box(
      2,
      1.4,
      .7,

      mat(
        0x17151d,
        .3,
        .7,
        0x341347,
        .9
      ),

      0,
      .7,
      6,

      true
    );


  addInteract(
    panel,
    "finalPanel"
  );

}


/* =========================================================
   CONSTRUIR ÁREA
========================================================= */

function buildArea(id){

  state.location =
    id;


  const area =
    AREAS[id];


  scene.fog =
    new THREE.FogExp2(
      area.fog,
      area.density
    );


  scene.background =
    new THREE.Color(
      area.fog
    );


  if(id==="central"){

    buildCentral();

  }

  else if(id==="rain"){

    buildRain();

  }

  else if(id==="park"){

    buildPark();

  }

  else if(id==="hospital"){

    buildHospital();

  }

  else if(id==="oldtown"){

    buildOldtown();

  }

  else if(id==="tunnels"){

    buildTunnels();

  }

  else{

    buildRoom0();

  }


  camera.position.set(
    ...area.spawn
  );


  state.pos = {

    x:area.spawn[0],

    y:area.spawn[1],

    z:area.spawn[2]

  };


  $("#location").textContent =
    area.label;


  saveGame();

}


/* =========================================================
   INVENTÁRIO
========================================================= */

function has(id){

  return state.inventory.includes(id);

}


function give(id){

  if(has(id)) return;


  state.inventory.push(id);


  if(id==="ticket")
    state.flags.gotTicket=true;


  if(id==="flashlight")
    state.flags.flashlightOwned=true;


  if(id==="photo")
    state.flags.photoFound=true;


  if(id==="redNote")
    state.flags.redNoteFound=true;


  state.clues++;


  notify(
    `${ITEMS[id].icon} ${ITEMS[id].name} adicionado ao inventário.`
  );


  updateUI();

  saveGame();

}


function addClue(text){

  state.clues++;


  notify(
    "🔎 " + text
  );


  updateUI();

  saveGame();

}


/* =========================================================
   MISSÕES
========================================================= */

function completeMission(id){

  if(
    state.missions[id] &&
    !state.missions[id].complete
  ){

    state.missions[id].complete =
      true;

    state.xp += 40;


    notify(
      `✓ Missão concluída: ${state.missions[id].name}`
    );

  }

}


function mission(id){

  return state.missions[id];

}


function currentMission(){

  for(
    const id of [
      "wake",
      "olivia",
      "ticket",
      "train",
      "hospital",
      "tunnel",
      "room0"
    ]
  ){

    if(
      !mission(id).complete
    ){

      return mission(id).desc;

    }

  }


  return "A verdade está diante de você.";

}


/* =========================================================
   HUD
========================================================= */

function updateUI(){

  $("#lives").textContent =
    state.lives;


  $("#energy").textContent =
    Math.round(state.energy);


  $("#clues").textContent =
    state.clues;


  $("#coins").textContent =
    state.coins;


  $("#missionText").textContent =
    currentMission();


  $("#clockHud").textContent =
    toClock(state.time);

}


function toClock(m){

  m =
    Math.floor(m) % 1440;


  return (

    String(
      Math.floor(m/60)
    ).padStart(2,"0")

    +

    ":"

    +

    String(
      m%60
    ).padStart(2,"0")

  );

}


/* =========================================================
   DIÁLOGOS
========================================================= */

function openDialogue(
  name,
  lines,
  onEnd=null,
  choices=null
){

  activeDialogue = {

    name,

    lines,

    onEnd,

    choices

  };


  dialogueIndex = 0;


  controls.unlock();


  $("#dialogue")
    .classList
    .remove("hidden");


  renderDialogue();

}


function renderDialogue(){

  $("#dialogueName").textContent =
    activeDialogue.name;


  $("#dialogueText").textContent =
    activeDialogue.lines[
      dialogueIndex
    ] || "";


  $("#dialogueChoices").innerHTML =
    "";


  const atEnd =
    dialogueIndex >=
    activeDialogue.lines.length-1;


  $("#dialogueNext").style.display =
    (
      atEnd &&
      activeDialogue.choices
    )

      ? "none"

      : "inline-block";


  if(
    atEnd &&
    activeDialogue.choices
  ){

    for(
      const choice
      of activeDialogue.choices
    ){

      const button =
        document.createElement(
          "button"
        );


      button.textContent =
        choice.text;


      button.addEventListener(
        "click",
        () => {

          closeDialogue();

          choice.action?.();

        }
      );


      $("#dialogueChoices")
        .appendChild(button);

    }

  }

}


function nextDialogue(){

  if(!activeDialogue)
    return;


  dialogueIndex++;


  if(
    dialogueIndex >=
    activeDialogue.lines.length
  ){

    const callback =
      activeDialogue.onEnd;


    closeDialogue();


    callback?.();


    return;

  }


  renderDialogue();

}


function closeDialogue(){

  $("#dialogue")
    .classList
    .add("hidden");


  activeDialogue =
    null;

}


/* =========================================================
   NPCS
========================================================= */

function npcTalk(name){

  if(name==="Olivia"){

    if(
      !state.flags.metOlivia
    ){

      state.flags.metOlivia =
        true;


      completeMission(
        "wake"
      );


      completeMission(
        "olivia"
      );


      openDialogue(

        "OLIVIA",

        [

          "Você acordou... então ainda há tempo.",

          "Meu nome é Olivia. Esta estação foi fechada, mas continua recebendo passageiros.",

          "Se quiser respostas, encontre o bilhete. Ele sempre volta para a plataforma."

        ],

        () => {

          notify(
            "Nova missão: O bilhete impossível"
          );

        }

      );

    }

    else if(
      !has("ticket")
    ){

      openDialogue(

        "OLIVIA",

        [

          "O bilhete costuma aparecer perto dos bancos.",

          "Não tente entender a data impressa nele ainda."

        ]

      );

    }

    else if(
      !state.flags.trainUnlocked
    ){

      state.flags.trainUnlocked =
        true;


      completeMission(
        "ticket"
      );


      openDialogue(

        "OLIVIA",

        [

          "Então ele escolheu você.",

          "À meia-noite, o trem vai chegar. Fale com o Condutor.",

          "E Yuri... se ele disser que já conhece você, não responda rápido demais."

        ]

      );

    }

    else{

      openDialogue(

        "OLIVIA",

        [

          "Cada lugar guarda uma parte da mesma noite.",

          "Hospital. Cidade Antiga. Túneis.",

          "Quando as peças se encaixarem, a Sala 0 vai aparecer."

        ]

      );

    }

  }


  if(name==="Condutor"){

    state.flags.metConductor =
      true;


    if(!has("ticket")){

      return openDialogue(

        "CONDUTOR",

        [

          "Sem bilhete, não existe viagem.",

          "Sem viagem, não existe lembrança."

        ]

      );

    }


    if(
      !state.flags.trainUnlocked
    ){

      state.flags.trainUnlocked =
        true;

    }


    completeMission(
      "train"
    );


    openDialogue(

      "CONDUTOR",

      [

        "Bilhete válido.",

        "Destino?"

      ],

      () => openTrainMenu()

    );

  }


  if(name==="Kaio"){

    if(
      !state.flags.metKaio
    ){

      state.flags.metKaio =
        true;


      completeMission(
        "hospital"
      );


      state.flags.oldtownUnlocked =
        true;


      openDialogue(

        "KAIO",

        [

          "Yuri?",

          "Não... isso não pode ser.",

          "Seu nome está nos registros do acidente.",

          "Eu desapareci naquela noite. Pelo menos é isso que os arquivos dizem.",

          "Procure a Cidade Antiga. Há alguém lá que lembra da linha antes de ela existir."

        ],

        () => {

          addClue(
            "Kaio reconheceu Yuri de registros antigos."
          );

        }

      );

    }

    else{

      openDialogue(

        "KAIO",

        [

          "A estação não prende pessoas. Ela prende momentos.",

          "Você precisa encontrar o instante em que tudo começou."

        ]

      );

    }

  }


  if(
    name==="Senhora da Cidade Antiga"
  ){

    state.flags.tunnelUnlocked =
      true;


    openDialogue(

      "SENHORA",

      [

        "A companhia cavou um nível abaixo dos mapas oficiais.",

        "Chamavam de Sala 0.",

        "A chave que você encontrou abre os túneis. Mas a Sala 0 só aparece para quem já viu a própria memória quebrar."

      ],

      () => {

        addClue(
          "A Sala 0 fica abaixo da estação."
        );

      }

    );

  }

}


/* =========================================================
   INTERAÇÃO
========================================================= */

function interact(){

  if(!currentInteract)
    return;


  const u =
    currentInteract.userData;


  /* NPC */

  if(
    u.type==="npc"
  ){

    return npcTalk(
      u.name
    );

  }


  /* ITEM */

  if(
    u.type==="pickup"
  ){

    give(
      u.itemId
    );


    currentInteract.visible =
      false;


    currentInteract.userData.interactable =
      false;


    if(
      u.itemId==="ticket"
    ){

      completeMission(
        "ticket"
      );

    }


    return;

  }


  /* RELÓGIO */

  if(
    u.type==="clock"
  ){

    addClue(
      "O relógio está parado em 00:00, mas o ponteiro dos segundos continua se movendo."
    );


    return;

  }


  /* ARQUIVO */

  if(
    u.type==="archiveDoor"
  ){

    if(
      !has("oldKey")
    ){

      return notify(
        "A porta do arquivo está trancada."
      );

    }


    if(
      !has("photo")
    ){

      give(
        "photo"
      );

    }


    return notify(
      "O arquivo contém fotografias e relatórios incompletos."
    );

  }


  /* TÚNEL */

  if(
    u.type==="tunnelDoor"
  ){

    if(
      !state.flags.tunnelUnlocked &&
      !has("oldKey")
    ){

      return notify(
        "Você ainda não sabe como abrir esta porta."
      );

    }


    completeMission(
      "tunnel"
    );


    buildArea(
      "tunnels"
    );


    return;

  }


  /* SALA 0 */

  if(
    u.type==="room0Door"
  ){

    if(
      !has("masterKey") ||
      !state.flags.terminalSolved
    ){

      return notify(
        "A porta não reage."
      );

    }


    completeMission(
      "room0"
    );


    buildArea(
      "room0"
    );


    return;

  }


  /* TERMINAL HOSPITAL */

  if(
    u.type==="terminal"
  ){

    openPuzzle(

      "ARQUIVO 404",

      "Digite o número do paciente mencionado nos registros.",

      "0404",

      ok => {

        if(ok){

          state.flags.hospitalUnlocked =
            true;

          state.flags.oldtownUnlocked =
            true;


          addClue(
            "O arquivo 404 pertence a Kaio."
          );

        }

      }

    );


    return;

  }


  /* TERMINAL TÚNEL */

  if(
    u.type==="loopTerminal"
  ){

    openPuzzle(

      "TERMINAL SUBTERRÂNEO",

      "Quatro dígitos. A hora em que o relógio da estação parou.",

      "0000",

      ok => {

        if(ok){

          state.flags.terminalSolved =
            true;

          state.flags.room0Unlocked =
            true;


          addClue(
            "O terminal revelou a existência da Sala 0."
          );

        }

      }

    );


    return;

  }


  /* TREM */

  if(
    u.type==="train" ||
    u.type==="returnTrain"
  ){

    if(
      !has("ticket")
    ){

      return notify(
        "Você precisa de um bilhete."
      );

    }


    openTrainMenu();


    return;

  }


  /* FINAL */

  if(
    u.type==="finalPanel"
  ){

    return triggerEnding();

  }

}


/* =========================================================
   PUZZLES
========================================================= */

function openPuzzle(
  title,
  text,
  answer,
  callback
){

  controls.unlock();


  $("#puzzleTitle").textContent =
    title;


  $("#puzzleText").textContent =
    text;


  $("#puzzleInput").value =
    "";


  $("#puzzleFeedback").textContent =
    "";


  $("#puzzle")
    .classList
    .remove("hidden");


  $("#puzzleSubmit").onclick =
    () => {

      const correct =
        $("#puzzleInput")
          .value
          .trim() === answer;


      $("#puzzleFeedback")
        .textContent =
          correct
            ? "Acesso autorizado."
            : "Código incorreto.";


      if(correct){

        setTimeout(
          () => {

            $("#puzzle")
              .classList
              .add("hidden");


            callback(true);

          },

          500
        );

      }

    };

}


/* =========================================================
   MENU DO TREM
========================================================= */

function openTrainMenu(){

  controls.unlock();


  $("#trainMenu")
    .classList
    .remove("hidden");


  const destinations =
    $("#destinations");


  destinations.innerHTML =
    "";


  const options = [

    [
      "central",
      "Estação Central",
      true
    ],

    [
      "rain",
      "Distrito da Chuva",
      true
    ],

    [
      "park",
      "Parque das Lanternas",
      state.clues >= 2
    ],

    [
      "hospital",
      "Hospital São Lucas",
      state.flags.trainUnlocked
    ],

    [
      "oldtown",
      "Cidade Antiga",
      state.flags.oldtownUnlocked
    ],

    [
      "tunnels",
      "Túneis",
      state.flags.tunnelUnlocked
    ],

    [
      "room0",
      "Sala 0",
      state.flags.room0Unlocked &&
      has("masterKey") &&
      state.flags.terminalSolved
    ]

  ];


  for(
    const [
      id,
      name,
      unlocked
    ]
    of options
  ){

    const button =
      document.createElement(
        "button"
      );


    button.className =
      "destination" +
      (
        unlocked
          ? ""
          : " locked"
      );


    button.textContent =
      unlocked
        ? name
        : `🔒 ${name}`;


    button.disabled =
      !unlocked;


    button.onclick =
      () => {

        state.trainTrips++;


        $("#trainMenu")
          .classList
          .add("hidden");


        buildArea(id);


        notify(
          `🚇 Próxima parada: ${name}`
        );

      };


    destinations.appendChild(
      button
    );

  }

}


/* =========================================================
   FINAIS
========================================================= */

function triggerEnding(){

  let type;

  let title;

  let text;


  if(
    state.clues >= 9 &&
    has("redNote") &&
    has("photo") &&
    state.flags.terminalSolved
  ){

    type =
      "secret";


    title =
      "A VERDADE";


    text =
      "Yuri percebe que não entrou na estação naquela noite: uma parte dele nunca saiu. A Sala 0 não é um lugar, mas o ponto onde o acidente continua se repetindo. Ao desligar o núcleo, ele devolve o tempo às pessoas presas no loop — incluindo Kaio. Olivia observa o primeiro amanhecer em anos.";

  }

  else if(
    state.clues >= 7 &&
    state.flags.terminalSolved
  ){

    type =
      "truth";


    title =
      "O ÚLTIMO TREM";


    text =
      "Yuri interrompe o ciclo e escapa no último trem. Ele leva consigo registros suficientes para provar que a estação escondia algo impossível, mas algumas respostas permanecem enterradas abaixo da cidade.";

  }

  else if(
    state.trainTrips >= 8
  ){

    type =
      "CICLO";


    title =
      "CICLO";


    text =
      "As portas se abrem. Yuri pisa na plataforma e reconhece cada rachadura do chão. Olivia o encara como se fosse a primeira vez. O relógio marca 23:47.";

  }

  else{

    type =
      "incomplete";


    title =
      "AINDA NÃO ACABOU";


    text =
      "Yuri alcança o centro do mistério cedo demais. A estação continua funcionando, esperando que ele retorne com as peças que faltam.";

  }


  if(
    !state.endings.includes(type)
  ){

    state.endings.push(type);

  }


  saveGame();


  controls.unlock();


  $("#endingTitle").textContent =
    title;


  $("#endingText").textContent =
    text;


  $("#ending")
    .classList
    .remove("hidden");

}


/* =========================================================
   INVENTÁRIO
========================================================= */

function renderInventory(){

  const grid =
    $("#inventoryGrid");


  grid.innerHTML =
    "";


  if(
    !state.inventory.length
  ){

    grid.innerHTML =
      '<p class="muted">Nenhum item encontrado.</p>';


    return;

  }


  for(
    const id
    of state.inventory
  ){

    const item =
      ITEMS[id];


    const card =
      document.createElement(
        "div"
      );


    card.className =
      "item-card";


    card.innerHTML = `

      <b>
        ${item.icon}
        ${item.name}
      </b>

      <small>
        ${item.desc}
      </small>

    `;


    grid.appendChild(
      card
    );

  }

}


/* =========================================================
   MISSÕES
========================================================= */

function renderMissions(){

  const list =
    $("#missionsList");


  list.innerHTML =
    "";


  for(
    const [
      id,
      missionData
    ]
    of Object.entries(
      state.missions
    )
  ){

    const card =
      document.createElement(
        "div"
      );


    const active =
      currentMission() ===
      missionData.desc;


    card.className =
      "mission-card " +

      (
        missionData.complete
          ? "complete"
          : active
            ? "active"
            : ""
      );


    card.innerHTML = `

      <b>
        ${
          missionData.complete
            ? "✓ "
            : ""
        }

        ${missionData.name}
      </b>

      <small>
        ${missionData.desc}
      </small>

    `;


    list.appendChild(
      card
    );

  }

}


/* =========================================================
   MODAIS
========================================================= */

function toggleModal(id){

  const element =
    $("#" + id);


  const opening =
    element.classList.contains(
      "hidden"
    );


  if(opening){

    controls.unlock();

  }


  if(id==="inventory"){

    renderInventory();

  }


  if(id==="missions"){

    renderMissions();

  }


  element.classList.toggle(
    "hidden"
  );

}


/* =========================================================
   NOTIFICAÇÃO
========================================================= */

function notify(text){

  const notification =
    $("#notification");


  notification.textContent =
    text;


  notification.style.display =
    "block";


  clearTimeout(
    notificationTimer
  );


  notificationTimer =
    setTimeout(
      () => {

        notification.style.display =
          "none";

      },

      3200
    );

}


/* =========================================================
   SAVE
========================================================= */

function saveGame(){

  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify(state)
  );

}


function loadGame(){

  const raw =
    localStorage.getItem(
      SAVE_KEY
    );


  if(!raw)
    return false;


  try{

    const saved =
      JSON.parse(raw);


    const base =
      defaultState();


    state =
      Object.assign(
        base,
        saved
      );


    state.flags =
      Object.assign(
        base.flags,
        saved.flags || {}
      );


    state.missions =
      Object.assign(
        base.missions,
        saved.missions || {}
      );


    return true;

  }

  catch{

    return false;

  }

}


function deleteSave(){

  localStorage.removeItem(
    SAVE_KEY
  );


  state =
    defaultState();


  $("#continueBtn").disabled =
    true;


  notify(
    "Salvamento apagado."
  );

}


/* =========================================================
   INICIAR JOGO
========================================================= */

function startGame(
  load=false
){

  if(load){

    if(
      !loadGame()
    ){

      state =
        defaultState();

    }

  }

  else{

    state =
      defaultState();

  }


  $("#menu")
    .classList
    .add("hidden");


  $("#game")
    .classList
    .remove("hidden");


  gameStarted =
    true;


  buildArea(
    state.location || "central"
  );


  updateUI();


  notify(
    "Clique na tela para controlar Yuri."
  );

}


/* =========================================================
   BOTÕES DO MENU
========================================================= */

$("#newGameBtn").onclick =
  () => startGame(false);


$("#continueBtn").onclick =
  () => startGame(true);


$("#deleteSaveBtn").onclick =
  deleteSave;


$("#continueBtn").disabled =
  !localStorage.getItem(
    SAVE_KEY
  );


/* =========================================================
   BOTÕES DE DIÁLOGO
========================================================= */

$("#dialogueNext").onclick =
  nextDialogue;


$("#endingRestart").onclick =
  () => {

    localStorage.removeItem(
      SAVE_KEY
    );

    location.reload();

  };


/* =========================================================
   FECHAR MODAIS
========================================================= */

$$(
  "[data-close]"
)
.forEach(
  button => {

    button.onclick =
      () => {

        $("#" + button.dataset.close)
          .classList
          .add("hidden");

      };

  }
);


/* =========================================================
   MOUSE / POINTER LOCK
========================================================= */

renderer.domElement.addEventListener(
  "click",
  () => {

    if(
      gameStarted &&
      !activeDialogue &&
      !$$(".modal:not(.hidden)").length
    ){

      controls.lock();

    }

  }
);


/* =========================================================
   TECLADO
========================================================= */

addEventListener(
  "keydown",
  event => {

    keys[event.code] =
      true;


    if(
      event.code==="KeyE" &&
      !activeDialogue
    ){

      interact();

    }


    if(
      event.code==="KeyF" &&
      state.flags.flashlightOwned
    ){

      flashlight.intensity =
        flashlight.intensity
          ? 0
          : 4.5;


      $("#flashlightHud")
        .textContent =
          flashlight.intensity
            ? "🔦 ON"
            : "🔦 OFF";

    }


    if(
      event.code==="KeyI"
    ){

      toggleModal(
        "inventory"
      );

    }


    if(
      event.code==="KeyM"
    ){

      toggleModal(
        "missions"
      );

    }

  }
);


addEventListener(
  "keyup",
  event => {

    keys[event.code] =
      false;

  }
);


/* =========================================================
   CONTROLES MOBILE
========================================================= */

const mobile = {

  forward:false,

  back:false,

  left:false,

  right:false

};


$$(
  "[data-move]"
)
.forEach(
  button => {

    const key =
      button.dataset.move;


    const on =
      event => {

        event.preventDefault();

        mobile[key] =
          true;

      };


    const off =
      event => {

        event.preventDefault();

        mobile[key] =
          false;

      };


    button.addEventListener(
      "pointerdown",
      on
    );


    button.addEventListener(
      "pointerup",
      off
    );


    button.addEventListener(
      "pointercancel",
      off
    );


    button.addEventListener(
      "pointerleave",
      off
    );

  }
);


$("#mobileInteract").onclick =
  interact;


/* =========================================================
   MOVIMENTO
========================================================= */

function move(delta){

  if(
    !controls.isLocked
  ){

    return;

  }


  let dx=0;

  let dz=0;


  if(
    keys.KeyW ||
    mobile.forward
  ){

    dz -= 1;

  }


  if(
    keys.KeyS ||
    mobile.back
  ){

    dz += 1;

  }


  if(
    keys.KeyA ||
    mobile.left
  ){

    dx -= 1;

  }


  if(
    keys.KeyD ||
    mobile.right
  ){

    dx += 1;

  }


  if(
    dx ||
    dz
  ){

    const length =
      Math.hypot(
        dx,
        dz
      );


    dx /= length;

    dz /= length;


    const sprint =
      keys.ShiftLeft ||
      keys.ShiftRight;


    const speed =
      (
        sprint
          ? 7.5
          : 5.1
      ) * delta;


    controls.moveRight(
      dx * speed
    );


    controls.moveForward(
      -dz * speed
    );


    state.energy =
      Math.max(
        0,
        state.energy -
        (
          sprint
            ? .9
            : .18
        ) *
        delta *
        10
      );

  }

  else{

    state.energy =
      Math.min(
        100,
        state.energy +
        .08 *
        delta *
        10
      );

  }


  camera.position.y =
    1.7;


  camera.position.x =
    THREE.MathUtils.clamp(
      camera.position.x,
      -33,
      33
    );


  camera.position.z =
    THREE.MathUtils.clamp(
      camera.position.z,
      -21,
      21
    );


  state.pos = {

    x:camera.position.x,

    y:camera.position.y,

    z:camera.position.z

  };

}


/* =========================================================
   DETECÇÃO DE INTERAÇÃO
========================================================= */

function detect(){

  raycaster.setFromCamera(
    new THREE.Vector2(0,0),
    camera
  );


  const hits =
    raycaster.intersectObjects(
      interactables.filter(
        object =>
          object.visible &&
          object.userData.interactable
      ),
      true
    );


  let root =
    null;


  if(
    hits.length &&
    hits[0].distance < 4.5
  ){

    root =
      hits[0].object;


    while(
      root.parent &&
      root.parent !== world &&
      !root.userData.interactable
    ){

      root =
        root.parent;

    }


    if(
      !root.userData.interactable
    ){

      root =
        null;

    }

  }


  currentInteract =
    root;


  $("#interactionHint")
    .style
    .display =
      root
        ? "flex"
        : "none";

}


/* =========================================================
   ANIMAÇÕES
========================================================= */

function animateWorld(
  delta,
  time
){

  for(
    const animation
    of animated
  ){

    /* itens */

    if(
      animation.type==="bob"
    ){

      animation.obj.position.y =
        animation.baseY +
        Math.sin(
          time*2 +
          animation.phase
        ) *
        .08;


      animation.obj.rotation.y +=
        delta*.6;

    }


    /* trem */

    if(
      animation.type==="train"
    ){

      if(
        state.flags.trainUnlocked &&
        state.time >= 1438 &&
        !animation.obj.userData.arrived
      ){

        animation.obj.position.x -=
          delta*12;


        if(
          animation.obj.position.x <= 0
        ){

          animation.obj.position.x =
            0;


          animation.obj.userData.arrived =
            true;


          notify(
            "🚇 O Último Trem chegou à plataforma."
          );

        }

      }

    }


    /* chuva */

    if(
      animation.type==="rain"
    ){

      const positions =
        animation.obj.geometry
          .attributes
          .position
          .array;


      for(
        let i=1;
        i<positions.length;
        i+=3
      ){

        positions[i] -=
          delta*11;


        if(
          positions[i] < 0
        ){

          positions[i] =
            18;

        }

      }


      animation.obj.geometry
        .attributes
        .position
        .needsUpdate =
        true;

    }


    /* núcleo da Sala 0 */

    if(
      animation.type==="core"
    ){

      animation.obj.rotation.x +=
        delta*.18;


      animation.obj.rotation.y +=
        delta*.3;

    }

  }

}


/* =========================================================
   LOOP
========================================================= */

function loop(){

  requestAnimationFrame(
    loop
  );


  const delta =
    Math.min(
      clock.getDelta(),
      .05
    );


  const time =
    performance.now()/1000;


  if(gameStarted){

    move(delta);

    detect();

    animateWorld(
      delta,
      time
    );


    state.time +=
      delta*.35;


    if(
      state.time >= 1440
    ){

      state.time -=
        1440;

    }


    updateUI();

  }


  renderer.render(
    scene,
    camera
  );

}


/* =========================================================
   REDIMENSIONAMENTO
========================================================= */

addEventListener(
  "resize",
  () => {

    camera.aspect =
      innerWidth /
      innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(
      innerWidth,
      innerHeight
    );

  }
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

setTimeout(
  () => {

    $("#loading")
      .classList
      .add("hidden");

  },
  1200
);


/* autosave */

setInterval(
  () => {

    if(gameStarted){

      saveGame();

    }

  },
  8000
);


/* inicia */

loop();
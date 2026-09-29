import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import {
  PointerLockControls
} from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/PointerLockControls.js";


const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const SAVE_KEY = "ultimoTrem3D-save-v3";


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
    desc:"'Não deixe o trem chegar à Sala 0.'"
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
    desc:"No verso: 'O último passageiro escolhe o destino.'"
  }

};


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


const defaultState = () => ({

  lives:3,

  energy:100,

  coins:0,

  clues:0,

  xp:0,

  level:1,

  time:23*60+47,

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


const AREAS = {

  central:{
    label:"ESTAÇÃO CENTRAL",
    spawn:[0,1.7,15],
    fog:0x050609,
    density:.030
  },

  rain:{
    label:"DISTRITO DA CHUVA",
    spawn:[0,1.7,10],
    fog:0x0d1117,
    density:.035
  },

  park:{
    label:"PARQUE DAS LANTERNAS",
    spawn:[0,1.7,12],
    fog:0x0d130f,
    density:.023
  },

  hospital:{
    label:"HOSPITAL SÃO LUCAS",
    spawn:[0,1.7,14],
    fog:0x101214,
    density:.02
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
    fog:0x070707,
    density:.04
  },

  room0:{
    label:"SALA 0",
    spawn:[0,1.7,9],
    fog:0x09060c,
    density:.018
  }

};


const scene = new THREE.Scene();

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


/* ILUMINAÇÃO GERAL */

scene.add(
  new THREE.HemisphereLight(
    0x4b5260,
    0x030405,
    .16
  )
);


const moon =
  new THREE.DirectionalLight(
    0x8d98aa,
    .10
  );

moon.position.set(
  15,
  30,
  10
);

scene.add(moon);


/* LANTERNA */

const flashlight =
  new THREE.SpotLight(
    0xffffff,
    0,
    55,
    Math.PI / 6,
    .62,
    1.0
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


/* MATERIAIS */

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


/* CUBO */

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


  if(collide)
    colliders.push(mesh);


  return mesh;

}


/* CILINDRO */

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


/* PLACA */

function label(
  text,
  w=5,
  h=1.1
){

  const c =
    document.createElement(
      "canvas"
    );


  c.width = 768;

  c.height = 192;


  const ctx =
    c.getContext("2d");


  ctx.fillStyle =
    "#111118";

  ctx.fillRect(
    0,
    0,
    c.width,
    c.height
  );


  ctx.strokeStyle =
    "#6e5b86";

  ctx.lineWidth = 7;


  ctx.strokeRect(
    4,
    4,
    c.width - 8,
    c.height - 8
  );


  ctx.fillStyle =
    "#e8e4ef";


  ctx.font =
    "700 54px Arial";


  ctx.textAlign =
    "center";


  ctx.textBaseline =
    "middle";


  ctx.fillText(
    text,
    c.width / 2,
    c.height / 2
  );


  const t =
    new THREE.CanvasTexture(c);


  t.colorSpace =
    THREE.SRGBColorSpace;


  return new THREE.Mesh(

    new THREE.PlaneGeometry(
      w,
      h
    ),

    new THREE.MeshBasicMaterial({
      map:t,
      transparent:true
    })

  );

}


/* INTERAÇÃO */

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


/* LUZES */

function pointLight(
  x,
  y,
  z,
  color=0xdde2ff,
  intensity=2.4,
  dist=14
){

  const l =
    new THREE.PointLight(
      color,
      intensity,
      dist
    );


  l.position.set(
    x,
    y,
    z
  );


  world.add(l);


  return l;

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
      0x303039,
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
    1.45,
    12
  );

}


/* PISO */

function floorGrid(
  size=60
){

  box(
    size,
    .3,
    size,

    mat(
      0x101115,
      .97
    ),

    0,
    -.2,
    0,

    true
  );

}


/* LIMPA O CENÁRIO */

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


/* PAREDE */

function wall(
  w,
  h,
  d,
  x,
  y,
  z,
  c=0x16161b
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


/* CAIXA */

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


/* NPC */

function makeNpc(
  name,
  x,
  z,
  color=0x352941
){

  const g =
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


  g.add(body);


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


  g.add(head);


  g.position.set(
    x,
    0,
    z
  );


  world.add(g);


  addInteract(
    g,
    "npc",
    {name}
  );


  return g;

}


/* ITEM */

function makePickup(
  id,
  x,
  z
){

  const item =
    ITEMS[id];


  const m =
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


  m.position.set(
    x,
    .55,
    z
  );


  addInteract(
    m,
    "pickup",
    {itemId:id}
  );


  world.add(m);


  animated.push({

    obj:m,

    type:"bob",

    baseY:.55,

    phase:
      Math.random() * 6.28

  });


  return m;

}


/* PORTA */

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
        0x29242e,
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


  const s =
    label(
      labelText,
      2.0,
      .52
    );


  s.position.set(
    x,
    2.2,
    z +
      (rot === 0 ? .14 : 0)
  );


  s.rotation.y =
    rot;


  world.add(s);


  return door;

}


/* BANCOS */

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


/* ESTAÇÃO CENTRAL */

function buildCentral(){

  clearWorld();


  /*
    IMPORTANTE:

    Agora não existem paredes pretas
    próximas do jogador.

    O piso é enorme e a névoa
    desaparece com o horizonte.
  */

  floorGrid(700);


  /* PLATAFORMA */

  box(
    420,
    .6,
    6,

    mat(
      0x28282d,
      .92
    ),

    0,
    .15,
    -10,

    true
  );


  /* TRILHOS */

  box(
    70,
    .15,
    .14,

    mat(
      0x686870,
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
      0x686870,
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


  /* POSTES */

  for(
    let x=-28;
    x<=28;
    x+=8
  ){

    lamp(
      x,
      3.2,
      0x87919c
    );

  }


  /* COLUNAS DISTANTES */

  for(
    let x=-28;
    x<=28;
    x+=10
  ){

    wall(
      1.1,
      7,
      1.1,

      x,
      3.5,
      -3,

      0x18191f
    );


    wall(
      1.1,
      7,
      1.1,

      x,
      3.5,
      15,

      0x18191f
    );

  }


  benches();


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


  /* OLIVIA */

  makeNpc(
    "Olivia",
    -8,
    3,
    0x372946
  );


  /* CONDUTOR */

  makeNpc(
    "Condutor",
    17,
    -5,
    0x20252c
  );


  /* ITEMS */

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


  /* RELÓGIO DA ESTAÇÃO */

  const clk =
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


  clk.rotation.x =
    Math.PI / 2;


  clk.position.set(
    0,
    4.3,
    -21.25
  );


  world.add(clk);


  /* PORTAS */

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


  /* CAIXAS */

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


/* TREM */

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


  for(
    let i=-7;
    i<=7;
    i+=3.5
  ){

    const w =
      new THREE.Mesh(

        new THREE.PlaneGeometry(
          2.2,
          1
        ),

        new THREE.MeshBasicMaterial({
          color:0x9bb6c8
        })

      );


    w.position.set(
      i,
      2.3,
      1.81
    );


    train.add(w);

  }


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


  train.add(frontLight);


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


/* CHUVA */

function buildRain(){

  clearWorld();

  floorGrid(64);

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


/* CHUVA */

function addRain(){

  const count = 700;

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

        size:.04,

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


/* PARQUE */

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


/* HOSPITAL */

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


/* CIDADE ANTIGA */

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


/* TÚNEIS */

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


  const term =
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
    term,
    "loopTerminal"
  );


  makeDoor(
    "VOLTAR",
    0,
    14.6,
    "returnTrain"
  );

}


/* SALA 0 */

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


/* CONSTRÓI ÁREA */

function buildArea(id){

  state.location =
    id;


  const a =
    AREAS[id];


  scene.fog =
    new THREE.FogExp2(
      a.fog,
      a.density
    );


  scene.background =
    new THREE.Color(
      a.fog
    );


  if(id==="central")
    buildCentral();

  else if(id==="rain")
    buildRain();

  else if(id==="park")
    buildPark();

  else if(id==="hospital")
    buildHospital();

  else if(id==="oldtown")
    buildOldtown();

  else if(id==="tunnels")
    buildTunnels();

  else
    buildRoom0();


  camera.position.set(
    ...a.spawn
  );


  state.pos = {
    x:a.spawn[0],
    y:a.spawn[1],
    z:a.spawn[2]
  };


  $("#location").textContent =
    a.label;


  saveGame();

}


/* INVENTÁRIO */

function has(id){

  return state.inventory.includes(id);

}


function give(id){

  if(has(id))
    return;


  state.inventory.push(id);


  if(id==="ticket")
    state.flags.gotTicket = true;


  if(id==="flashlight")
    state.flags.flashlightOwned = true;


  if(id==="photo")
    state.flags.photoFound = true;


  if(id==="redNote")
    state.flags.redNoteFound = true;


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


/* ATUALIZA INTERFACE */

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


  /*
    IMPORTANTE:

    O relógio não é mais substituído
    apenas por texto.

    Ele mantém o rótulo HORA e
    mostra somente o horário atual.
  */

  $("#clockHud").innerHTML =

    `<span class="clock-label">HORA</span>
     <strong>${toClock(state.time)}</strong>`;

}


function toClock(m){

  m =
    Math.floor(m) % 1440;


  return (

    `${String(
      Math.floor(m / 60)
    ).padStart(2,"0")}:` +

    `${String(
      m % 60
    ).padStart(2,"0")}`

  );

}


/* DIÁLOGOS */

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

  $("#dialogueName")
    .textContent =
    activeDialogue.name;


  $("#dialogueText")
    .textContent =
    activeDialogue.lines[
      dialogueIndex
    ] || "";


  $("#dialogueChoices")
    .innerHTML = "";


  const atEnd =
    dialogueIndex >=
    activeDialogue.lines.length - 1;


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
      const ch of
      activeDialogue.choices
    ){

      const b =
        document.createElement(
          "button"
        );


      b.textContent =
        ch.text;


      b.addEventListener(
        "click",
        () => {

          closeDialogue();

          ch.action?.();

        }
      );


      $("#dialogueChoices")
        .appendChild(b);

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

    const cb =
      activeDialogue.onEnd;


    closeDialogue();


    cb?.();


    return;

  }


  renderDialogue();

}


function closeDialogue(){

  $("#dialogue")
    .classList
    .add("hidden");


  activeDialogue = null;

}


/* NPC */

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

        "Olivia",

        [
          "Você não deveria estar aqui.",
          "A estação está fechada há anos.",
          "Mas o relógio ainda funciona.",
          "Se quiser sair daqui, encontre o bilhete."
        ],

        () => {

          state.missions.ticket.complete =
            false;

          updateUI();

          saveGame();

        }

      );

      return;

    }


    openDialogue(

      "Olivia",

      [
        "Você encontrou o bilhete?",
        "Não confie no primeiro trem que aparecer."
      ]

    );

    return;

  }


  if(name==="Condutor"){

    if(
      !state.flags.metConductor
    ){

      state.flags.metConductor =
        true;


      openDialogue(

        "Condutor",

        [
          "Último trem.",
          "Destino?",
          "Não importa.",
          "O que importa é o que você trouxe consigo."
        ]

      );

      return;

    }


    openDialogue(
      "Condutor",
      [
        "O relógio está correndo.",
        "Escolha com cuidado."
      ]
    );

    return;

  }


  if(name==="Kaio"){

    state.flags.metKaio =
      true;


    completeMission(
      "hospital"
    );


    openDialogue(

      "Kaio",

      [
        "Você chegou até aqui.",
        "Então Olivia estava certa.",
        "Existe uma porta que não deveria existir."
      ]

    );

  }

}


/* INTERAÇÃO */

function interact(){

  if(
    !currentInteract
  )
    return;


  const type =
    currentInteract.userData.type;


  if(type==="npc"){

    npcTalk(
      currentInteract.userData.name
    );

    return;

  }


  if(type==="pickup"){

    give(
      currentInteract.userData.itemId
    );


    currentInteract.visible =
      false;


    currentInteract =
      null;


    return;

  }


  if(type==="clock"){

    notify(
      "O relógio marca " +
      toClock(state.time) +
      "."
    );

    return;

  }


  if(type==="train"){

    openTrainMenu();

    return;

  }


  if(type==="archiveDoor"){

    if(
      !has("ticket")
    ){

      notify(
        "A porta está trancada. Talvez Olivia saiba mais."
      );

      return;

    }


    notify(
      "O arquivo ainda não pode ser acessado."
    );

    return;

  }


  if(type==="tunnelDoor"){

    if(
      !state.flags.tunnelUnlocked
    ){

      if(
        has("masterKey")
      ){

        state.flags.tunnelUnlocked =
          true;

        completeMission(
          "tunnel"
        );

        buildArea(
          "tunnels"
        );

      }else{

        notify(
          "A porta precisa de uma chave especial."
        );

      }

      return;

    }

  }


  if(type==="room0Door"){

    if(
      state.flags.room0Unlocked
    ){

      completeMission(
        "room0"
      );

      buildArea(
        "room0"
      );

    }

    return;

  }


  if(type==="returnTrain"){

    buildArea(
      "central"
    );

    return;

  }


  if(type==="terminal"){

    openPuzzle(
      "Terminal",
      "Digite o código encontrado nas pistas."
    );

    return;

  }


  if(type==="loopTerminal"){

    openPuzzle(
      "Terminal dos Túneis",
      "O monitor mostra apenas quatro dígitos."
    );

    return;

  }


  if(type==="finalPanel"){

    endGame(
      "A Sala 0",
      "O último trem nunca esteve levando você para outro lugar. Ele estava trazendo você de volta."
    );

  }

}


/* PUZZLE */

function openPuzzle(
  title,
  text
){

  controls.unlock();

  $("#puzzleTitle")
    .textContent =
    title;

  $("#puzzleText")
    .textContent =
    text;

  $("#puzzleFeedback")
    .textContent = "";

  $("#puzzleInput")
    .value = "";

  $("#puzzle")
    .classList
    .remove("hidden");

}


$("#puzzleSubmit").onclick =
  () => {

    const value =
      $("#puzzleInput")
        .value
        .trim();


    if(value==="2347"){

      $("#puzzleFeedback")
        .textContent =
        "Código correto.";

      state.flags.terminalSolved =
        true;

      state.flags.room0Unlocked =
        true;

      completeMission(
        "train"
      );

      saveGame();

    }else{

      $("#puzzleFeedback")
        .textContent =
        "Código incorreto.";

    }

  };


/* TREM */

function openTrainMenu(){

  controls.unlock();

  $("#trainMenu")
    .classList
    .remove("hidden");


  const box =
    $("#destinations");


  box.innerHTML = "";


  const destinations = [

    {
      id:"rain",
      name:"Distrito da Chuva",
      unlocked:true
    },

    {
      id:"park",
      name:"Parque das Lanternas",
      unlocked:
        state.flags.gotTicket
    },

    {
      id:"hospital",
      name:"Hospital São Lucas",
      unlocked:
        state.flags.hospitalUnlocked
    },

    {
      id:"oldtown",
      name:"Cidade Antiga",
      unlocked:
        state.flags.oldtownUnlocked
    }

  ];


  for(
    const d of destinations
  ){

    const b =
      document.createElement(
        "button"
      );


    b.className =
      "destination";


    if(!d.unlocked)
      b.classList.add(
        "locked"
      );


    b.textContent =
      d.unlocked
        ? d.name
        : `${d.name} — BLOQUEADO`;


    if(d.unlocked){

      b.onclick =
        () => {

          $("#trainMenu")
            .classList
            .add("hidden");


          state.trainTrips++;


          buildArea(
            d.id
          );

        };

    }


    box.appendChild(b);

  }

}


/* MODAIS */

function toggleModal(id){

  const el =
    $("#" + id);


  if(
    el.classList.contains(
      "hidden"
    )
  ){

    controls.unlock();

    el.classList.remove(
      "hidden"
    );

  }else{

    el.classList.add(
      "hidden"
    );

  }

}


$$("[data-close]")
  .forEach(
    b => {

      b.onclick =
        () => {

          $("#" + b.dataset.close)
            .classList
            .add("hidden");

        };

    }
  );


/* NOTIFICAÇÃO */

function notify(text){

  const n =
    $("#notification");


  n.textContent =
    text;


  n.style.display =
    "block";


  clearTimeout(
    notificationTimer
  );


  notificationTimer =
    setTimeout(
      () => {

        n.style.display =
          "none";

      },
      2800
    );

}


/* SALVAMENTO */

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


    state = {
      ...defaultState(),
      ...saved,

      flags:{
        ...defaultState().flags,
        ...(saved.flags || {})
      },

      missions:{
        ...defaultState().missions,
        ...(saved.missions || {})
      }

    };


    return true;

  }catch{

    return false;

  }

}


/* NOVO JOGO */

function newGame(){

  localStorage.removeItem(
    SAVE_KEY
  );


  state =
    defaultState();


  $("#menu")
    .classList
    .add("hidden");


  $("#game")
    .classList
    .remove("hidden");


  gameStarted =
    true;


  buildArea(
    "central"
  );


  updateUI();


  notify(
    "A Estação Central está esperando."
  );

}


/* CONTINUAR */

function continueGame(){

  if(
    !loadGame()
  ){

    notify(
      "Nenhum jogo salvo encontrado."
    );

    return;

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
    state.location
  );


  camera.position.set(
    state.pos.x,
    1.7,
    state.pos.z
  );


  updateUI();

}


/* APAGAR SAVE */

$("#deleteSaveBtn").onclick =
  () => {

    localStorage.removeItem(
      SAVE_KEY
    );


    notify(
      "Save apagado."
    );

  };


/* BOTÕES DO MENU */

$("#newGameBtn").onclick =
  newGame;


$("#continueBtn").onclick =
  continueGame;


/* FINAL */

function endGame(
  title,
  text
){

  $("#endingTitle")
    .textContent =
    title;

  $("#endingText")
    .textContent =
    text;


  $("#ending")
    .classList
    .remove("hidden");


  controls.unlock();

}


/* REINICIAR */

$("#endingRestart").onclick =
  () => {

    $("#ending")
      .classList
      .add("hidden");


    newGame();

  };


/* DIÁLOGO */

$("#dialogueNext").onclick =
  nextDialogue;


/* CONTROLES DO MOUSE */

renderer.domElement
  .addEventListener(
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


/* TECLADO */

addEventListener(
  "keydown",
  e => {

    keys[e.code] = true;


    if(
      e.code === "KeyE" &&
      !activeDialogue
    ){

      interact();

    }


    if(
      e.code === "KeyF" &&
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


    if(e.code==="KeyI")
      toggleModal("inventory");


    if(e.code==="KeyM")
      toggleModal("missions");

  }
);


addEventListener(
  "keyup",
  e => {

    keys[e.code] =
      false;

  }
);


/* CONTROLES MOBILE */

const mobile = {

  forward:false,

  back:false,

  left:false,

  right:false

};


$$("[data-move]")
  .forEach(
    b => {

      const k =
        b.dataset.move;


      const on =
        e => {

          e.preventDefault();

          mobile[k] =
            true;

        };


      const off =
        e => {

          e.preventDefault();

          mobile[k] =
            false;

        };


      b.addEventListener(
        "pointerdown",
        on
      );

      b.addEventListener(
        "pointerup",
        off
      );

      b.addEventListener(
        "pointercancel",
        off
      );

      b.addEventListener(
        "pointerleave",
        off
      );

    }
  );


$("#mobileInteract").onclick =
  interact;


/* MOVIMENTO */

function move(delta){

  if(
    !controls.isLocked
  )
    return;


  let dx = 0;

  let dz = 0;


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


  /*
    CORREÇÃO:

    A = ESQUERDA
    D = DIREITA

    O PointerLockControls
    utiliza moveRight(), portanto
    o sinal precisa ser invertido.
  */

  if(
    keys.KeyA ||
    mobile.left
  ){

    dx += 1;

  }


  if(
    keys.KeyD ||
    mobile.right
  ){

    dx -= 1;

  }


  if(
    dx ||
    dz
  ){

    const len =
      Math.hypot(
        dx,
        dz
      );


    dx /= len;

    dz /= len;


    const speed =
      (
        keys.ShiftLeft
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
          keys.ShiftLeft
            ? .9
            : .18
        ) *
        delta *
        10
      );

  }else{

    state.energy =
      Math.min(
        100,
        state.energy +
        .08 *
        delta *
        10
      );

  }


  /*
    ÁREA DE EXPLORAÇÃO MUITO MAIOR.

    Não há mais uma parede preta
    fechando o cenário.

    A névoa esconde o horizonte.
  */

  camera.position.y =
    1.7;


  camera.position.x =
    THREE.MathUtils.clamp(
      camera.position.x,
      -320,
      320
    );


  camera.position.z =
    THREE.MathUtils.clamp(
      camera.position.z,
      -320,
      320
    );


  state.pos = {

    x:camera.position.x,

    y:camera.position.y,

    z:camera.position.z

  };

}


/* DETECÇÃO */

function detect(){

  raycaster.setFromCamera(
    new THREE.Vector2(0,0),
    camera
  );


  const hits =
    raycaster.intersectObjects(

      interactables.filter(
        o =>
          o.visible &&
          o.userData.interactable
      ),

      true

    );


  let root = null;


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

      root = null;

    }

  }


  currentInteract =
    root;


  $("#interactionHint")
    .style
    .display =
    root
      ? "block"
      : "none";

}


/* ANIMAÇÕES */

function animateWorld(
  delta,
  t
){

  for(
    const a of animated
  ){

    if(
      a.type === "bob"
    ){

      a.obj.position.y =
        a.baseY +
        Math.sin(
          t * 2 +
          a.phase
        ) * .08;


      a.obj.rotation.y +=
        delta * .6;

    }


    if(
      a.type === "train"
    ){

      if(
        state.flags.trainUnlocked &&
        state.time >= 1438 &&
        !a.obj.userData.arrived
      ){

        a.obj.position.x -=
          delta * 12;


        if(
          a.obj.position.x <= 0
        ){

          a.obj.position.x = 0;

          a.obj.userData.arrived =
            true;


          notify(
            "🚇 O Último Trem chegou à plataforma."
          );

        }

      }

    }


    if(
      a.type === "rain"
    ){

      const arr =
        a.obj.geometry
          .attributes
          .position
          .array;


      for(
        let i=1;
        i<arr.length;
        i+=3
      ){

        arr[i] -=
          delta * 11;


        if(
          arr[i] < 0
        ){

          arr[i] = 18;

        }

      }


      a.obj.geometry
        .attributes
        .position
        .needsUpdate = true;

    }


    if(
      a.type === "core"
    ){

      a.obj.rotation.x +=
        delta * .18;

      a.obj.rotation.y +=
        delta * .3;

    }

  }

}


/* LOOP */

function loop(){

  requestAnimationFrame(
    loop
  );


  const delta =
    Math.min(
      clock.getDelta(),
      .05
    );


  const t =
    performance.now() / 1000;


  if(gameStarted){

    move(delta);

    detect();

    animateWorld(
      delta,
      t
    );


    state.time +=
      delta * .35;


    if(
      state.time >= 1440
    ){

      state.time -= 1440;

    }


    updateUI();

  }


  renderer.render(
    scene,
    camera
  );

}


/* REDIMENSIONAMENTO */

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


/* CARREGAMENTO */

setTimeout(
  () => {

    $("#loading")
      .classList
      .add("hidden");

  },
  900
);


/* SAVE AUTOMÁTICO */

setInterval(
  () => {

    if(gameStarted)
      saveGame();

  },
  8000
);


/* INICIA */

loop();
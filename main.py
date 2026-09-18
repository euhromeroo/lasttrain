from pathlib import Path
import textwrap, zipfile, os, json, re

root = Path("/mnt/data/ultimo_trem_3d")
root.mkdir(exist_ok=True)

index = r'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Último Trem 3D</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div id="loading">
    <div class="loading-logo">ÚLTIMO TREM</div>
    <div class="loading-sub">A Estação Central ainda se lembra de você.</div>
  </div>

  <div id="menu" class="screen">
    <div class="menu-card">
      <div class="eyebrow">MISTÉRIO • EXPLORAÇÃO • 3D</div>
      <h1>ÚLTIMO TREM</h1>
      <p>Yuri acorda em uma estação que deveria estar abandonada. Um trem chega à meia-noite. Algumas pessoas parecem lembrar de coisas que nunca aconteceram.</p>
      <div class="menu-actions">
        <button id="newGameBtn">Novo jogo</button>
        <button id="continueBtn">Continuar</button>
        <button id="deleteSaveBtn" class="secondary">Apagar save</button>
      </div>
      <div class="menu-tip">WASD mover • Mouse olhar • E interagir • F lanterna • I inventário • M missões • ESC libera o mouse</div>
    </div>
  </div>

  <div id="game" class="hidden">
    <div id="hud">
      <div class="hud-left">
        <div class="title">ÚLTIMO TREM</div>
        <div id="location">ESTAÇÃO CENTRAL</div>
        <div class="mission-box">
          <span>MISSÃO ATUAL</span>
          <strong id="missionText">Descubra onde você está.</strong>
        </div>
      </div>

      <div class="hud-right">
        <div>❤️ <span id="lives">3</span></div>
        <div>⚡ <span id="energy">100</span></div>
        <div>🔎 <span id="clues">0</span></div>
        <div>🪙 <span id="coins">0</span></div>
      </div>

      <div id="crosshair">+</div>
      <div id="interactionHint">E • Interagir</div>
      <div id="notification"></div>
      <div id="clockHud">23:47</div>
      <div id="flashlightHud">🔦 OFF</div>
    </div>

    <div id="dialogue" class="modal hidden">
      <div class="modal-card dialogue-card">
        <div id="dialogueName" class="dialogue-name">Olivia</div>
        <div id="dialogueText" class="dialogue-text"></div>
        <div id="dialogueChoices" class="choices"></div>
        <button id="dialogueNext">Continuar</button>
      </div>
    </div>

    <div id="inventory" class="modal hidden">
      <div class="modal-card">
        <div class="modal-header">
          <h2>Inventário</h2>
          <button class="icon-btn" data-close="inventory">×</button>
        </div>
        <div id="inventoryGrid" class="inventory-grid"></div>
      </div>
    </div>

    <div id="missions" class="modal hidden">
      <div class="modal-card">
        <div class="modal-header">
          <h2>Missões</h2>
          <button class="icon-btn" data-close="missions">×</button>
        </div>
        <div id="missionsList" class="missions-list"></div>
      </div>
    </div>

    <div id="puzzle" class="modal hidden">
      <div class="modal-card puzzle-card">
        <div class="modal-header">
          <h2 id="puzzleTitle">Terminal</h2>
          <button class="icon-btn" data-close="puzzle">×</button>
        </div>
        <p id="puzzleText"></p>
        <input id="puzzleInput" maxlength="8" autocomplete="off" />
        <button id="puzzleSubmit">Confirmar</button>
        <div id="puzzleFeedback"></div>
      </div>
    </div>

    <div id="trainMenu" class="modal hidden">
      <div class="modal-card">
        <div class="modal-header">
          <h2>Mapa do Último Trem</h2>
          <button class="icon-btn" data-close="trainMenu">×</button>
        </div>
        <p class="muted">O condutor não pergunta para onde você quer ir. Ele pergunta o que você está preparado para encontrar.</p>
        <div id="destinations" class="destinations"></div>
      </div>
    </div>

    <div id="ending" class="modal hidden">
      <div class="modal-card ending-card">
        <div class="eyebrow">FINAL DESBLOQUEADO</div>
        <h2 id="endingTitle">A Verdade</h2>
        <p id="endingText"></p>
        <button id="endingRestart">Jogar novamente</button>
      </div>
    </div>

    <div id="mobileControls">
      <div class="dpad">
        <button data-move="forward">▲</button>
        <div>
          <button data-move="left">◀</button>
          <button data-move="back">▼</button>
          <button data-move="right">▶</button>
        </div>
      </div>
      <button id="mobileInteract">E</button>
    </div>
  </div>

  <script type="module" src="game.js"></script>
</body>
</html>'''

style = r'''*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#05050a;color:#f2f1f7;font-family:Inter,Arial,sans-serif}.hidden{display:none!important}button,input{font:inherit}button{cursor:pointer}.screen{position:fixed;inset:0;display:grid;place-items:center;background:radial-gradient(circle at 50% 40%,#181523 0,#08080d 45%,#030305 100%);z-index:20}.menu-card{width:min(700px,90vw);padding:42px;border:1px solid #393244;background:rgba(10,10,16,.9);backdrop-filter:blur(12px)}.eyebrow{font-size:11px;letter-spacing:3px;color:#aa8cff}.menu-card h1{font-size:clamp(42px,8vw,88px);margin:10px 0;letter-spacing:8px}.menu-card p{color:#bdb8c8;line-height:1.7}.menu-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}.menu-actions button,.modal-card button{border:0;padding:12px 18px;background:#8d6cff;color:#fff;font-weight:700}.menu-actions .secondary{background:#24212d}.menu-tip{font-size:12px;color:#7f7a89;margin-top:22px}.loading-logo{font-size:clamp(36px,7vw,72px);letter-spacing:10px}.loading-sub{margin-top:16px;color:#8d8795}.screen#loading{z-index:100}canvas{display:block}#game{width:100%;height:100%;position:relative}#hud{position:absolute;inset:0;pointer-events:none;z-index:5}.hud-left{position:absolute;top:22px;left:24px}.title{font-weight:800;letter-spacing:5px}.hud-left>#location{font-size:11px;letter-spacing:2px;color:#a09ba8;margin-top:6px}.mission-box{margin-top:18px;width:min(320px,70vw);padding:14px 16px;border-left:3px solid #8d6cff;background:rgba(5,5,10,.72)}.mission-box span{display:block;font-size:9px;letter-spacing:2px;color:#9d82ff;margin-bottom:6px}.mission-box strong{font-size:13px;line-height:1.4}.hud-right{position:absolute;top:22px;right:24px;display:flex;gap:14px;background:rgba(5,5,10,.55);padding:9px 12px;font-size:13px}.hud-right>div{white-space:nowrap}#crosshair{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:20px;text-shadow:0 0 6px #000}#interactionHint{position:absolute;left:50%;bottom:80px;transform:translateX(-50%);padding:10px 15px;background:rgba(4,4,8,.85);border:1px solid #625678;display:none}#notification{position:absolute;left:50%;top:17%;transform:translateX(-50%);padding:10px 18px;background:rgba(5,5,10,.9);border-left:3px solid #8d6cff;display:none;max-width:70vw;text-align:center}#clockHud{position:absolute;bottom:22px;left:24px;font-family:monospace;font-size:18px;letter-spacing:2px}#flashlightHud{position:absolute;bottom:22px;right:24px;font-size:12px;color:#aaa}.modal{position:absolute;inset:0;z-index:15;background:rgba(0,0,0,.65);display:grid;place-items:center;pointer-events:auto}.modal-card{width:min(680px,92vw);max-height:80vh;overflow:auto;padding:24px;background:#0d0c13;border:1px solid #4b4259}.modal-header{display:flex;justify-content:space-between;align-items:center;gap:16px}.modal-header h2{margin:0}.icon-btn{width:38px;height:38px;padding:0!important;background:#211e29!important;font-size:22px}.dialogue-name{color:#b79cff;font-weight:800;letter-spacing:2px}.dialogue-text{margin:16px 0 20px;line-height:1.7;min-height:54px}.choices{display:grid;gap:9px;margin-bottom:14px}.choices button{text-align:left;background:#1a1722;border:1px solid #3b3349}.inventory-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;margin-top:16px}.item-card{padding:15px;background:#14121a;border:1px solid #282330}.item-card b{display:block;margin-bottom:5px}.item-card small{color:#9f99a9;line-height:1.45}.missions-list{display:grid;gap:11px;margin-top:16px}.mission-card{padding:14px;background:#14121a;border-left:3px solid #3c3449}.mission-card.active{border-left-color:#8d6cff}.mission-card.complete{opacity:.6}.mission-card small{display:block;color:#9b95a4;margin-top:5px}.puzzle-card input{width:100%;padding:13px;margin:10px 0;background:#08070c;color:#fff;border:1px solid #41384d;font-size:18px;letter-spacing:4px;text-align:center}.muted{color:#9993a2}.destinations{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:18px}.destination{padding:16px!important;background:#17141e!important;border:1px solid #332b40!important;text-align:left}.destination.locked{opacity:.45;cursor:not-allowed}.ending-card{text-align:center}.ending-card h2{font-size:34px}.ending-card p{line-height:1.7;color:#c1bbc9}#mobileControls{display:none;position:absolute;inset:0;pointer-events:none;z-index:8}.dpad{position:absolute;left:16px;bottom:18px;pointer-events:auto}.dpad button,#mobileInteract{width:52px;height:52px;border:1px solid #5b4f68;background:rgba(10,9,15,.75);color:#fff}.dpad>button{display:block;margin:auto}.dpad>div{display:flex}.dpad>div button{margin:2px}#mobileInteract{position:absolute;right:20px;bottom:28px;border-radius:50%;pointer-events:auto;font-weight:800}@media(max-width:850px){#mobileControls{display:block}.hud-right{top:15px;right:12px;gap:8px;font-size:12px}.hud-left{top:15px;left:12px}.mission-box{width:230px}#clockHud{bottom:155px}.menu-card{padding:28px}}'''

game = r'''import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/PointerLockControls.js";

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const SAVE_KEY = "ultimoTrem3D-save-v3";

const ITEMS = {
  ticket:{icon:"🎫",name:"Bilhete impossível",desc:"Bilhete emitido para uma linha encerrada há anos."},
  flashlight:{icon:"🔦",name:"Lanterna",desc:"Uma lanterna velha. A bateria parece não acabar."},
  photo:{icon:"📷",name:"Fotografia",desc:"Yuri aparece ao fundo de uma foto datada de antes de nascer."},
  redNote:{icon:"📝",name:"Bilhete vermelho",desc:"'Não deixe o trem chegar à Sala 0.'"},
  hospitalCard:{icon:"💳",name:"Cartão do Hospital",desc:"Acesso do Hospital São Lucas. Nome apagado."},
  oldKey:{icon:"🗝️",name:"Chave antiga",desc:"Tem o símbolo da antiga Companhia Metropolitana."},
  masterKey:{icon:"🔑",name:"Chave mestra",desc:"Abre os setores técnicos da estação."},
  strangeCoin:{icon:"🪙",name:"Moeda estranha",desc:"Marcada com o mesmo símbolo do trem."},
  badge:{icon:"🎖️",name:"Insígnia do Condutor",desc:"No verso: 'O último passageiro escolhe o destino.'"}
};

const MISSIONS = {
  wake:{name:"A estação vazia",desc:"Investigue a Estação Central.",complete:false},
  olivia:{name:"Olivia",desc:"Converse com a mulher perto da plataforma.",complete:false},
  ticket:{name:"O bilhete impossível",desc:"Encontre o bilhete mencionado por Olivia.",complete:false},
  train:{name:"O Último Trem",desc:"Descubra como embarcar no trem.",complete:false},
  hospital:{name:"Paciente 404",desc:"Encontre Kaio no Hospital São Lucas.",complete:false},
  tunnel:{name:"Debaixo da cidade",desc:"Acesse os túneis da companhia.",complete:false},
  room0:{name:"Sala 0",desc:"Descubra o que existe atrás da porta sem número.",complete:false}
};

const defaultState = () => ({
  lives:3, energy:100, coins:0, clues:0, xp:0, level:1, time:23*60+47,
  location:"central", trainTrips:0, inventory:[], endings:[],
  flags:{
    metOlivia:false, gotTicket:false, trainUnlocked:false, metConductor:false,
    hospitalUnlocked:false, metKaio:false, oldtownUnlocked:false, tunnelUnlocked:false,
    terminalSolved:false, room0Unlocked:false, room0Started:false, flashlightOwned:false,
    photoFound:false, redNoteFound:false
  },
  missions:JSON.parse(JSON.stringify(MISSIONS)),
  pos:{x:0,y:1.7,z:15}
});
let state = defaultState();

const AREAS = {
  central:{label:"ESTAÇÃO CENTRAL", spawn:[0,1.7,15], fog:0x08080d, density:.026},
  rain:{label:"DISTRITO DA CHUVA", spawn:[0,1.7,10], fog:0x0d1117, density:.035},
  park:{label:"PARQUE DAS LANTERNAS", spawn:[0,1.7,12], fog:0x0d130f, density:.023},
  hospital:{label:"HOSPITAL SÃO LUCAS", spawn:[0,1.7,14], fog:0x101214, density:.02},
  oldtown:{label:"CIDADE ANTIGA", spawn:[0,1.7,12], fog:0x17120d, density:.028},
  tunnels:{label:"TÚNEIS", spawn:[0,1.7,12], fog:0x070707, density:.04},
  room0:{label:"SALA 0", spawn:[0,1.7,9], fog:0x09060c, density:.018}
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,300);
const renderer = new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setSize(innerWidth,innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
$("#game").prepend(renderer.domElement);

const controls = new PointerLockControls(camera,renderer.domElement);
const world = new THREE.Group(); scene.add(world);
const interactables = [];
const colliders = [];
const animated = [];
const keys = {};
let currentInteract = null, gameStarted=false, activeDialogue=null, dialogueIndex=0, notificationTimer;
const raycaster = new THREE.Raycaster();
const clock = new THREE.Clock();

scene.add(new THREE.HemisphereLight(0x778099,0x08080b,.45));
const moon = new THREE.DirectionalLight(0xaab7ff,.25); moon.position.set(15,30,10); scene.add(moon);

const flashlight = new THREE.SpotLight(0xffffff,0,42,Math.PI/7,.5,1.2);
flashlight.position.set(0,0,0); flashlight.target.position.set(0,0,-10);
camera.add(flashlight); camera.add(flashlight.target); scene.add(camera);

function mat(color,rough=.75,metal=.05,emissive=0x000000,ei=0){
  return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,emissive,emissiveIntensity:ei});
}
function box(w,h,d,m,x,y,z,collide=false){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); mesh.position.set(x,y,z);
  mesh.castShadow=true; mesh.receiveShadow=true; world.add(mesh); if(collide) colliders.push(mesh); return mesh;
}
function cylinder(r,h,m,x,y,z){
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),m);mesh.position.set(x,y,z);mesh.castShadow=true;world.add(mesh);return mesh;
}
function label(text,w=5,h=1.1){
  const c=document.createElement("canvas"); c.width=768;c.height=192; const ctx=c.getContext("2d");
  ctx.fillStyle="#111118";ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle="#6e5b86";ctx.lineWidth=7;ctx.strokeRect(4,4,c.width-8,c.height-8);
  ctx.fillStyle="#e8e4ef";ctx.font="700 54px Arial";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(text,c.width/2,c.height/2);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:true}));
}
function addInteract(obj,type,data={}){
  obj.userData.interactable=true;obj.userData.type=type;Object.assign(obj.userData,data);interactables.push(obj);return obj;
}
function pointLight(x,y,z,color=0xdde2ff,intensity=2.4,dist=14){
  const l=new THREE.PointLight(color,intensity,dist);l.position.set(x,y,z);world.add(l);return l;
}
function lamp(x,z,color=0xe7e8ff){
  cylinder(.08,3.5,mat(0x303039,.4,.7),x,1.75,z);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.14,12,12),new THREE.MeshBasicMaterial({color}));bulb.position.set(x,3.55,z);world.add(bulb);
  pointLight(x,3.5,z,color,2.2,12);
}
function floorGrid(size=60){
  box(size,.3,size,mat(0x24242a,.95),0,-.2,0,true);
}
function clearWorld(){
  while(world.children.length) world.remove(world.children[0]);
  interactables.length=0; colliders.length=0; animated.length=0;
}
function wall(w,h,d,x,y,z,c=0x16161b){return box(w,h,d,mat(c,.92),x,y,z,true)}
function propCrate(x,z){box(1.2,1.2,1.2,mat(0x3e3429,.9),x,.6,z,true)}
function makeNpc(name,x,z,color=0x352941){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.9,6,12),mat(color,.8));body.position.y=1.05;g.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.33,20,20),mat(0xc7967e,.72));head.position.y=2;g.add(head);
  g.position.set(x,0,z);world.add(g);addInteract(g,"npc",{name});return g;
}
function makePickup(id,x,z){
  const item=ITEMS[id];
  const m=new THREE.Mesh(new THREE.BoxGeometry(.7,.12,.5),mat(id==="redNote"?0x7f161d:0xd8c89a,.7),);m.position.set(x,.55,z);
  addInteract(m,"pickup",{itemId:id});world.add(m);
  animated.push({obj:m,type:"bob",baseY:.55,phase:Math.random()*6.28});
  return m;
}
function makeDoor(labelText,x,z,type,data={},rot=0){
  const door=box(2.3,3.2,.25,mat(0x29242e,.55,.35),x,1.6,z,true);door.rotation.y=rot;addInteract(door,type,data);
  const s=label(labelText,2.0,.52);s.position.set(x,2.2,z+(rot===0?.14:0));s.rotation.y=rot;world.add(s);return door;
}
function benches(){
  for(let x=-14;x<=14;x+=7){box(3,.25,1,mat(0x4a3c2d,.8),x,.7,6,true);box(3,1,.18,mat(0x4a3c2d,.8),x,1.2,6.4,true)}
}
function buildCentral(){
  clearWorld(); floorGrid(70); wall(70,7,1,0,3.5,-22);wall(70,7,1,0,3.5,22);wall(1,7,44,-35,3.5,0);wall(1,7,44,35,3.5,0);
  box(70,.6,6,mat(0x4b4a50,.9),0,.15,-10,true);
  box(70,.15,.14,mat(0x787880,.3,.9),0,.75,-11.1);box(70,.15,.14,mat(0x787880,.3,.9),0,.75,-8.9);
  for(let x=-33;x<=33;x+=2)box(.55,.14,4,mat(0x312b28,.9),x,.62,-10);
  for(let x=-28;x<=28;x+=8)lamp(x,3.2);
  for(let x=-30;x<=30;x+=10){wall(1.1,7,1.1,x,3.5,-3,0x202027);wall(1.1,7,1.1,x,3.5,15,0x202027)}
  benches();
  const sign=label("ESTAÇÃO CENTRAL",12,2);sign.position.set(0,5.2,-21.4);world.add(sign);
  const olivia=makeNpc("Olivia",-8,3,0x372946);
  makeNpc("Condutor",17,-5,0x20252c);
  if(!state.inventory.includes("ticket"))makePickup("ticket",7,7);
  if(!state.inventory.includes("flashlight"))makePickup("flashlight",-18,7);
  if(!state.inventory.includes("redNote"))makePickup("redNote",23,14);
  const clk=addInteract(new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.25,.24,32),mat(0x111116,.5,.2)),"clock");
  clk.rotation.x=Math.PI/2;clk.position.set(0,4.3,-21.25);world.add(clk);
  makeDoor("ARQUIVO",-26,21.65,"archiveDoor");
  makeDoor("TÚNEIS",28,21.65,"tunnelDoor");
  if(state.flags.room0Unlocked) makeDoor("0",0,21.65,"room0Door");
  for(let i=0;i<12;i++)propCrate(-31+Math.random()*62,18+Math.random()*2);
  buildTrain();
}
function buildTrain(){
  const train=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(18,3.2,3.6),mat(0x3d4148,.42,.75));body.position.y=2;train.add(body);
  for(let i=-7;i<=7;i+=3.5){const w=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1),new THREE.MeshBasicMaterial({color:0x9bb6c8}));w.position.set(i,2.3,1.81);train.add(w)}
  const frontLight=new THREE.PointLight(0xf4e8c0,4,20);frontLight.position.set(-9,1.8,0);train.add(frontLight);
  train.position.set(70,0,-10);train.userData.arrived=false;world.add(train);
  addInteract(train,"train");
  animated.push({obj:train,type:"train"});
}
function buildRain(){
  clearWorld();floorGrid(64);wall(64,5,1,0,2.5,-24);wall(64,5,1,0,2.5,24);wall(1,5,48,-32,2.5,0);wall(1,5,48,32,2.5,0);
  for(let x=-24;x<=24;x+=8)lamp(x,4,0x9ab6ff);
  for(let i=0;i<22;i++){const h=2+Math.random()*6;box(3+Math.random()*4,h,3+Math.random()*4,mat(0x171b21,.9),-27+Math.random()*54,h/2,-18+Math.random()*36,true)}
  if(!state.inventory.includes("strangeCoin"))makePickup("strangeCoin",-12,8);
  makeDoor("PLATAFORMA",0,-23.6,"returnTrain");
  addRain();
}
function addRain(){
  const count=700;const geo=new THREE.BufferGeometry();const arr=new Float32Array(count*3);
  for(let i=0;i<count;i++){arr[i*3]=-30+Math.random()*60;arr[i*3+1]=Math.random()*18;arr[i*3+2]=-22+Math.random()*44}
  geo.setAttribute("position",new THREE.BufferAttribute(arr,3));
  const pts=new THREE.Points(geo,new THREE.PointsMaterial({color:0xaabbd5,size:.04,transparent:true,opacity:.65}));
  world.add(pts);animated.push({obj:pts,type:"rain"});
}
function buildPark(){
  clearWorld();floorGrid(64);
  for(let i=0;i<28;i++){const x=-28+Math.random()*56,z=-22+Math.random()*44; cylinder(.35,4,mat(0x352a22,.95),x,2,z);const crown=new THREE.Mesh(new THREE.SphereGeometry(1.7,12,12),mat(0x17331d,.95));crown.position.set(x,4.3,z);world.add(crown)}
  for(let x=-24;x<=24;x+=6)lamp(x,2,0xffd27a);
  if(!state.inventory.includes("photo"))makePickup("photo",11,-6);
  makeDoor("PLATAFORMA",0,-23.6,"returnTrain");
}
function buildHospital(){
  clearWorld();floorGrid(58);wall(58,6,1,0,3,-21);wall(58,6,1,0,3,21);wall(1,6,42,-29,3,0);wall(1,6,42,29,3,0);
  for(let x=-22;x<=22;x+=11)pointLight(x,4.5,0,0xddeeff,1.8,12);
  for(let z=-15;z<=15;z+=10){wall(20,4,.3,-18,2,z,0xe4e2df);wall(20,4,.3,18,2,z,0xe4e2df)}
  makeNpc("Kaio",0,-10,0x293640);
  const terminal=box(1.2,1.4,.6,mat(0x22262a,.35,.65,0x102b35,.4),14,.7,8,true);addInteract(terminal,"terminal");
  if(!state.inventory.includes("hospitalCard"))makePickup("hospitalCard",-15,12);
  makeDoor("PLATAFORMA",0,20.6,"returnTrain");
}
function buildOldtown(){
  clearWorld();floorGrid(66);
  for(let i=0;i<16;i++){const x=-28+Math.random()*56,z=-22+Math.random()*44;const h=3+Math.random()*6;box(4+Math.random()*4,h,4+Math.random()*4,mat(0x4a382a,.93),x,h/2,z,true)}
  for(let x=-24;x<=24;x+=8)lamp(x,3,0xffc078);
  makeNpc("Senhora da Cidade Antiga",-6,7,0x4b342c);
  if(!state.inventory.includes("oldKey"))makePickup("oldKey",14,-5);
  makeDoor("PLATAFORMA",0,-23.6,"returnTrain");
}
function buildTunnels(){
  clearWorld();floorGrid(50);wall(50,5,1,0,2.5,-15);wall(50,5,1,0,2.5,15);wall(1,5,30,-25,2.5,0);wall(1,5,30,25,2.5,0);
  for(let x=-20;x<=20;x+=5)pointLight(x,3.8,0,0xb9c7d8,1.1,8);
  for(let i=0;i<15;i++)propCrate(-20+Math.random()*40,-11+Math.random()*22);
  if(!state.inventory.includes("masterKey"))makePickup("masterKey",-18,-8);
  const term=box(1.4,1.2,.8,mat(0x22252a,.3,.7,0x1a0c26,.8),16,.6,-6,true);addInteract(term,"loopTerminal");
  makeDoor("VOLTAR",0,14.6,"returnTrain");
}
function buildRoom0(){
  clearWorld();floorGrid(38);wall(38,6,1,0,3,-14);wall(38,6,1,0,3,14);wall(1,6,28,-19,3,0);wall(1,6,28,19,3,0);
  pointLight(0,5,0,0x9b6cff,3.4,26);
  const core=new THREE.Mesh(new THREE.IcosahedronGeometry(2.2,2),mat(0x30143e,.18,.4,0x652781,1.6));core.position.set(0,2,-3);world.add(core);animated.push({obj:core,type:"core"});
  const panel=box(2,1.4,.7,mat(0x17151d,.3,.7,0x341347,.9),0,.7,6,true);addInteract(panel,"finalPanel");
}
function buildArea(id){
  state.location=id; const a=AREAS[id]; scene.fog=new THREE.FogExp2(a.fog,a.density); scene.background=new THREE.Color(a.fog);
  if(id==="central")buildCentral(); else if(id==="rain")buildRain(); else if(id==="park")buildPark(); else if(id==="hospital")buildHospital(); else if(id==="oldtown")buildOldtown(); else if(id==="tunnels")buildTunnels(); else buildRoom0();
  camera.position.set(...a.spawn); state.pos={x:a.spawn[0],y:a.spawn[1],z:a.spawn[2]}; $("#location").textContent=a.label; saveGame();
}
function has(id){return state.inventory.includes(id)}
function give(id){
  if(has(id))return; state.inventory.push(id);
  if(id==="ticket")state.flags.gotTicket=true;
  if(id==="flashlight")state.flags.flashlightOwned=true;
  if(id==="photo")state.flags.photoFound=true;
  if(id==="redNote")state.flags.redNoteFound=true;
  state.clues++; notify(`${ITEMS[id].icon} ${ITEMS[id].name} adicionado ao inventário.`); updateUI(); saveGame();
}
function addClue(text){state.clues++;notify("🔎 "+text);updateUI();saveGame()}
function completeMission(id){if(state.missions[id]&&!state.missions[id].complete){state.missions[id].complete=true;state.xp+=40;notify(`✓ Missão concluída: ${state.missions[id].name}`)}}
function mission(id){return state.missions[id]}
function currentMission(){
  for(const id of ["wake","olivia","ticket","train","hospital","tunnel","room0"]) if(!mission(id).complete)return mission(id).desc;
  return "A verdade está diante de você.";
}
function updateUI(){
  $("#lives").textContent=state.lives;$("#energy").textContent=Math.round(state.energy);$("#clues").textContent=state.clues;$("#coins").textContent=state.coins;
  $("#missionText").textContent=currentMission();$("#clockHud").textContent=toClock(state.time);
}
function toClock(m){m=Math.floor(m)%1440;return `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`}

function openDialogue(name,lines,onEnd=null,choices=null){
  activeDialogue={name,lines,onEnd,choices};dialogueIndex=0;controls.unlock();$("#dialogue").classList.remove("hidden");renderDialogue();
}
function renderDialogue(){
  $("#dialogueName").textContent=activeDialogue.name;$("#dialogueText").textContent=activeDialogue.lines[dialogueIndex]||"";
  $("#dialogueChoices").innerHTML="";
  const atEnd=dialogueIndex>=activeDialogue.lines.length-1;
  $("#dialogueNext").style.display=(atEnd&&activeDialogue.choices)?"none":"inline-block";
  if(atEnd&&activeDialogue.choices){
    for(const ch of activeDialogue.choices){
      const b=document.createElement("button");b.textContent=ch.text;b.addEventListener("click",()=>{closeDialogue();ch.action?.()});$("#dialogueChoices").appendChild(b);
    }
  }
}
function nextDialogue(){
  if(!activeDialogue)return;
  dialogueIndex++;
  if(dialogueIndex>=activeDialogue.lines.length){const cb=activeDialogue.onEnd;closeDialogue();cb?.();return}
  renderDialogue();
}
function closeDialogue(){$("#dialogue").classList.add("hidden");activeDialogue=null}

function npcTalk(name){
  if(name==="Olivia"){
    if(!state.flags.metOlivia){
      state.flags.metOlivia=true;completeMission("wake");completeMission("olivia");
      openDialogue("Olivia",["Você acordou... então ainda há tempo.","Meu nome é Olivia. Esta estação foi fechada, mas continua recebendo passageiros.","Se quiser respostas, encontre o bilhete. Ele sempre volta para a plataforma."],()=>{notify("Nova missão: O bilhete impossível");});
    } else if(!has("ticket")) openDialogue("Olivia",["O bilhete costuma aparecer perto dos bancos.","Não tente entender a data impressa nele ainda."]);
    else if(!state.flags.trainUnlocked){
      state.flags.trainUnlocked=true;completeMission("ticket");
      openDialogue("Olivia",["Então ele escolheu você.","À meia-noite, o trem vai chegar. Fale com o Condutor.","E Yuri... se ele disser que já conhece você, não responda rápido demais."]);
    } else openDialogue("Olivia",["Cada lugar guarda uma parte da mesma noite.","Hospital. Cidade Antiga. Túneis. Quando as peças se encaixarem, a Sala 0 vai aparecer."]);
  }
  if(name==="Condutor"){
    state.flags.metConductor=true;
    if(!has("ticket")) return openDialogue("Condutor",["Sem bilhete, não existe viagem.","Sem viagem, não existe lembrança."]);
    if(!state.flags.trainUnlocked) state.flags.trainUnlocked=true;
    completeMission("train");openDialogue("Condutor",["Bilhete válido.","Destino?"],()=>openTrainMenu());
  }
  if(name==="Kaio"){
    if(!state.flags.metKaio){
      state.flags.metKaio=true;completeMission("hospital");state.flags.oldtownUnlocked=true;
      openDialogue("Kaio",["Yuri?","Não... isso não pode ser.","Seu nome está nos registros do acidente.","Eu desapareci naquela noite. Pelo menos é isso que os arquivos dizem.","Procure a Cidade Antiga. Há alguém lá que lembra da linha antes de ela existir."],()=>addClue("Kaio reconheceu Yuri de registros antigos."));
    }else openDialogue("Kaio",["A estação não prende pessoas. Ela prende momentos.","Você precisa encontrar o instante em que tudo começou."]);
  }
  if(name==="Senhora da Cidade Antiga"){
    state.flags.tunnelUnlocked=true;
    openDialogue("Senhora",["A companhia cavou um nível abaixo dos mapas oficiais.","Chamavam de Sala 0.","A chave que você encontrou abre os túneis. Mas a Sala 0 só aparece para quem já viu a própria memória quebrar."],()=>addClue("A Sala 0 fica abaixo da estação."));
  }
}

function interact(){
  if(!currentInteract)return;
  const u=currentInteract.userData;
  if(u.type==="npc")return npcTalk(u.name);
  if(u.type==="pickup"){give(u.itemId); currentInteract.visible=false; currentInteract.userData.interactable=false;
    if(u.itemId==="ticket")completeMission("ticket");
    return;
  }
  if(u.type==="clock"){addClue("O relógio está parado em 00:00, mas o ponteiro dos segundos continua se movendo.");return}
  if(u.type==="archiveDoor"){
    if(!has("oldKey"))return notify("A porta do arquivo está trancada.");
    if(!has("photo"))give("photo");return notify("O arquivo contém fotografias e relatórios incompletos.");
  }
  if(u.type==="tunnelDoor"){
    if(!state.flags.tunnelUnlocked&&!has("oldKey"))return notify("Você ainda não sabe como abrir esta porta.");
    completeMission("tunnel");buildArea("tunnels");return;
  }
  if(u.type==="room0Door"){
    if(!has("masterKey")||!state.flags.terminalSolved)return notify("A porta não reage.");
    completeMission("room0");buildArea("room0");return;
  }
  if(u.type==="terminal"){openPuzzle("Arquivo 404","Digite o número do paciente mencionado nos registros.","0404",(ok)=>{if(ok){state.flags.hospitalUnlocked=true;state.flags.oldtownUnlocked=true;addClue("O arquivo 404 pertence a Kaio.");}});return}
  if(u.type==="loopTerminal"){openPuzzle("Terminal subterrâneo","Quatro dígitos. A hora em que o relógio da estação parou.","0000",(ok)=>{if(ok){state.flags.terminalSolved=true;state.flags.room0Unlocked=true;addClue("O terminal revelou a existência da Sala 0.");}});return}
  if(u.type==="train"||u.type==="returnTrain"){if(!has("ticket"))return notify("Você precisa de um bilhete.");openTrainMenu();return}
  if(u.type==="finalPanel")return triggerEnding();
}

function openPuzzle(title,text,answer,cb){
  controls.unlock();$("#puzzleTitle").textContent=title;$("#puzzleText").textContent=text;$("#puzzleInput").value="";$("#puzzleFeedback").textContent="";
  $("#puzzle").classList.remove("hidden");$("#puzzleSubmit").onclick=()=>{const ok=$("#puzzleInput").value.trim()===answer;$("#puzzleFeedback").textContent=ok?"Acesso autorizado.":"Código incorreto.";if(ok){setTimeout(()=>{$("#puzzle").classList.add("hidden");cb(true);},500)}};
}
function openTrainMenu(){
  controls.unlock();$("#trainMenu").classList.remove("hidden");const d=$("#destinations");d.innerHTML="";
  const opts=[
    ["central","Estação Central",true],["rain","Distrito da Chuva",true],["park","Parque das Lanternas",state.clues>=2],
    ["hospital","Hospital São Lucas",state.flags.trainUnlocked],["oldtown","Cidade Antiga",state.flags.oldtownUnlocked],
    ["tunnels","Túneis",state.flags.tunnelUnlocked],["room0","Sala 0",state.flags.room0Unlocked&&has("masterKey")&&state.flags.terminalSolved]
  ];
  for(const [id,name,unlock] of opts){
    const b=document.createElement("button");b.className="destination"+(unlock?"":" locked");b.textContent=unlock?name:`🔒 ${name}`;b.disabled=!unlock;
    b.onclick=()=>{state.trainTrips++;$("#trainMenu").classList.add("hidden");buildArea(id);notify(`🚇 Próxima parada: ${name}`)};d.appendChild(b)
  }
}
function triggerEnding(){
  let type,title,text;
  if(state.clues>=9&&has("redNote")&&has("photo")&&state.flags.terminalSolved){
    type="secret";title="A Verdade";text="Yuri percebe que não entrou na estação naquela noite: uma parte dele nunca saiu. A Sala 0 não é um lugar, mas o ponto onde o acidente continua se repetindo. Ao desligar o núcleo, ele devolve o tempo às pessoas presas no loop — incluindo Kaio. Olivia observa o primeiro amanhecer em anos.";
  }else if(state.clues>=7&&state.flags.terminalSolved){
    type="truth";title="O Último Trem";text="Yuri interrompe o ciclo e escapa no último trem. Ele leva consigo registros suficientes para provar que a estação escondia algo impossível, mas algumas respostas permanecem enterradas abaixo da cidade.";
  }else if(state.trainTrips>=8){
    type="loop";title="Ciclo";text="As portas se abrem. Yuri pisa na plataforma e reconhece cada rachadura do chão. Olivia o encara como se fosse a primeira vez. O relógio marca 23:47.";
  }else{
    type="incomplete";title="Ainda não acabou";text="Yuri alcança o centro do mistério cedo demais. A estação continua funcionando, esperando que ele retorne com as peças que faltam.";
  }
  if(!state.endings.includes(type))state.endings.push(type);saveGame();
  controls.unlock();$("#endingTitle").textContent=title;$("#endingText").textContent=text;$("#ending").classList.remove("hidden");
}

function renderInventory(){
  const g=$("#inventoryGrid");g.innerHTML="";
  if(!state.inventory.length){g.innerHTML='<p class="muted">Nenhum item encontrado.</p>';return}
  for(const id of state.inventory){const it=ITEMS[id];const c=document.createElement("div");c.className="item-card";c.innerHTML=`<b>${it.icon} ${it.name}</b><small>${it.desc}</small>`;g.appendChild(c)}
}
function renderMissions(){
  const l=$("#missionsList");l.innerHTML="";
  for(const [id,m] of Object.entries(state.missions)){const c=document.createElement("div");c.className="mission-card "+(m.complete?"complete":currentMission()===m.desc?"active":"");c.innerHTML=`<b>${m.complete?"✓ ":""}${m.name}</b><small>${m.desc}</small>`;l.appendChild(c)}
}
function toggleModal(id){
  const el=$("#"+id);const opening=el.classList.contains("hidden"); if(opening)controls.unlock();
  if(id==="inventory")renderInventory(); if(id==="missions")renderMissions(); el.classList.toggle("hidden");
}
function notify(text){const n=$("#notification");n.textContent=text;n.style.display="block";clearTimeout(notificationTimer);notificationTimer=setTimeout(()=>n.style.display="none",3200)}

function saveGame(){localStorage.setItem(SAVE_KEY,JSON.stringify(state));}
function loadGame(){const raw=localStorage.getItem(SAVE_KEY);if(!raw)return false;try{state=Object.assign(defaultState(),JSON.parse(raw));return true}catch{return false}}
function deleteSave(){localStorage.removeItem(SAVE_KEY);state=defaultState();$("#continueBtn").disabled=true;notify("Save apagado.");}

function startGame(load=false){
  if(load&&!loadGame())state=defaultState(); if(!load)state=defaultState();
  $("#menu").classList.add("hidden");$("#game").classList.remove("hidden");gameStarted=true;buildArea(state.location||"central");updateUI();notify("Clique na tela para controlar Yuri.");
}
$("#newGameBtn").onclick=()=>startGame(false);$("#continueBtn").onclick=()=>startGame(true);$("#deleteSaveBtn").onclick=deleteSave;
$("#continueBtn").disabled=!localStorage.getItem(SAVE_KEY);
$("#dialogueNext").onclick=nextDialogue;$("#endingRestart").onclick=()=>{localStorage.removeItem(SAVE_KEY);location.reload()};
$$("[data-close]").forEach(b=>b.onclick=()=>$("#"+b.dataset.close).classList.add("hidden"));

renderer.domElement.addEventListener("click",()=>{if(gameStarted&&!activeDialogue&&!$$(".modal:not(.hidden)").length)controls.lock()});
addEventListener("keydown",e=>{
  keys[e.code]=true;
  if(e.code==="KeyE"&&!activeDialogue)interact();
  if(e.code==="KeyF"&&state.flags.flashlightOwned){flashlight.intensity=flashlight.intensity?0:4.5;$("#flashlightHud").textContent=flashlight.intensity?"🔦 ON":"🔦 OFF"}
  if(e.code==="KeyI")toggleModal("inventory");
  if(e.code==="KeyM")toggleModal("missions");
});
addEventListener("keyup",e=>keys[e.code]=false);

const mobile={forward:false,back:false,left:false,right:false};
$$("[data-move]").forEach(b=>{
  const k=b.dataset.move;
  const on=e=>{e.preventDefault();mobile[k]=true},off=e=>{e.preventDefault();mobile[k]=false};
  b.addEventListener("pointerdown",on);b.addEventListener("pointerup",off);b.addEventListener("pointercancel",off);b.addEventListener("pointerleave",off);
});
$("#mobileInteract").onclick=interact;

function move(delta){
  if(!controls.isLocked)return;
  let dx=0,dz=0;if(keys.KeyW||mobile.forward)dz-=1;if(keys.KeyS||mobile.back)dz+=1;if(keys.KeyA||mobile.left)dx-=1;if(keys.KeyD||mobile.right)dx+=1;
  if(dx||dz){const len=Math.hypot(dx,dz);dx/=len;dz/=len;const speed=(keys.ShiftLeft?7.5:5.1)*delta;controls.moveRight(dx*speed);controls.moveForward(-dz*speed);state.energy=Math.max(0,state.energy-(keys.ShiftLeft?.9:.18)*delta*10)}
  else state.energy=Math.min(100,state.energy+.08*delta*10);
  camera.position.y=1.7;camera.position.x=THREE.MathUtils.clamp(camera.position.x,-33,33);camera.position.z=THREE.MathUtils.clamp(camera.position.z,-21,21);
  state.pos={x:camera.position.x,y:camera.position.y,z:camera.position.z};
}
function detect(){
  raycaster.setFromCamera(new THREE.Vector2(0,0),camera);
  const hits=raycaster.intersectObjects(interactables.filter(o=>o.visible&&o.userData.interactable),true);
  let root=null;
  if(hits.length&&hits[0].distance<4.5){root=hits[0].object;while(root.parent&&root.parent!==world&&!root.userData.interactable)root=root.parent;if(!root.userData.interactable)root=null}
  currentInteract=root;$("#interactionHint").style.display=root?"block":"none";
}
function animateWorld(delta,t){
  for(const a of animated){
    if(a.type==="bob"){a.obj.position.y=a.baseY+Math.sin(t*2+a.phase)*.08;a.obj.rotation.y+=delta*.6}
    if(a.type==="train"){
      if(state.flags.trainUnlocked&&state.time>=1438&&!a.obj.userData.arrived){a.obj.position.x-=delta*12;if(a.obj.position.x<=0){a.obj.position.x=0;a.obj.userData.arrived=true;notify("🚇 O Último Trem chegou à plataforma.")}}
    }
    if(a.type==="rain"){const arr=a.obj.geometry.attributes.position.array;for(let i=1;i<arr.length;i+=3){arr[i]-=delta*11;if(arr[i]<0)arr[i]=18}a.obj.geometry.attributes.position.needsUpdate=true}
    if(a.type==="core"){a.obj.rotation.x+=delta*.18;a.obj.rotation.y+=delta*.3}
  }
}
function loop(){
  requestAnimationFrame(loop);const delta=Math.min(clock.getDelta(),.05);const t=performance.now()/1000;
  if(gameStarted){move(delta);detect();animateWorld(delta,t);state.time+=delta*.35; if(state.time>=1440)state.time-=1440;updateUI()}
  renderer.render(scene,camera);
}
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
setTimeout(()=>$("#loading").classList.add("hidden"),900);
setInterval(()=>{if(gameStarted)saveGame()},8000);
loop();
'''

readme = r'''# Último Trem 3D

Protótipo 3D jogável em HTML/CSS/JavaScript com Three.js.

## Como abrir
Como o projeto usa módulos ES do Three.js, o ideal é abrir com um servidor local.

### VS Code
1. Instale a extensão **Live Server**.
2. Abra a pasta `ultimo_trem_3d`.
3. Clique com o botão direito em `index.html`.
4. Escolha **Open with Live Server**.

## Controles
- WASD: mover
- Mouse: olhar
- Shift: correr
- E: interagir
- F: lanterna
- I: inventário
- M: missões
- Esc: soltar o mouse

## Conteúdo incluído
- Estação Central 3D
- Distrito da Chuva
- Parque das Lanternas
- Hospital São Lucas
- Cidade Antiga
- Túneis
- Sala 0
- Yuri, Olivia, Kaio, Condutor e Senhora da Cidade Antiga
- Inventário
- Missões
- Pistas
- Puzzles
- Trem animado
- Chuva
- Iluminação e neblina
- Lanterna
- Salvamento automático via localStorage
- Finais diferentes
- Controles básicos para celular

## Próximos passos para produção profissional
O código usa geometrias procedurais para funcionar sem downloads adicionais.
Para elevar o visual, substitua os modelos simples por arquivos `.glb/.gltf` criados no Blender,
adicione texturas PBR e áudio real. O sistema do jogo já está separado de forma que esses assets
possam ser incorporados depois.
'''

(root/"index.html").write_text(index, encoding="utf-8")
(root/"style.css").write_text(style, encoding="utf-8")
(root/"game.js").write_text(game, encoding="utf-8")
(root/"README.md").write_text(readme, encoding="utf-8")

zip_path = Path("/mnt/data/ultimo_trem_3d.zip")
with zipfile.ZipFile(zip_path,"w",zipfile.ZIP_DEFLATED) as z:
    for f in root.iterdir():
        z.write(f, arcname=f"ultimo_trem_3d/{f.name}")

print(zip_path)

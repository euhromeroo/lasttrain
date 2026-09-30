* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --bg: #030507;
    --phone: #10151b;
    --header: #151b22;
    --text: #edf1ee;
    --muted: #89918e;
    --green: #718d79;
    --green-dark: #283a2e;
    --bubble: #202730;
    --player: #294034;
}

body {
    min-height: 100vh;

    background:
        radial-gradient(circle at center, #20272b, #07090c 65%, #020304);

    color: var(--text);

    font-family: Arial, Helvetica, sans-serif;

    overflow: hidden;
}

button {
    font-family: inherit;
}

.hidden {
    display: none !important;
}


/* =========================
   TELAS
========================= */

.screen {
    width: 100%;
    height: 100vh;

    display: flex;
    align-items: center;
    justify-content: center;
}


/* =========================
   TELA INICIAL
========================= */

.start-screen {
    background:
        radial-gradient(
            circle,
            rgba(90, 115, 98, .15),
            transparent 40%
        ),
        #040608;
}

.start-content {
    text-align: center;

    animation: appear 1s ease;
}

.mystery-icon {
    width: 95px;
    height: 95px;

    border: 1px solid #647169;
    border-radius: 50%;

    display: flex;
    justify-content: center;
    align-items: center;

    margin: auto auto 30px;

    font-size: 45px;

    color: #b7c1ba;

    box-shadow: 0 0 35px rgba(120,150,130,.12);
}

.start-content h1 {
    font-size: clamp(38px, 8vw, 70px);

    letter-spacing: 8px;

    font-weight: 300;

    line-height: 1.05;
}

.start-content p {
    color: #92999f;

    line-height: 1.7;

    margin-top: 25px;
}

.start-content small {
    display: block;

    margin-top: 25px;

    color: #535b61;

    letter-spacing: 1px;
}

.main-button {
    margin-top: 35px;

    padding: 16px 42px;

    background: rgba(63, 83, 70, .35);

    border: 1px solid #617166;

    border-radius: 6px;

    color: white;

    cursor: pointer;

    letter-spacing: 3px;

    transition: .3s;
}

.main-button:hover {
    background: rgba(90,120,98,.45);

    transform: translateY(-2px);

    box-shadow: 0 0 30px rgba(100,130,110,.15);
}


/* =========================
   CELULAR
========================= */

.game-screen {
    width: 100%;
    height: 100vh;

    display: flex;
    align-items: center;
    justify-content: center;
}

.phone {
    width: min(430px, 100vw);

    height: min(850px, 100vh);

    background: var(--phone);

    overflow: hidden;

    position: relative;

    border-radius: 22px;

    box-shadow:
        0 0 80px rgba(0,0,0,.8);

    display: flex;

    flex-direction: column;
}


/* =========================
   STATUS BAR
========================= */

.status-bar {
    height: 32px;

    background: #0d1217;

    padding: 0 18px;

    display: flex;

    align-items: center;

    justify-content: space-between;

    font-size: 12px;

    z-index: 20;
}

.status-right {
    display: flex;

    gap: 9px;

    align-items: center;
}

.battery {
    width: 20px;
    height: 10px;

    border: 1px solid #aab1b0;

    border-radius: 2px;

    position: relative;
}

.battery::after {
    content: "";

    width: 2px;
    height: 5px;

    background: #aab1b0;

    position: absolute;

    right: -3px;
    top: 2px;
}

#batteryLevel {
    width: 80%;
    height: 100%;

    background: #aab1b0;
}


/* =========================
   TELAS INTERNAS
========================= */

.phone-screen {
    flex: 1;

    position: relative;

    overflow: hidden;
}


/* =========================
   HOME
========================= */

.wallpaper {
    height: 100%;

    padding: 35px 20px 80px;

    background:
        radial-gradient(
            circle at 50% 20%,
            rgba(78,97,87,.3),
            transparent 35%
        ),
        linear-gradient(
            160deg,
            #151c20,
            #070b0e 70%
        );

    position: relative;
}

.home-time {
    text-align: center;

    font-size: 52px;

    font-weight: 200;

    letter-spacing: 2px;
}

.home-date {
    text-align: center;

    color: #8d9693;

    margin-top: 5px;

    font-size: 12px;

    letter-spacing: 2px;
}


/* =========================
   NOTIFICAÇÕES
========================= */

.notification-area {
    min-height: 70px;

    margin-top: 30px;
}

.notification {
    background: rgba(24,30,35,.92);

    border: 1px solid #343d43;

    border-radius: 13px;

    padding: 12px;

    box-shadow: 0 10px 30px rgba(0,0,0,.3);

    animation: notification .5s ease;
}

.notification strong {
    display: block;

    font-size: 11px;

    margin-bottom: 5px;
}

.notification span {
    color: #b1b8b6;

    font-size: 12px;
}


/* =========================
   APLICATIVOS
========================= */

.apps {
    display: grid;

    grid-template-columns: repeat(4, 1fr);

    gap: 25px 12px;

    margin-top: 35px;
}

.app {
    border: none;

    background: transparent;

    color: white;

    position: relative;

    cursor: pointer;
}

.app-icon {
    width: 54px;
    height: 54px;

    margin: auto;

    display: flex;

    align-items: center;
    justify-content: center;

    border-radius: 14px;

    font-size: 27px;

    box-shadow: 0 7px 15px rgba(0,0,0,.25);
}

.messages-icon {
    background: #314a3b;
}

.gallery-icon {
    background: #4a4230;
}

.phone-icon {
    background: #35483b;

    font-size: 28px;
}

.clue-icon {
    background: #383c43;
}

.notes-icon {
    background: #4a4532;
}

.app span:last-of-type {
    display: block;

    margin-top: 7px;

    font-size: 10px;

    color: #c6cbc9;
}

.app b {
    position: absolute;

    top: -5px;
    right: 8px;

    width: 17px;
    height: 17px;

    background: #a65454;

    border-radius: 50%;

    font-size: 9px;

    display: flex;

    align-items: center;
    justify-content: center;
}


/* =========================
   DOCK
========================= */

.dock {
    position: absolute;

    bottom: 12px;
    left: 15px;
    right: 15px;

    height: 62px;

    background: rgba(25,31,36,.78);

    border: 1px solid #343b40;

    border-radius: 20px;

    display: flex;

    align-items: center;

    justify-content: space-around;

    backdrop-filter: blur(15px);
}

.dock button {
    border: none;

    background: transparent;

    font-size: 23px;

    cursor: pointer;
}


/* =========================
   APP HEADER
========================= */

.app-screen {
    background:
        radial-gradient(circle at top, #1b2228, #0d1115 60%);

    display: flex;
    flex-direction: column;
    min-height: 0;
}

.app-header {
    height: 68px;

    padding: 0 15px;

    display: flex;

    align-items: center;

    gap: 12px;

    background: #141a20;

    border-bottom: 1px solid #293038;
}

.simple-header {
    font-size: 15px;
}

.back-button {
    border: none;

    background: transparent;

    color: #b3bdb7;

    font-size: 36px;

    cursor: pointer;
}

.header-contact {
    display: flex;

    align-items: center;

    gap: 10px;
}

.contact-avatar {
    width: 40px;
    height: 40px;

    border-radius: 50%;

    border: 1px solid #5a6760;

    background: #20282e;

    display: flex;

    align-items: center;
    justify-content: center;
}

.header-contact strong {
    display: block;

    font-size: 13px;
}

.header-contact small {
    color: #708077;

    font-size: 10px;
}


/* =========================
   CHAT
========================= */
.chat {
    flex: 1;
    min-height: 0;

    overflow-y: auto;

    padding: 18px 14px;

    display: flex;

    flex-direction: column;

    gap: 9px;
}

.chat::-webkit-scrollbar {
    width: 3px;
}

.chat::-webkit-scrollbar-thumb {
    background: #39423e;
}

.date-divider {
    text-align: center;

    color: #646d72;

    font-size: 9px;

    letter-spacing: 2px;

    margin-bottom: 12px;
}

.message {
    max-width: 80%;

    padding: 11px 13px;

    border-radius: 12px;

    font-size: 13px;

    line-height: 1.5;

    animation: messageIn .35s ease;
}

.message.stranger {
    align-self: flex-start;

    background: var(--bubble);

    border-bottom-left-radius: 3px;
}

.message.player {
    align-self: flex-end;

    background: var(--player);

    border-bottom-right-radius: 3px;
}

.message-time {
    display: block;

    text-align: right;

    color: #6f7977;

    font-size: 8px;

    margin-top: 4px;
}

.typing {
    background: var(--bubble);

    padding: 10px 14px;

    width: fit-content;

    border-radius: 12px;

    display: flex;

    gap: 4px;
}

.typing span {
    width: 5px;
    height: 5px;

    background: #7e8883;

    border-radius: 50%;

    animation: typing 1s infinite;
}

.typing span:nth-child(2) {
    animation-delay: .15s;
}

.typing span:nth-child(3) {
    animation-delay: .3s;
}


/* =========================
   ESCOLHAS
========================= */

.choices {
    flex-shrink: 0;

    padding: 9px 12px;

    background: #10151a;

    border-top: 1px solid #2b3238;

    position: relative;

    z-index: 10;
}

.choices > span {
    display: block;

    text-align: center;

    color: #69736e;

    font-size: 9px;

    text-transform: uppercase;

    letter-spacing: 1px;
}

.choice-button {
    width: 100%;

    margin-top: 6px;

    padding: 10px;

    border-radius: 7px;

    background: #1d2821;

    border: 1px solid #3e4f43;

    color: #e1e8e3;

    cursor: pointer;

    font-size: 11px;
}

.choice-button:hover {
    background: #2b3b30;
}


/* =========================
   BARRA
========================= */

.message-bar {
    position: relative;

    flex-shrink: 0;

    left: auto;
    right: auto;
    bottom: auto;

    height: 55px;

    background: #11171c;

    border-top: 1px solid #293138;

    padding: 9px;

    display: flex;

    gap: 8px;
}

.message-bar div {
    flex: 1;

    background: #20272d;

    border-radius: 20px;

    display: flex;

    align-items: center;

    padding-left: 15px;

    color: #697279;

    font-size: 11px;
}

.message-bar button {
    width: 37px;

    border-radius: 50%;

    border: none;

    background: #344b3c;

    color: white;
}


/* =========================
   GALERIA
========================= */

.gallery-content {
    padding: 25px;
}

.locked-photo {
    height: 250px;

    border: 1px solid #343b41;

    border-radius: 12px;

    background:
        repeating-linear-gradient(
            45deg,
            #171d22,
            #171d22 10px,
            #14191e 10px,
            #14191e 20px
        );

    display: flex;

    flex-direction: column;

    justify-content: center;

    align-items: center;

    color: #89918f;
}

.locked-photo div {
    font-size: 35px;

    margin-bottom: 10px;
}

.locked-photo small {
    margin-top: 7px;

    color: #5f686d;
}

.fake-photo {
    height: 270px;

    background: #15191b;

    border: 1px solid #3a4245;

    border-radius: 10px;

    overflow: hidden;

    position: relative;
}

.photo-night {
    position: absolute;

    inset: 0;

    background:
        radial-gradient(
            circle at 75% 25%,
            #646b68 0 2%,
            transparent 3%
        ),
        linear-gradient(
            150deg,
            #343a39,
            #111516 65%
        );
}

.photo-person {
    position: absolute;

    width: 70px;
    height: 110px;

    left: 62%;

    top: 65px;

    background: #161a1b;

    border-radius: 45% 45% 20% 20%;

    display: flex;

    align-items: center;

    justify-content: center;

    color: #59615e;

    font-size: 30px;
}

.photo-caption {
    position: absolute;

    bottom: 0;

    left: 0;
    right: 0;

    padding: 9px;

    background: rgba(0,0,0,.6);

    font-size: 9px;

    color: #c3c8c6;
}

.photo-unlocked p {
    color: #89918e;

    font-size: 12px;

    line-height: 1.6;

    margin-top: 12px;
}


/* =========================
   TELEFONE
========================= */

.call-list {
    padding: 10px;
}

.call-item {
    padding: 15px 10px;

    border-bottom: 1px solid #252c32;

    display: flex;

    align-items: center;

    gap: 12px;
}

.call-icon {
    width: 38px;
    height: 38px;

    border-radius: 50%;

    background: #26382c;

    display: flex;

    align-items: center;
    justify-content: center;
}

.call-icon.missed {
    background: #493132;
}

.call-item div:nth-child(2) {
    flex: 1;
}

.call-item strong,
.call-item small {
    display: block;
}

.call-item strong {
    font-size: 12px;
}

.call-item small {
    color: #7e878b;

    font-size: 10px;

    margin-top: 4px;
}

.call-item > span {
    color: #737b80;

    font-size: 9px;
}

.call-button {
    display: block;

    margin: 35px auto;

    padding: 13px 20px;

    background: #2e4736;

    color: white;

    border: 1px solid #516a59;

    border-radius: 7px;

    cursor: pointer;
}


/* =========================
   PISTAS
========================= */

.clues-list {
    padding: 15px;
}

.clue {
    padding: 15px;

    margin-bottom: 10px;

    border: 1px solid #30383d;

    background: #171d22;

    border-radius: 9px;

    animation: messageIn .3s ease;
}

.clue strong {
    display: block;

    font-size: 12px;

    margin-bottom: 6px;
}

.clue p {
    color: #8b9492;

    font-size: 11px;

    line-height: 1.5;
}

.empty-clues {
    text-align: center;

    color: #5f696e;

    margin-top: 50px;

    font-size: 12px;
}


/* =========================
   NOTAS
========================= */

.notes-content {
    padding: 25px;
}

.notes-content h3 {
    font-size: 12px;

    letter-spacing: 2px;

    margin-bottom: 20px;
}

.notes-content p {
    color: #9aa29f;

    line-height: 1.8;

    font-size: 13px;

    white-space: pre-line;
}


/* =========================
   FINAL
========================= */

.end-screen {
    background:
        radial-gradient(circle, #17201b, #050707 65%);
}

.end-content {
    width: 90%;

    max-width: 450px;

    text-align: center;
}

.end-icon {
    width: 80px;
    height: 80px;

    border: 1px solid #637168;

    border-radius: 50%;

    margin: auto;

    display: flex;

    align-items: center;
    justify-content: center;

    font-size: 35px;
}

.end-content h1 {
    margin-top: 30px;

    letter-spacing: 5px;
}

.end-content p {
    color: #8d9692;

    margin-top: 15px;

    line-height: 1.7;
}


/* =========================
   ANIMAÇÕES
========================= */

@keyframes appear {

    from {
        opacity: 0;
        transform: translateY(15px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes messageIn {

    from {
        opacity: 0;
        transform: translateY(8px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes notification {

    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes typing {

    0%,100% {
        opacity: .3;
        transform: translateY(0);
    }

    50% {
        opacity: 1;
        transform: translateY(-3px);
    }
}


/* =========================
   CELULAR
========================= */

@media (max-width: 500px) {

    .phone {
        width: 100vw;
        height: 100vh;

        border-radius: 0;
    }

    .start-content h1 {
        letter-spacing: 5px;
    }
}

/* ==========================================================
   NOVA TELA INICIAL — NÚMERO DESCONHECIDO
   Visual cinematográfico de investigação / thriller urbano
   ========================================================== */
.start-screen {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    background: #05080a;
    color: #f3f5f4;
}

.menu-scene,
.menu-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.menu-scene {
    overflow: hidden;
    background:
        radial-gradient(circle at 76% 22%, rgba(35, 112, 119, .20), transparent 28%),
        radial-gradient(circle at 24% 45%, rgba(17, 73, 79, .18), transparent 30%),
        linear-gradient(125deg, #081014 0%, #071116 42%, #020507 100%);
}

/* janela urbana ao fundo */
.window-glow {
    position: absolute;
    width: 52vw;
    min-width: 520px;
    height: 70vh;
    right: -4vw;
    top: -5vh;
    background:
        linear-gradient(90deg, transparent 48%, rgba(135, 218, 223, .12) 49%, transparent 50%),
        linear-gradient(0deg, transparent 47%, rgba(135, 218, 223, .10) 48%, transparent 49%),
        radial-gradient(circle at 55% 58%, rgba(63, 205, 211, .28), transparent 4%),
        radial-gradient(circle at 23% 72%, rgba(28, 143, 157, .25), transparent 5%),
        linear-gradient(180deg, rgba(12, 39, 48, .75), rgba(2, 8, 11, .94));
    border: 1px solid rgba(109, 194, 199, .16);
    box-shadow: inset 0 0 80px rgba(0,0,0,.75), 0 0 50px rgba(38, 151, 160, .08);
    transform: perspective(900px) rotateY(-3deg);
}

.window-frame::before,
.window-frame::after {
    content: "";
    position: absolute;
    background: rgba(100, 168, 173, .12);
    z-index: 2;
}
.window-frame::before { width: 2px; height: 75vh; right: 25vw; top: 0; }
.window-frame::after { height: 2px; width: 54vw; right: 0; top: 43vh; }

/* chuva */
.rain {
    position: absolute;
    inset: -20%;
    opacity: .25;
    background-image: repeating-linear-gradient(108deg, transparent 0 15px, rgba(166,225,229,.18) 16px, transparent 17px 34px);
    transform: rotate(2deg);
    animation: rainMove 9s linear infinite;
}
.rain-b { opacity: .10; transform: rotate(2deg) scale(1.15); animation-duration: 14s; }

/* mesa */
.desk {
    position: absolute;
    left: -4%;
    right: -4%;
    bottom: -4vh;
    height: 34vh;
    background:
        linear-gradient(175deg, rgba(45,55,56,.9), rgba(12,17,19,.98) 45%, #050708 100%);
    border-top: 1px solid rgba(123,160,157,.25);
    box-shadow: 0 -25px 70px rgba(0,0,0,.55);
    transform: perspective(800px) rotateX(5deg);
}
.desk-edge {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 28vh;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(100,202,207,.25), transparent);
}

/* luminária */
.desk-lamp {
    position: absolute;
    left: 10%;
    top: 7%;
    width: 210px;
    height: 230px;
    transform: rotate(-13deg);
    filter: drop-shadow(0 0 22px rgba(255, 188, 101, .18));
}
.desk-lamp::before {
    content: "";
    position: absolute;
    width: 9px;
    height: 155px;
    left: 85px;
    top: 45px;
    background: linear-gradient(#2d3637, #0c1011);
    border-radius: 8px;
    transform: rotate(26deg);
    transform-origin: top;
}
.desk-lamp::after {
    content: "";
    position: absolute;
    width: 125px;
    height: 62px;
    left: 38px;
    top: 12px;
    background: linear-gradient(180deg, #394447, #12191b);
    border-radius: 80% 80% 28% 28%;
    transform: rotate(-9deg);
    box-shadow: inset 0 -8px 12px rgba(0,0,0,.5), 0 7px 18px rgba(0,0,0,.4);
}
.desk-lamp span {
    position: absolute;
    width: 60px;
    height: 25px;
    left: 70px;
    top: 63px;
    border-radius: 50%;
    background: #f2c97c;
    box-shadow: 0 0 45px 18px rgba(255, 188, 94, .18);
}

/* objetos da mesa */
.paper {
    position: absolute;
    width: 220px;
    height: 120px;
    bottom: 10vh;
    background: linear-gradient(135deg, #b9b09a, #6c675b);
    box-shadow: 0 12px 24px rgba(0,0,0,.42);
    opacity: .72;
}
.paper::after {
    content: "////  22:18\A  HELENA\A  K.R.\A  NÃO OLHE PARA TRÁS";
    white-space: pre;
    position: absolute;
    inset: 14px;
    color: rgba(30,30,28,.65);
    font: 9px/1.65 monospace;
}
.paper-1 { left: 39%; transform: rotate(-5deg); }
.paper-2 { left: 48%; bottom: 13vh; transform: rotate(7deg); width: 190px; opacity: .45; }
.paper-3 { right: 11%; bottom: 7vh; transform: rotate(-9deg); width: 170px; opacity: .38; }

.case-file {
    position: absolute;
    right: 19%;
    bottom: 12vh;
    width: 92px;
    height: 116px;
    padding: 13px;
    border: 1px solid rgba(197,165,101,.55);
    background: linear-gradient(145deg, #20272a, #0b1012);
    color: #c9b681;
    font: 10px/1.4 monospace;
    letter-spacing: 2px;
    transform: rotate(7deg);
    box-shadow: 0 15px 25px rgba(0,0,0,.4);
}
.case-file b { font-size: 34px; }

.desk-phone {
    position: absolute;
    left: 28%;
    bottom: 9vh;
    width: 110px;
    height: 65px;
    border-radius: 18px 18px 10px 10px;
    display: grid;
    place-items: center;
    background: linear-gradient(145deg, #22282a, #090c0d);
    border: 1px solid #4b5250;
    color: #8b9896;
    font-size: 34px;
    transform: rotate(-6deg);
    box-shadow: 0 15px 24px rgba(0,0,0,.55);
}

.magnifier {
    position: absolute;
    right: 8%;
    bottom: 18vh;
    font-size: 72px;
    color: rgba(116, 192, 196, .30);
    transform: rotate(-24deg);
}

.menu-overlay {
    z-index: 3;
    background:
        linear-gradient(90deg, rgba(2,5,7,.98) 0%, rgba(2,6,8,.82) 30%, rgba(2,5,7,.28) 60%, rgba(2,5,7,.68) 100%),
        linear-gradient(0deg, rgba(0,0,0,.82), transparent 35%, rgba(0,0,0,.24));
}

.start-content {
    position: relative;
    z-index: 5;
    width: min(760px, 92vw);
    text-align: center;
    animation: menuAppear .9s ease both;
    text-shadow: 0 3px 18px rgba(0,0,0,.8);
}

.eyebrow,
.menu-subtitle {
    font-family: Georgia, 'Times New Roman', serif;
    letter-spacing: 4px;
    color: #b9c7c6;
}
.eyebrow { font-size: clamp(11px, 1.5vw, 16px); }
.menu-subtitle { margin-top: 8px; font-size: clamp(12px, 1.7vw, 18px); }

.title-mark {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    margin: 25px auto 8px;
}
.mark-line {
    width: 90px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(94,225,231,.65));
}
.mark-line:last-child { background: linear-gradient(90deg, rgba(240,177,100,.65), transparent); }

.mystery-icon {
    width: 48px;
    height: 48px;
    margin: 0;
    border: 1px solid rgba(91,224,230,.7);
    border-radius: 50%;
    display: grid;
    place-items: center;
    font: 24px Georgia, serif;
    color: #9df0f1;
    background: rgba(7,24,28,.72);
    box-shadow: 0 0 28px rgba(50,204,211,.18), inset 0 0 16px rgba(50,204,211,.08);
}

.start-content h1 {
    margin-top: 8px;
    font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
    font-size: clamp(58px, 9vw, 118px);
    line-height: .82;
    letter-spacing: 2px;
    font-weight: 900;
    color: #e9eeee;
    -webkit-text-stroke: 1px rgba(91,224,230,.65);
    text-shadow: 0 0 16px rgba(80,211,218,.12), 5px 7px 0 rgba(0,0,0,.42);
}
.start-content h1 span {
    color: #dfe8e8;
    -webkit-text-stroke-color: rgba(232,168,99,.72);
}

.tagline {
    margin-top: 22px !important;
    color: #aab8b8 !important;
    font: 11px/1.7 Arial, sans-serif !important;
    letter-spacing: 2px;
}

.menu-buttons {
    display: grid;
    grid-template-columns: repeat(4, minmax(120px, 1fr));
    gap: 12px;
    width: min(720px, 92vw);
    margin: 30px auto 0;
}
.menu-button {
    min-height: 54px;
    padding: 10px 13px;
    border: 1px solid rgba(75, 206, 214, .55);
    background: linear-gradient(180deg, rgba(8,31,35,.82), rgba(5,14,17,.92));
    color: #d9e5e4;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    font-size: 12px;
    letter-spacing: 1px;
    transition: .25s ease;
    box-shadow: inset 0 0 18px rgba(49,191,198,.06), 0 8px 20px rgba(0,0,0,.28);
}
.menu-button:nth-child(2),
.menu-button:nth-child(4) { border-color: rgba(226,165,97,.62); }
.menu-button:hover {
    transform: translateY(-3px);
    background: linear-gradient(180deg, rgba(17,59,63,.9), rgba(6,17,20,.96));
    box-shadow: 0 0 22px rgba(61,210,218,.15), 0 10px 25px rgba(0,0,0,.4);
}
.menu-button:nth-child(2):hover,
.menu-button:nth-child(4):hover { box-shadow: 0 0 22px rgba(225,163,93,.13), 0 10px 25px rgba(0,0,0,.4); }
.button-icon { font-size: 18px; color: #83e9ec; }
.menu-button:nth-child(2) .button-icon,
.menu-button:nth-child(4) .button-icon { color: #edb26d; }

.menu-footer {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    color: rgba(172,188,187,.58);
    font: 9px monospace;
    letter-spacing: 2px;
}

@keyframes menuAppear {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes rainMove {
    from { transform: translate3d(0,-25px,0) rotate(2deg); }
    to { transform: translate3d(-35px,55px,0) rotate(2deg); }
}

@media (max-width: 720px) {
    .window-glow { width: 90vw; min-width: 0; right: -25vw; opacity: .7; }
    .desk-lamp { transform: scale(.72) rotate(-13deg); transform-origin: top left; left: 2%; }
    .paper-1 { left: 25%; width: 160px; }
    .case-file { right: 6%; }
    .menu-buttons { grid-template-columns: repeat(2, 1fr); }
    .start-content h1 { font-size: clamp(52px, 16vw, 84px); }
    .eyebrow { letter-spacing: 2px; }
    .menu-footer { padding: 0 10px; }
}

@media (max-width: 430px) {
    .menu-buttons { gap: 8px; margin-top: 22px; }
    .menu-button { min-height: 48px; font-size: 10px; }
    .start-content h1 { font-size: 50px; }
    .tagline { font-size: 9px !important; }
    .desk-phone, .magnifier { display: none; }
}

/* ==========================================================
   VERSÃO FINAL DA TELA INICIAL — INVESTIGAÇÃO CINEMATOGRÁFICA
   ========================================================== */
.start-screen {
    background: #020507;
}
.start-screen::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 4;
    pointer-events: none;
    background:
        radial-gradient(circle at 50% 48%, transparent 0 24%, rgba(0,0,0,.16) 52%, rgba(0,0,0,.72) 100%),
        linear-gradient(90deg, rgba(0,0,0,.72), transparent 34%, transparent 68%, rgba(0,0,0,.46));
}
.menu-scene { background:
    radial-gradient(circle at 77% 25%, rgba(33,184,198,.24), transparent 25%),
    radial-gradient(circle at 18% 40%, rgba(31,102,116,.20), transparent 28%),
    linear-gradient(115deg,#050b0e 0%,#09171b 45%,#020507 100%);
}
.window-glow {
    width: 58vw; min-width: 520px; height: 76vh; right: -3vw; top: -4vh;
    background:
      repeating-linear-gradient(90deg, transparent 0 12%, rgba(103,211,219,.10) 12.2% 12.45%, transparent 12.7% 25%),
      repeating-linear-gradient(0deg, transparent 0 16%, rgba(103,211,219,.07) 16.2% 16.5%, transparent 16.8% 33%),
      radial-gradient(circle at 62% 60%, rgba(59,220,228,.30), transparent 3%),
      radial-gradient(circle at 22% 76%, rgba(31,150,167,.28), transparent 4%),
      linear-gradient(180deg,rgba(10,47,58,.78),rgba(2,9,12,.96));
}
.window-glow::after {
    content:""; position:absolute; inset:0;
    background: repeating-linear-gradient(100deg, transparent 0 17px, rgba(210,245,245,.08) 18px 19px, transparent 20px 42px);
    opacity:.45; animation: rainMove 8s linear infinite;
}
.desk {
    height: 31vh;
    background: linear-gradient(175deg,#252b2c 0%,#111719 34%,#050708 100%);
}
.desk::before {
    content:""; position:absolute; left:7%; right:7%; top:15%; height:1px;
    background:linear-gradient(90deg,transparent,rgba(100,213,218,.32),transparent);
    box-shadow:0 55px 0 rgba(0,0,0,.35);
}
.paper { filter: contrast(1.08); }
.case-file { border-color:rgba(236,171,95,.62); }
.desk-phone { color:#a5c8c8; }
.start-content { max-width: 1040px; }
.eyebrow { text-shadow:0 0 18px rgba(111,222,227,.12); }
.start-content h1 {
    font-size: clamp(62px, 9.5vw, 132px);
    letter-spacing: 3px;
    transform: scaleX(.94);
}
.start-content h1 span { color:#e5eeee; }
.tagline { letter-spacing:3px; }
.menu-buttons {
    grid-template-columns: repeat(5, minmax(120px,1fr));
    width:min(980px,94vw);
}
.menu-button {
    min-height:58px;
    border-radius:3px;
    text-transform:uppercase;
    font-weight:600;
    letter-spacing:1.5px;
    backdrop-filter: blur(5px);
}
.menu-button.primary { box-shadow:0 0 28px rgba(63,216,223,.10), inset 0 0 20px rgba(63,216,223,.08); }
.menu-button:nth-child(2), .menu-button:nth-child(4), .menu-button.exit-button {
    border-color:rgba(235,169,97,.66);
}
.menu-button.exit-button .button-icon { color:#efad68; }
.menu-button:active { transform:translateY(0) scale(.98); }
.menu-footer { margin-top:18px; }

@media (max-width: 900px) {
    .menu-buttons { grid-template-columns:repeat(3,1fr); }
}
@media (max-width: 620px) {
    .menu-buttons { grid-template-columns:repeat(2,1fr); }
    .window-glow { width:100vw; right:-38vw; }
    .start-content h1 { font-size:clamp(48px,15vw,82px); }
}

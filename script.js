/* =========================================================
   Utilidades
========================================================= */
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

function pad(n) {
  return String(n).padStart(2, "0");
}

/* =========================================================
   1) BOOT SEQUENCE
========================================================= */
const bootLines = [
  " ┌─┐┌─┐┬─┐┌┬┐┌─┐┌─┐┬  ┬┌─┐",
  " ├─┘│ │├┬┘ │ ├┤ │ ││  │ │",
  " ┴  └─┘┴└─ ┴ └  └─┘┴─┘┴└─┘",
  "SYS_NAME: PORTFOLIO_CORE_v1.0",
  "KERNEL: 6.5.0-WEB",
  "INIT: cargando módulos de presentación...",
  "MOUNT: /proyectos  /habilidades  /contacto  ... OK",
  "CHECK: accesibilidad ......... OK",
  "CHECK: responsive ............ OK",
  "STATUS: listo para renderizar UI",
];

function runBoot() {
  const overlay = document.getElementById("boot-overlay");
  const textEl = document.getElementById("boot-text");

  if (reduceMotion) {
    overlay.classList.add("is-hidden");
    return;
  }

  let i = 0;
  let out = "";

  function typeLine() {
    if (i >= bootLines.length) {
      out += '\n> listo. <span class="cursor-blink"></span>';
      textEl.innerHTML = out;
      setTimeout(() => overlay.classList.add("is-hidden"), 500);
      return;
    }
    out += (i > 0 ? "\n" : "") + bootLines[i];
    textEl.innerHTML = out + ' <span class="cursor-blink"></span>';
    i++;
    setTimeout(typeLine, 160);
  }
  typeLine();
}

/* =========================================================
   2) RELOJ Y UPTIME EN VIVO
========================================================= */
const startTime = Date.now();

function tickClock() {
  const now = new Date();
  document.getElementById("clock").textContent =
    `LOCAL: ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
  const h = Math.floor(elapsedSec / 3600);
  const m = Math.floor((elapsedSec % 3600) / 60);
  const s = elapsedSec % 60;
  document.getElementById("uptime").textContent =
    `UPTIME: ${pad(h)}:${pad(m)}:${pad(s)}`;
}

/* =========================================================
   3) TABS DEL WORKSPACE (case_studies / details / gallery / ...)
========================================================= */
function activateTab(name) {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach((t) => {
    const active = t.dataset.panel === name;
    t.classList.toggle("is-active", active);
    t.setAttribute("aria-selected", active ? "true" : "false");
  });
  panels.forEach((p) => {
    p.classList.toggle("is-active", p.dataset.panel === name);
  });
}

function setupTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab.dataset.panel));
  });
}

/* Enlaces del sidebar (QUICK_ACCESS) que abren una pestaña específica
   dentro del workspace, además de hacer scroll hasta él. */
function setupQuickAccess() {
  document.querySelectorAll(".quick-access a[data-tab]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      activateTab(link.dataset.tab);
      document
        .getElementById("workspace")
        .scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
    });
  });
}

/* =========================================================
   5) MATRIX RAIN (canvas ambiental de fondo)
========================================================= */
function setupMatrixRain() {
  const canvas = document.getElementById("matrix-rain");
  if (!canvas || reduceMotion) return; // sin animación si se prefiere menos movimiento

  const ctx = canvas.getContext("2d");
  const chars = "01アイウエオカキクケコ{}[]<>/\\;:_-+=$#·".split("");
  let cols, drops;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / 16);
    drops = new Array(cols).fill(0).map(() => Math.random() * -50);
  }
  resize();
  window.addEventListener("resize", resize);

  function draw() {
    ctx.fillStyle = "rgba(10,11,13,0.09)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '14px "JetBrains Mono", monospace';

    for (let i = 0; i < cols; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * 16;
      const y = drops[i] * 16;
      ctx.fillStyle = Math.random() > 0.94 ? "#55d6c2" : "#ffa62b";
      ctx.fillText(char, x, y);
      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }
  setInterval(draw, 60);
}

/* =========================================================
   6) SCRAMBLE / DECRYPT TEXT (nombre del sidebar)
========================================================= */
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ01#$%&*";

function scrambleReveal(el) {
  const final = el.dataset.text;
  if (reduceMotion) {
    el.textContent = final;
    return;
  }

  let frame = 0;
  const totalFrames = 18;
  clearInterval(el._scrambleTimer);

  el._scrambleTimer = setInterval(() => {
    frame++;
    const revealCount = Math.floor((frame / totalFrames) * final.length);
    let out = "";
    for (let i = 0; i < final.length; i++) {
      if (i < revealCount) {
        out += final[i];
      } else if (final[i] === " ") {
        out += " ";
      } else {
        out +=
          SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
    }
    el.textContent = out;
    if (frame >= totalFrames) {
      el.textContent = final;
      clearInterval(el._scrambleTimer);
    }
  }, 40);
}

function setupScrambleName() {
  const lines = document.querySelectorAll(".scramble-line");
  lines.forEach((el, i) => {
    setTimeout(() => scrambleReveal(el), i * 120);
  });
  const heading = document.getElementById("scramble-name");
  if (heading) {
    heading.addEventListener("mouseenter", () => {
      lines.forEach((el, i) => setTimeout(() => scrambleReveal(el), i * 60));
    });
  }
}

/* =========================================================
   7) SYS_METER (CPU / MEM / NET simulados, con vida propia)
========================================================= */
function setupSysMeter() {
  const meters = document.querySelectorAll("[data-meter]");
  if (!meters.length) return;

  function update() {
    meters.forEach((meter) => {
      const value = 15 + Math.floor(Math.random() * 70);
      meter.style.width = value + "%";
      const label = document.querySelector(
        `[data-val="${meter.dataset.meter}"]`,
      );
      if (label) label.textContent = value + "%";
    });
  }
  update();
  setInterval(update, reduceMotion ? 4000 : 2200);
}

/* =========================================================
   8) STATUS LOG TICKER (barra superior)
========================================================= */
const statusLogLines = [
  "&gt; render_loop: 60fps estables",
  "&gt; cache: warm",
  "&gt; paquetes_de_datos: nominal",
  "&gt; sin errores en consola",
  "&gt; accesibilidad: focus-visible activo",
  "&gt; esperando input del visitante...",
];

function setupStatusLog() {
  const el = document.getElementById("status-log");
  if (!el) return;
  let i = 0;
  function next() {
    el.style.opacity = 0;
    setTimeout(
      () => {
        i = (i + 1) % statusLogLines.length;
        el.innerHTML = statusLogLines[i];
        el.style.opacity = 0.85;
      },
      reduceMotion ? 0 : 250,
    );
  }
  el.style.transition = "opacity .25s ease";
  setInterval(next, 4200);
}

/* =========================================================
   9) EASTER EGG — CÓDIGO KONAMI
========================================================= */
function setupKonami() {
  const sequence = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  let progress = 0;

  document.addEventListener("keydown", (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    progress = key === sequence[progress] ? progress + 1 : 0;

    if (progress === sequence.length) {
      progress = 0;
      const egg = document.getElementById("easter-egg");
      egg.classList.add("is-active");
      setTimeout(() => egg.classList.remove("is-active"), 5000);
    }
  });
}

/* =========================================================
   4) SHELL INTERACTIVA (comandos reales)
========================================================= */
function setupShell() {
  const input = document.getElementById("term-input");
  const out = document.getElementById("term-output");
  const history = [];
  let historyIndex = -1;

  function print(text, cls) {
    const p = document.createElement("p");
    if (cls) p.className = cls;
    p.textContent = text;
    out.appendChild(p);
    out.scrollTop = out.scrollHeight;
  }

  function printCmd(cmd) {
    print(`visitante@portfolio:~$ ${cmd}`, "line-cmd");
  }

  const commands = {
    help() {
      print(
        "Comandos disponibles: help, about, projects, skills, gallery, contact, whoami, sudo hire-me, clear",
      );
    },
    about() {
      print(
        "Reemplaza este texto con tu bio real (quién eres, qué construyes).",
      );
    },
    projects() {
      activateTab("cases");
      print("Abriendo case_studies.sh...", "line-dim");
    },
    skills() {
      activateTab("details");
      print("Abriendo my_details.json...", "line-dim");
    },
    gallery() {
      activateTab("gallery");
      print("Abriendo gallery.sh...", "line-dim");
    },
    contact() {
      document
        .getElementById("contacto")
        .scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      print("Saltando a contacto...", "line-dim");
    },
    whoami() {
      print("visitante — con curiosidad por tu trabajo.");
    },
    clear() {
      out.innerHTML = "";
    },
    "sudo hire-me"() {
      print(
        "Permission granted. ✅  Revisa la sección de contacto para escribirle.",
        "line-dim",
      );
    },
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const raw = input.value.trim();
      if (raw === "") {
        return;
      }
      printCmd(raw);
      history.push(raw);
      historyIndex = history.length;

      const cmd = raw.toLowerCase();
      if (commands[cmd]) {
        commands[cmd]();
      } else {
        print(`command not found: ${raw} — escribe "help"`, "line-err");
      }
      input.value = "";
    } else if (e.key === "ArrowUp") {
      if (historyIndex > 0) {
        historyIndex--;
        input.value = history[historyIndex];
      }
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      if (historyIndex < history.length - 1) {
        historyIndex++;
        input.value = history[historyIndex];
      } else {
        historyIndex = history.length;
        input.value = "";
      }
      e.preventDefault();
    }
  });
}

/* =========================================================
   INIT
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  runBoot();
  tickClock();
  setInterval(tickClock, 1000);
  setupTabs();
  setupQuickAccess();
  setupShell();
  setupMatrixRain();
  setupScrambleName();
  setupSysMeter();
  setupStatusLog();
  setupKonami();
  document.getElementById("year").textContent = new Date().getFullYear();
});

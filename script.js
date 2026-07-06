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
  "INIT: loading presentation modules...",
  "MOUNT: /projects  /skills  /contact  ... OK",
  "CHECK: accessibility ......... OK",
  "CHECK: responsive ............ OK",
  "STATUS: ready to render UI",
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
      out += '\n> ready. <span class="cursor-blink"></span>';
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
      document.getElementById("workspace").scrollIntoView({
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
   4) SHELL INTERACTIVA (comandos reales y simulación)
========================================================= */
function setupShell() {
  const input = document.getElementById("term-input");
  const out =
    document.getElementById("term-output") ||
    document.querySelector(".terminal__body");
  const shellPanel = document.querySelector('[data-panel="shell"]');

  if (!input || !out) return;

  // Forzar el foco en el input al hacer clic en la terminal
  if (shellPanel) {
    shellPanel.addEventListener("click", () => {
      input.focus();
    });
  }

  // ¡AQUÍ ESTÁ LA VARIABLE! (Asegúrate de que solo exista esta vez en todo tu archivo)
  const fakeFileSystem = {
    "sobre_mi.txt":
      "Estudiante de Ingeniería de Sistemas (UNAL, 2022-2027) y Data Analyst Assistant. Frontend developer con base sólida en DevOps, análisis de datos, aprendizaje rápido y liderazgo de equipos.",
    "proyectos.json":
      '[\n  {\n    "nombre": "AgroWeb.app",\n    "status": "Online"\n  },\n  {\n    "nombre": "Arquisoft.app (FinOps)",\n    "status": "Online"\n  },\n  {\n    "nombre": "UwUteca.app",\n    "status": "Online"\n  },\n  {\n    "nombre": "ECDSA.app",\n    "status": "Online"\n  }\n]',
    "contacto.sh":
      "#!/bin/bash\necho 'Email: tu@email.com'\necho 'GitHub: github.com/DanielS1103'\necho 'LinkedIn: linkedin.com/in/daniel-alejandro-acosta-avila'",
  };

  const history = [];
  let historyIndex = -1;

  function print(text, cls = "") {
    const p = document.createElement("p");
    if (cls) p.className = cls;
    p.innerHTML = text;
    out.appendChild(p);
    out.scrollTop = out.scrollHeight;
  }

  function printCmd(cmd) {
    print(
      `<span class="prompt" style="color: var(--cyan); font-weight: bold; margin-right: 8px; text-shadow: 0 0 3px rgba(85, 214, 194, 0.3);">visitant@portfolio:~$</span> <span style="color: #ffffff;">${cmd}</span>`,
      "line-cmd",
    );
  }

  const commands = {
    help() {
      print(
        "Commands: <span style='color: var(--cyan)'>ls, cat, whoami, neofetch, clear, sudo</span>",
      );
    },
    ls() {
      const files = Object.keys(fakeFileSystem)
        .map((f) => {
          if (f.endsWith(".sh"))
            return `<span style="color: var(--cyan); font-weight: bold;">${f}</span>`;
          if (f.endsWith(".json"))
            return `<span style="color: var(--amber);">${f}</span>`;
          return `<span>${f}</span>`;
        })
        .join("    ");
      print(files || "Directory empty.");
    },
    cat(args) {
      if (!args) {
        print("Usage: cat [filename]", "line-err");
        return;
      }
      if (fakeFileSystem[args]) {
        print(fakeFileSystem[args].replace(/\n/g, "<br>"));
      } else {
        print(`cat: ${args}: File not found.`, "line-err");
      }
    },
    whoami() {
      print("visitant@portfolio — Privileges: Guest");
    },
    neofetch() {
      print(
        `
<span style="color: var(--amber)">.-----.</span>    OS: Web Terminal Edition
<span style="color: var(--amber)">/ _ _ \\</span>    KERNEL: JS-Engine
<span style="color: var(--amber)">| | | |</span>    UPTIME: Overclocked
<span style="color: var(--amber)">\\ ^ ^ /</span>    BROWSER: ${navigator.userAgent.split(" ")[0]}
<span style="color: var(--amber)">'-----'</span>    
      `,
        "line-dim",
      );
    },
    clear() {
      out.innerHTML = "";
    },
    sudo() {
      print(
        "Access granted. Your privileges have been escalated temporarily.",
        "line-dim",
      );
    },
  };

  input.addEventListener("keydown", (e) => {
    // 1. Simulación de Ctrl + C
    if (e.ctrlKey && e.key.toLowerCase() === "c") {
      printCmd(input.value + "^C");
      input.value = "";
      e.preventDefault();
      return;
    }

    // 2. Comportamiento tecla Enter
    if (e.key === "Enter") {
      const raw = input.value.trim();

      if (raw === "") {
        printCmd("");
        return;
      }

      printCmd(raw);
      history.push(raw);
      historyIndex = history.length;

      const parts = raw.split(" ");
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1).join(" ");

      if (commands[cmd]) {
        commands[cmd](args);
      } else {
        print(
          `bash: ${cmd}: command not found — type "<span style='color: var(--amber)'>help</span>"`,
          "line-err",
        );
      }
      input.value = "";
    }
    // 3. Historial
    else if (e.key === "ArrowUp") {
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
   10) REVEAL ON SCROLL (aparición progresiva de tarjetas)
========================================================= */
function setupRevealOnScroll() {
  const selector =
    ".project-card, .badge-box, .changelog__entry, .gallery-item, .mw";
  const targets = document.querySelectorAll(selector);
  if (!targets.length) return;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = Array.from(el.parentElement.children).filter((c) =>
          c.matches(selector),
        );
        const index = siblings.indexOf(el);
        el.style.transitionDelay = `${Math.min(index, 8) * 70}ms`;
        el.classList.add("is-visible");
        obs.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
  );

  targets.forEach((el) => observer.observe(el));
}

/* =========================================================
   11) EASTER EGG DE CONSOLA
========================================================= */
function logConsoleEasterEgg() {
  console.log(
    "%c> SYSTEM://PORTFOLIO_v1.0",
    "color:#ffa62b;font-family:monospace;font-size:14px;font-weight:bold;",
  );
  console.log(
    "%c¿Inspeccionando el código? Bien, eso me gusta.\nSi querés hablar de una oportunidad: tu@email.com\nGitHub: github.com/DanielS1103",
    "color:#55d6c2;font-family:monospace;font-size:12px;",
  );
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
  setupRevealOnScroll();
  logConsoleEasterEgg();
  document.getElementById("year").textContent = new Date().getFullYear();
});

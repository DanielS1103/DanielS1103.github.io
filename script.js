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
      document.getElementById("workspace").scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
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
  document.getElementById("year").textContent = new Date().getFullYear();
});

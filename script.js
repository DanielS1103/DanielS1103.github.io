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
   3) TABS DE LA TERMINAL (contenido estático por pestaña)
========================================================= */
const tabContent = {
  about: [
    { cls: "line-cmd", text: "$ cat sobre_mi.txt" },
    {
      cls: "",
      text: "Reemplaza este texto con tu bio real: quién eres, qué construyes",
    },
    {
      cls: "",
      text: "y qué tipo de proyectos te interesan. 2-4 líneas es suficiente.",
    },
    {
      cls: "line-dim",
      text: "// tip: cuenta un logro concreto, no solo adjetivos.",
    },
  ],
  skills: [
    { cls: "line-cmd", text: "$ cat habilidades.json" },
    { cls: "", text: '{ "frontend": ["HTML", "CSS", "JavaScript", "..."],' },
    { cls: "", text: '  "backend":  ["Node", "Python", "..."],' },
    { cls: "", text: '  "tools":    ["Git", "Docker", "..."] }' },
    { cls: "line-dim", text: "// reemplaza con tu stack real." },
  ],
  help: [
    { cls: "line-cmd", text: "$ ./help.sh" },
    {
      cls: "",
      text: "Esta terminal también es interactiva: usa el campo de abajo.",
    },
    {
      cls: "",
      text: "Comandos: help, about, projects, skills, contact, whoami, clear",
    },
  ],
};

function renderTab(name) {
  const out = document.getElementById("term-output");
  out.innerHTML = "";
  tabContent[name].forEach((line) => {
    const p = document.createElement("p");
    if (line.cls) p.className = line.cls;
    p.textContent = line.text;
    out.appendChild(p);
  });
}

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      renderTab(tab.dataset.tab);
    });
  });
  renderTab("about");
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
        "Comandos disponibles: help, about, projects, skills, contact, whoami, sudo hire-me, clear",
      );
    },
    about() {
      print(
        "Reemplaza este texto con tu bio real (quién eres, qué construyes).",
      );
    },
    projects() {
      document
        .getElementById("proyectos")
        .scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      print("Saltando a la sección de proyectos...", "line-dim");
    },
    skills() {
      renderTab("skills");
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("is-active"));
      document.querySelector('[data-tab="skills"]').classList.add("is-active");
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
  setupShell();
  document.getElementById("year").textContent = new Date().getFullYear();
});

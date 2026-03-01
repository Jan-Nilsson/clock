const tabs = document.querySelectorAll("nav a");

function updateTabs() {
  tabs.forEach(t => t.classList.remove("active-tab"));
  const hash = location.hash || "#clock";
  const active = document.querySelector(`nav a[href="${hash}"]`);
  if (active) active.classList.add("active-tab");
}

window.addEventListener("hashchange", updateTabs);
updateTabs();

const toggleButton = document.getElementById("theme-toggle");

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(dark) {
  document.body.setAttribute("data-theme", dark ? "dark" : "light");
  toggleButton.textContent = dark ? "light_mode" : "dark_mode";
}

applyTheme(mediaQuery.matches);

mediaQuery.addEventListener("change", e => applyTheme(e.matches));

toggleButton.addEventListener("click", () => {
  const current = document.body.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.body.setAttribute("data-theme", next);
  toggleButton.textContent = next === "dark" ? "light_mode" : "dark_mode";
});

function parseISOTimeToSeconds(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)(?:\.\d+)?S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || "0");
  const m = parseInt(match[2] || "0");
  const s = parseInt(match[3] || "0");
  return h * 3600 + m * 60 + s;
}

function setupControls(ctrl) {
  const start = ctrl.querySelector(".start");
  const pause = ctrl.querySelector(".pause");
  const restart = ctrl.querySelector(".restart");
  const timeEl = ctrl.closest("section").querySelector("time");

  if (!start || !pause) return;

  pause.classList.add("hidden");

  start.addEventListener("click", () => {
    start.classList.add("hidden");
    pause.classList.remove("hidden");
  });

  pause.addEventListener("click", () => {
    pause.classList.add("hidden");
    start.classList.remove("hidden");
  });

  if (restart) {
    restart.addEventListener("click", () => {
      start.classList.remove("hidden");
      pause.classList.add("hidden");
    });
  }

  setupToggleButtons(ctrl, ".loop", ".no-loop", "loop");

  return { timeEl, restart };
}

function setupToggleButtons(ctrl, btnASelector, btnBSelector, attributeName) {
  const btnA = ctrl.querySelector(btnASelector);
  const btnB = ctrl.querySelector(btnBSelector);
  const container = ctrl.closest("x-timer");
  if (!btnA || !btnB || !container) return;

  if (container.hasAttribute(attributeName)) {
    btnA.classList.remove("hidden");
    btnB.classList.add("hidden");
  } else {
    btnA.classList.add("hidden");
    btnB.classList.remove("hidden");
  }

  btnA.addEventListener("click", () => {
    container.setAttribute(attributeName, "");
    btnA.classList.add("hidden");
    btnB.classList.remove("hidden");
  });

  btnB.addEventListener("click", () => {
    container.removeAttribute(attributeName);
    btnB.classList.add("hidden");
    btnA.classList.remove("hidden");
  });
}

const controlsList = [];
document.querySelectorAll(".controls").forEach(ctrl => {
  const info = setupControls(ctrl);
  if (info) controlsList.push(info);
});

function updateRestartButtons() {
  document.querySelectorAll("x-stopwatch, x-timer").forEach(el => {
    const timeEl = el.querySelector("time");
    const restartBtn = el.querySelector("button.restart");
    if (!timeEl || !restartBtn) return;

    const match = timeEl.getAttribute("datetime").match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
    const seconds = match
      ? parseInt(match[1] || 0) * 3600 + parseInt(match[2] || 0) * 60 + parseFloat(match[3] || 0)
      : 0;

    if (seconds === 0) restartBtn.classList.add("disabled-button");
    else restartBtn.classList.remove("disabled-button");
  });
}

setInterval(updateRestartButtons, 200);

document.addEventListener("keydown", e => {
  const activeTab = document.querySelector(location.hash || "#clock");
  if (!activeTab) return;
  const ctrl = activeTab.querySelector(".controls");
  if (!ctrl) return;

  const start = ctrl.querySelector(".start");
  const pause = ctrl.querySelector(".pause");
  const restart = ctrl.querySelector(".restart");
  const loopBtn = ctrl.querySelector(".loop");
  const noLoopBtn = ctrl.querySelector(".no-loop");
  const container = ctrl.closest("x-timer");

  if (e.code === "Space" && location.hash !== "#alarm") {
    e.preventDefault();
    if (start && !start.classList.contains("hidden")) start.click();
    else if (pause && !pause.classList.contains("hidden")) pause.click();
  }

  if (e.code === "KeyR") {
    e.preventDefault();
    if (restart && !restart.classList.contains("disabled-button")) restart.click();
  }

  if (e.code === "KeyL") {
    e.preventDefault();
    if (!loopBtn || !noLoopBtn || !container) return;
    if (container.hasAttribute("loop")) {
      noLoopBtn.click();
    } else {
      loopBtn.click();
    }
  }
});

function createDefaultAlarm() {
  const alarmEl = document.querySelector("x-alarm");
  if (!alarmEl) return;

  const itemsSection = alarmEl.querySelector(".items");
  if (!itemsSection) return;

  if (itemsSection.children.length === 0) {
    const alarmTemplate = alarmEl.querySelector("template");
    if (!alarmTemplate) return;
    const clone = alarmTemplate.content.cloneNode(true);
    itemsSection.appendChild(clone);
    const lastAlarm = itemsSection.lastElementChild;
    if (lastAlarm) {
      const controls = lastAlarm.querySelector(".controls");
      if (controls) setupControls(controls);
    }
  }
}

createDefaultAlarm();

const alarmElementForObserver = document.querySelector("x-alarm");
if (alarmElementForObserver) {
  const itemsSectionObserver = alarmElementForObserver.querySelector(".items");
  if (itemsSectionObserver) {
    const updateBox = () => {
      if (itemsSectionObserver.children.length === 0) itemsSectionObserver.classList.add("empty");
      else itemsSectionObserver.classList.remove("empty");
    };
    updateBox();
    const mo = new MutationObserver(mutations => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            const controls = node.querySelector(".controls");
            if (controls) setupControls(controls);
          }
        });
      });
      updateBox();
    });
    mo.observe(itemsSectionObserver, { childList: true });
  }
}

export default {};

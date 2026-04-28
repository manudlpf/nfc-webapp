import { DEVICE_DEFS } from "./devices.js";
import { writeUrlAndJson, readJsonOnce } from "./nfc.js";

const $ = (id) => document.getElementById(id);

function setOutput(msg) {
  $("output").textContent = msg;
}

function renderDeviceOptions() {
  const sel = $("deviceType");
  sel.innerHTML = "";

  for (const [key, def] of Object.entries(DEVICE_DEFS)) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = def.label;
    sel.appendChild(opt);
  }
}

function renderParams(deviceType) {
  const container = $("paramsContainer");
  container.innerHTML = "";

  const def = DEVICE_DEFS[deviceType];
  def.params.forEach((p) => {
    const div = document.createElement("div");
    div.className = "row";

    div.innerHTML = `
      <label for="${p.key}">${p.label} :</label>
      <input id="${p.key}" type="${p.type}"
             min="${p.min}" max="${p.max}" step="${p.step}"
             value="${p.default}" required />
    `;
    container.appendChild(div);
  });
}

function collectParams(deviceType) {
  const def = DEVICE_DEFS[deviceType];
  const params = {};

  for (const p of def.params) {
    const raw = $(p.key).value;
    const val = Number(raw);

    if (Number.isNaN(val)) throw new Error(`Valeur invalide: ${p.key}`);
    if (val < p.min || val > p.max) throw new Error(`Hors limites: ${p.key} (${p.min}..${p.max})`);

    // Ici tu peux forcer int si tu veux
    params[p.key] = val;
  }
  return params;
}

async function onWrite() {
  try {
    setOutput("⏳ Approchez le tag NFC…");
    const deviceType = $("deviceType").value;
    const params = collectParams(deviceType);

    await writeUrlAndJson({ deviceType, params });
    setOutput("✅ Paramètres écrits (URL conservée).");
  } catch (e) {
    setOutput("❌ " + e);
  }
}

async function onRead() {
  try {
    setOutput("⏳ Approchez le tag NFC pour lecture…");
    const json = await readJsonOnce();
    if (!json) {
      setOutput("ℹ️ Aucun record JSON trouvé.");
      return;
    }

    // Remplir UI si deviceType connu
    if (json.deviceType && DEVICE_DEFS[json.deviceType]) {
      $("deviceType").value = json.deviceType;
      renderParams(json.deviceType);

      if (json.params) {
        for (const [k, v] of Object.entries(json.params)) {
          const el = document.getElementById(k);
          if (el) el.value = v;
        }
      }
    }

    setOutput("✅ JSON lu :\n" + JSON.stringify(json, null, 2));
  } catch (e) {
    setOutput("❌ " + e);
  }
}

function init() {
  renderDeviceOptions();
  const first = Object.keys(DEVICE_DEFS)[0];
  $("deviceType").value = first;
  renderParams(first);

  $("deviceType").addEventListener("change", (e) => renderParams(e.target.value));
  $("btnWrite").addEventListener("click", onWrite);
  $("btnRead").addEventListener("click", onRead);
}

window.addEventListener("load", init);

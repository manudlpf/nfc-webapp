import { WEBAPP_URL } from "./nfc.js";
import { DEVICE_DEFS } from "./devices.js";
import { writeUrlAndJson } from "./nfc.js";

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
         (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function hasWebNFC() {
  return ("NDEFReader" in window);
}

function setBanner(msg, kind) {
  const b = document.getElementById("platformBanner");
  b.className = "banner " + kind;
  b.textContent = msg;
}

function buildPayload(deviceType, params) {
  return {
    v: 1,
    deviceType,
    seq: (Date.now() & 0xFFFF), // utile pour ton polling MCU
    params
  };
}

function fillIosJson(payloadObj) {
  const ta = document.getElementById("iosJson");
  ta.value = JSON.stringify(payloadObj, null, 2);
}

function installIosGuideHandlers() {
  const help = document.getElementById("iosHelp");

  document.getElementById("btnIosGuide").addEventListener("click", () => {
    help.textContent =
`Étapes iPhone (ex. NFC Tools) :
1) Ouvrir l’app NFC (NFC Tools / Smart NFC).
2) Aller dans Écrire.
3) Ajouter un enregistrement URL : ${WEBAPP_URL}
4) Ajouter un enregistrement MIME (ou Texte) contenant le JSON ci-dessous.
   - MIME recommandé : application/json
5) Écrire sur le tag.
6) Scanner ensuite le tag : iOS utilisera le 1er record URL pour ouvrir la WebApp.`;
  });

  document.getElementById("btnCopyJson").addEventListener("click", async () => {
    await navigator.clipboard.writeText(document.getElementById("iosJson").value);
    help.textContent = "✅ JSON copié dans le presse-papiers.";
  });

  document.getElementById("btnCopyUrl").addEventListener("click", async () => {
    await navigator.clipboard.writeText(WEBAPP_URL);
    help.textContent = "✅ URL copiée dans le presse-papiers.";
  });
}

function collectParamsFromUI(deviceType) {
  const def = DEVICE_DEFS[deviceType];
  const params = {};
  for (const p of def.params) {
    const v = Number(document.getElementById(p.key).value);
    if (Number.isNaN(v)) throw new Error(`Valeur invalide pour ${p.key}`);
    if (v < p.min || v > p.max) throw new Error(`Hors limites pour ${p.key} (${p.min}..${p.max})`);
    params[p.key] = Math.trunc(v);
  }
  return params;
}

function setupPlatformMode() {
  const ios = isIOS();
  const webNfc = hasWebNFC();

  const btnWrite = document.getElementById("btnWrite");
  const btnRead = document.getElementById("btnRead");
  const iosPanel = document.getElementById("iosPanel");

  if (ios || !webNfc) {
    // Mode iOS/lecture seule
    setBanner("ℹ️ iPhone/iOS : Web NFC indisponible dans le navigateur. Utilisez le guide ci-dessous pour écrire via une app NFC.", "warn");

    // Désactive les actions NFC web
    btnWrite.disabled = true;
    btnRead.disabled = true;

    // Affiche le panneau iOS + JSON prêt à copier
    iosPanel.style.display = "block";
    installIosGuideHandlers();

    // Pré-remplir le JSON selon la sélection actuelle
    const deviceType = document.getElementById("deviceType").value;
    const params = collectParamsFromUI(deviceType);
    fillIosJson(buildPayload(deviceType, params));

    // Recalcule le JSON quand on change le deviceType ou les champs
    document.getElementById("deviceType").addEventListener("change", () => {
      const dt = document.getElementById("deviceType").value;
      const p = collectParamsFromUI(dt);
      fillIosJson(buildPayload(dt, p));
    });

    document.getElementById("paramsContainer").addEventListener("input", () => {
      const dt = document.getElementById("deviceType").value;
      const p = collectParamsFromUI(dt);
      fillIosJson(buildPayload(dt, p));
    });

  } else {
    // Android Web NFC OK
    setBanner("✅ Web NFC disponible : vous pouvez lire/écrire le tag depuis le navigateur.", "ok");
    iosPanel.style.display = "none";
  }
}

// Appelle setupPlatformMode() à la fin de ton init()

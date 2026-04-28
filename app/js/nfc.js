export const WEBAPP_URL = "https://blue-bush-010b8df10.3.azurestaticapps.net";

function requireWebNfc() {
  if (!("NDEFReader" in window)) {
    throw new Error("Web NFC non supporté sur ce navigateur/appareil.");
  }
}

export async function writeUrlAndJson({ deviceType, params }) {
  requireWebNfc();

  const payloadObj = { v: 1, deviceType, params };
  const jsonBytes = new TextEncoder().encode(JSON.stringify(payloadObj));

  const ndef = new NDEFReader();

  // write() accepte un tableau de records (URL + MIME JSON). [5](https://developer.mozilla.org/en-US/docs/Web/API/NDEFReader/write)[6](https://developer.mozilla.org/en-US/docs/Web/API/NDEFReader)
  await ndef.write({
    records: [
      { recordType: "url", data: WEBAPP_URL },
      { recordType: "mime", mediaType: "application/json", data: jsonBytes }
    ]
  });
}

export async function readJsonOnce(timeoutMs = 8000) {
  requireWebNfc();

  const ndef = new NDEFReader();
  const controller = new AbortController();

  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    await ndef.scan({ signal: controller.signal });

    return await new Promise((resolve, reject) => {
      ndef.onreading = (event) => {
        try {
          for (const record of event.message.records) {
            if (record.recordType === "mime" && record.mediaType === "application/json") {
              const json = JSON.parse(new TextDecoder().decode(record.data));
              resolve(json);
              return;
            }
          }
          resolve(null);
        } catch (e) {
          reject(e);
        }
      };
      ndef.onreadingerror = () => reject(new Error("Tag détecté mais lecture impossible."));
    });
  } finally {
    clearTimeout(t);
    // Important : on ne garde pas une session scan ouverte en continu
  }
}

export const DEVICE_DEFS = {
  contactless_light_4200: {
    label: "Contactless Light 4200",
    params: [
      { key: "temporisation", label: "Temporisation (ms)", type: "number", min: 10, max: 600000, step: 1000, default: 10000 },
      { key: "sensibilite",   label: "Sensibilité (%)",   type: "number", min: 0,  max: 100,   step: 1,  default: 80 },
      { key: "seuil_lux",     label: "Seuil luminosité (lux)", type: "number", min: 0, max: 65535, step: 1, default: 300 }
    ]
  }
  // Ajoute d'autres types ici…
};

# NFC JSON schema (v1)

## Structure
{
  "v": 1,
  "deviceType": "contactless_light_4200",
  "params": {
    "temporisation": 10..60000 (ms, uint16),
    "sensibilite": 0..100 (% , uint8),
    "seuil_lux": 0..65535 (lux, uint16)
  }
}

## Règles
- Toujours écrire le NDEF avec 2 records :
  1) URL (ouvre la WebApp)
  2) MIME application/json (params)
- v=1 obligatoire

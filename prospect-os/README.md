# Prospect OS

De oorspronkelijke Prospect OS-app (website scan prospect platform) uit deze repository, ongewijzigd bewaard als zelfstandige app. De hoofdmap van de repo bevat nu de Het Taartenhuis-webshop; deze map voorkomt dat Prospect OS verloren gaat bij een merge.

## Draaien

```sh
cd prospect-os
npm install
npm run dev
```

De app gebruikt de Lovable Cloud/Supabase-omgeving via de meegeleverde `.env`. De Supabase-migraties en edge functions staan in `supabase/`.

## Terugzetten als hoofdapp

Wil je Prospect OS weer als hoofdapp gebruiken (bijvoorbeeld binnen Lovable, dat de app in de repo-root verwacht), verplaats dan de inhoud van deze map terug naar de root.

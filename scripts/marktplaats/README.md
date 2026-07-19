# Marktplaats webdesign-categorie — eenmalige positioneringsanalyse

Eenmalige marktscan van `Diensten en vakmensen > Webdesigners en Hosting` om
te zien tegen welke prijs en met welk aanbod concurrenten favorieten
(hartjes) verzamelen. Geen doorlopende tool — één run, één CSV, één
samenvatting.

## ⚠️ Status: deels geverifieerd tegen de live site (2026-07)

Dit script is oorspronkelijk geschreven in een sandbox zonder netwerktoegang
tot `marktplaats.nl`. Bij een eerste handmatige test bleek:

- **Titel en prijs**: komen uit de JSON op de overzichtspagina
  (`vipUrl`/`title`/`priceInfo` met `priceCents`) — dit klopte meteen.
- **Favorieten en views**: zitten **niet** in JSON op de advertentiepagina
  zelf (de enige JSON daar is schema.org-structured-data met alleen
  `offers.price`). Ze staan als platte tekst in een `aria-label`-attribuut
  van het "Report-stats"-blok, bijv.
  `aria-label="1583 keer gezien 11 keer bewaard sinds30 jan '26, 21:40"`.
  `fetch_details.py` parsed dit nu met een specifieke regex
  (`STATS_RE`/`extract_stats_from_html`), los van de generieke JSON-poging.
- **Let op de "sinds"-datum**: dit is de timestamp die in dat aria-label
  staat, wat wellicht *niet* de oorspronkelijke plaatsingsdatum is maar het
  moment waarop de tellers voor het laatst zijn gereset (bijv. na een
  "bump"/verlenging door de verkoper). Behandel `posted_date_raw` dus als
  indicatief, niet als harde plaatsingsdatum, tenzij je dat los verifieert.
- **Verkoper, plaats, categorie, accountleeftijd**: nog niet gevonden/
  bevestigd — hier is verder handmatig uitzoekwerk voor nodig (zie hieronder).

**Voordat je een echte run doet:**
```bash
python discover.py --max-pages 1 --debug-dump-first
python fetch_details.py --limit 1 --debug-dump-first
```
Inspecteer daarna `data/debug/overview_page1.html` en
`data/debug/detail_page1.html`. Zoek naar het scriptblok met de advertentie-
data (vaak `__NEXT_DATA__` of een `window.__STATE__ =`-toewijzing) en
controleer of de sleutelnamen in `discover.py` (`LISTING_JSON_KEYS`) en
`fetch_details.py` (`TITLE_KEYS`, `FAVORITE_KEYS`, `VIEW_KEYS`, enz.) matchen.
Pas ze aan waar nodig — dat is de enige plek waar aannames zitten.

## Installatie

```bash
pip install -r requirements.txt
# alleen nodig als requests/BeautifulSoup vastloopt op botdetectie of JS:
pip install playwright && playwright install chromium
```

## Gebruik

Drie stappen, elk apart herstartbaar (tussentijds opgeslagen op schijf):

```bash
# 1. Verzamel advertentie-URL's van de overzichtspagina's
python discover.py                    # loopt door tot geen nieuwe resultaten
python discover.py --max-pages 12     # expliciete cap (er zijn ~12 pagina's)

# 2. Bezoek elke advertentie en sla ruwe data op (2-3s vertraging per request)
python fetch_details.py                     # volledige set (~370)
python fetch_details.py --sample 80         # steekproef i.p.v. volledige set
python fetch_details.py --limit 5           # snelle test

# 3. Normaliseer, classificeer, en schrijf output (geen netwerk)
python enrich.py
```

Onderbroken? Run 1 en 2 gewoon opnieuw — al gedownloade advertenties
(`data/raw/<slug>.json`) worden overgeslagen.

### Volledige set vs. steekproef

Het script probeert standaard alle ~370 advertenties op te halen. Als
botdetectie (Akamai) een volledige run onhaalbaar maakt, gebruik
`--sample 50` t/m `--sample 100` in stap 2 — dat is voldoende voor de
prijssegment-analyse. **Documenteer in je eigen notities welke van de twee
je hebt gebruikt**, want dat is relevant voor hoe hard de conclusies zijn.

## Output

- `output/marktplaats_webdesign.csv` — één rij per advertentie: titel,
  aanbieder, plaats, type, prijslabel + numerieke prijs + prijssegment,
  favorieten, views, favoriet/view-ratio, accountleeftijd, plaatsingsdatum,
  URL.
- `output/scatter_data.json` — prijs vs. favorieten met type als
  kleurcodering, klaar om in een grafiek te plotten.
- `output/summary.txt` — gemiddelde/mediaan favorieten per prijssegment,
  top 10 op absolute favorieten, top 10 op favoriet/view-ratio, en een
  overzicht van ontbrekende velden (data-dekking).

## Architectuur

```
common.py          gedeelde HTTP-fetch (requests, met Playwright-fallback)
                    en generieke JSON-blob-extractie/zoekfuncties
discover.py         stap 1: overzichtspagina's -> data/ad_urls.jsonl
fetch_details.py     stap 2: elke advertentie -> data/raw/<slug>.json
enrich.py           stap 3: normaliseren + CSV/summary/scatter (geen netwerk)
```

`data/` en `output/` staan in `.gitignore` — dit zijn runtime-artefacten,
geen broncode.

## Interpretatiewaarschuwingen (zie ook `summary.txt`)

- **Accountleeftijd is misleidend** — algemene Marktplaats-accounts
  verkopen vaak ook niet-website-gerelateerd spul. Licht wegen.
- **Favorieten meten interesse, geen conversie.**
- **Ratio (favorieten/views) is een sterker signaal dan het absolute
  aantal.**
- **Vakgenoten bewaren ook** — bij lage aantallen (10-tallen) kan dit
  meetellen, al is het effect klein.

## Juridisch

Scrapen is in strijd met de Marktplaats-gebruiksvoorwaarden. Deze run is
uitdrukkelijk eenmalig, kleinschalig en bedoeld voor intern marktonderzoek
(positionering van Dr. Webber) — geen structureel of commercieel hergebruik
van de data.

## Wat dit NIET is

Geen cron/scheduling, geen dashboard, geen database — alleen platte
bestanden voor een eenmalige analyse. De productie-workflow (geautomatiseerde
site-generatie + handmatige eindreview) is een aparte stap en hoort niet in
dit script.

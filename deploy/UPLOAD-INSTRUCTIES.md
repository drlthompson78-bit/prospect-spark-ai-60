# Uploaden naar rnvlijter.nl/test — stap voor stap

Deze map is de beveiligde hosting-variant van het wolverine-archief:
- Wachtwoordbeveiliging via `.htaccess` + `.htpasswd` (Apache/LiteSpeed, werkt op vrijwel alle NL shared hosting)
- Zoekmachines geblokkeerd (noindex-meta op elke pagina, X-Robots-Tag header, robots.txt)
- Analytics van de originele site (Google Tag Manager) volledig verwijderd

## Inloggegevens (na upload)
- Gebruikersnaam: `archief`
- Wachtwoord: `mKjQX22DvxWd`

## Stappen (kan vanaf iPhone in de browser)

1. Log in op het controlepaneel van je hosting (DirectAdmin, cPanel of Plesk).
2. Open **Bestandsbeheer** (File Manager) en ga naar de webmap van rnvlijter.nl
   (meestal `public_html` of `httpdocs`).
3. Maak daar een map **test** aan.
4. Upload `wolverine-test.zip` in die map en kies **Extract / Uitpakken**.
   Verwijder daarna de zip.
5. Open `.htaccess` in de teksteditor van het paneel en vervang de regel
   `AuthUserFile /VERVANG/DIT/PAD/test/.htpasswd` door het echte absolute pad:
   - DirectAdmin: `/home/JOUWGEBRUIKER/domains/rnvlijter.nl/public_html/test/.htpasswd`
   - cPanel:      `/home/JOUWGEBRUIKER/public_html/test/.htpasswd`
   - Weet je het pad niet? De bestandsbeheerder toont het bovenin, of vraag het mij.
   *Alternatief:* veel panelen hebben een knop "Directory beveiligen met wachtwoord" /
   "Password protect directory" — die mag je ook gebruiken in plaats van stap 5;
   verwijder dan de Auth-regels uit `.htaccess`.
6. Open https://rnvlijter.nl/test/ — je krijgt een inlogvenster; log in met de
   gegevens hierboven. Klaar.

## Controle
- Zonder inloggen moet de pagina een "401 Authorization Required" geven.
- Krijg je een "500 Internal Server Error": het pad in stap 5 klopt nog niet.
- De subpagina's werken direct (bijv. /test/brands.html).

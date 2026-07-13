# Asset-plan — hero-film Het Taartenhuis

## Bestaat al (hergebruiken, geen credits)
| Asset | Bron | Gebruik |
|---|---|---|
| Taart-still (assembled, lichte achtergrond) | Higgsfield job `3cb2719a-4931-4870-a168-2d6a5a394c61` | film-referentie + poster + mobile/reduced-motion fallback |
| 4 losse laag-renders | `cakeLayers` in `src/data/assets.ts` | alleen visuele referentie voor de scheidingsvolgorde |
| Onbewerkte Loua-foto | `public/fotos/ijsjes-taart-loua.jpg` | achtergrondreferentie |

## Te genereren (na goedkeuring)
| Asset | Pad | Model | Notitie |
|---|---|---|---|
| Ruwe scroll-film | `motion/assets/loua-hero-scroll-raw.mp4` | image-to-video (seedance_2_0 of kling3_0_turbo) | één naadloze shot: compleet → orbit → verticale scheiding |
| All-keyframe film | `public/hero/loua-scroll.mp4` | ffmpeg (lokaal) | seekbaar per frame voor scrubben |

## Mapstructuur
```
motion/
  taartenhuis-motion-website.md   (skill)
  brand-kit.md
  asset-plan.md
  image-prompts.md
  video-prompt.md
  website-brief.md
  assets/
    loua-hero-scroll-raw.mp4       (ruwe AI-output)
public/hero/
  loua-scroll.mp4                  (all-keyframe productieversie)
```

## Regels
- Geen extra varianten zonder verzoek.
- Elk resultaat meteen naar het juiste pad halen.
- Geen tekst/logo's in de film.

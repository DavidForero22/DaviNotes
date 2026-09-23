# i18n

Interface translations for the site. The guides themselves live in `src/content/docs/<locale>/`.

```
i18n/
├─ ui.ts          # public API: locales, Lang, defaultLang, Localized, ui, UIKey
├─ utils.ts       # public API: useTranslations, pick, langs, localizePath...
├─ config.ts      # supported locales and the shared types
└─ locales/
   ├─ en/         # reference language: defines the keys
   │  ├─ common.ts   # shared by the whole site (nav, mode switch, a11y, footer, help, 404, difficulty)
   │  ├─ docs.ts     # documentation only (index pages, lessons, search)
   │  ├─ learn.ts    # learning mode only (DaviLearn)
   │  └─ index.ts    # merges the namespaces into one flat dictionary
   ├─ es/         # same files as en/
   └─ fr/         # same files as en/
```

Import from `@/i18n/ui` and `@/i18n/utils` only. Everything else in this folder is internal.

## Adding a string

1. Add the key to the matching namespace in `locales/en/`. Keys keep their prefix (`"nav.home"`);
   the namespace is only the file the key lives in.
2. Add the same key to `locales/es/` and `locales/fr/`. Each file is checked with
   `satisfies Record<keyof typeof en, string>`, so a missing or misspelled key fails type checking
   (`npx tsc --noEmit`). `astro build` does not type-check, so run it before committing.

## Adding a namespace

Create `locales/<lang>/learn.ts` for every locale, following the existing files, and spread it
in each `locales/<lang>/index.ts`. Key prefixes must not repeat across namespaces.

## Adding a language

Add it to `locales` in `config.ts`, create `locales/<lang>/` with the same files as `en/`,
register it in `ui.ts` and add its folder under `src/content/docs/`.

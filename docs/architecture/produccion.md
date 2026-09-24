# Paso a producción · checklist

Estado: **no se aplica todavía.** Mientras el proyecto esté en desarrollo, todo es local (decisión D1 del [roadmap](./roadmap.md)).
Este documento recoge lo que hay que cambiar el día que se elija dominio y hosting, y quién lo hace.
Cada agente añade aquí cualquier ajuste que detecte y que solo tenga sentido en producción.

## 0. Decisiones previas del usuario
- [ ] Dominio de producción (p. ej. `https://…`) → se usará como `site`.
- [ ] Hosting para Node (`@astrojs/node` en modo `standalone`): VPS, Render, Railway, Fly.io… Si se elige una plataforma con adaptador propio (Vercel, Netlify, Cloudflare), Backend cambia el adaptador.
- [ ] Proyecto Supabase remoto (región y plan).
- [ ] ¿Se mantiene el registro sin confirmación de email (D3) en producción?

## 1. Configuración de Astro (Backend + SEO, un solo commit en `astro.config.mjs`)
- [ ] Añadir `site: "https://<dominio>"`.
- [ ] Instalar `@astrojs/sitemap` y excluir `/api/**` y las rutas privadas de `learn` (dashboard, ejercicios, auth).
- [ ] Revisar `trailingSlash` y `build.format` para que los canonical coincidan con las URLs servidas.

## 2. SEO técnico (SEO/A11y)
- [ ] `src/pages/robots.txt.ts` con la URL absoluta del sitemap y `Disallow: /api/`.
- [ ] Canonical absoluto en cada página (desde `BaseHead.astro`, tarea de la Fase D).
- [ ] `hreflang` absolutos: hoy `AlternateLinks.astro` genera rutas relativas (`/es/java/`) y Google exige URLs absolutas.
- [ ] Open Graph y Twitter Cards (`og:url`, `og:title`, `og:description`, `og:image`, `og:locale` + `og:locale:alternate`).
- [ ] Imagen social por defecto (1200×630) en `public/`.
- [ ] Quitar el `noindex` de la portada `/learn` si pasa a ser una landing pública. Las páginas privadas (dashboard, ejercicios) mantienen `noindex`.
- [ ] Dar de alta el dominio en Google Search Console y enviar el sitemap.

## 3. Supabase (Backend)
- [ ] Crear el proyecto remoto y enlazarlo: `npx supabase link --project-ref <ref>`.
- [ ] Aplicar las migraciones: `npx supabase db push`. **No** ejecutar el seed de desarrollo en producción.
- [ ] Cargar las **categorías** de ejercicios: hoy solo están en `supabase/seed.sql` y el seed no se ejecuta en producción. Pasarlas a una migración (o ejecutar ese bloque a mano) **antes** de insertar ejercicios, porque `exercises.category` es una clave foránea.
- [ ] **No** cargar `supabase/exercises/_dev_sample.sql` en la base remota (ejercicios ficticios solo para desarrollo, slugs `dev-sample-*`). Si se cargó por error: `delete from public.exercises where slug like 'dev-sample-%';`.
- [ ] Ejecutar el script de ejercicios del usuario (D4) contra la base remota (formato en `supabase/exercises/README.md`; el comando `docker exec` de ese README solo sirve en local: en remoto, el SQL editor del panel o `psql` con la cadena de conexión del proyecto).
- [ ] Decidir si las recompensas siguen confiando en el botón "Resuelto / No resuelto": hoy `submit_result(p_exercise_id, p_correct)` acepta el `correct` que envía el cliente, y cualquier usuario con sesión puede llamar a la RPC directamente por PostgREST con la anon key. Si hace falta evitar trampas, validar la respuesta en la BD contra `exercise_answers` (ya existe y el cliente no puede leerla) y limitar la frecuencia de `submit_result`.
- [ ] Regenerar los tipos contra el proyecto remoto tras cada migración (`npx supabase gen types typescript --linked > src/types/database.ts`) y comprobar que coinciden con los locales.
- [ ] Ejecutar los tests de la BD (`npx supabase test db`) en CI antes de cada `db push`.
- [ ] Auth → URL Configuration: `Site URL` = dominio y `Redirect URLs` para login/logout (en local lo define `supabase/config.toml` con `http://127.0.0.1`).
- [ ] Si se activa la confirmación de email: SMTP propio (el SMTP integrado de Supabase tiene un límite muy bajo) y plantillas de email en en/es/fr.
- [ ] Revisar las políticas RLS con el Security Advisor de Supabase; comprobar que ninguna columna de monedas, XP o nivel se puede escribir desde el cliente (T11).
- [ ] Copias de seguridad automáticas y, si el plan lo permite, PITR.
- [ ] Revisar el rate limiting de Auth (registro y login). Los endpoints ya traducen el 429 de Auth a `rate_limited`.
- [ ] Auth → Providers → Email: longitud mínima de contraseña **8** (igual que `minimum_password_length` de `config.toml` y `PASSWORD_MIN_LENGTH` de `src/lib/auth-rules.ts`), sin reglas de composición, y confirmación de email según D3.

## 4. Variables de entorno y secretos (Backend)
- [ ] `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` con los valores del proyecto remoto, en el panel del hosting (nunca en el repo).
- [ ] Si algún día hace falta `SUPABASE_SERVICE_ROLE_KEY`: sin prefijo `PUBLIC_`, solo se lee en `src/lib/server/` y nunca llega al cliente (T9).
- [ ] `HOST` y `PORT` del servidor Node standalone (`node ./dist/server/entry.mjs`).

## 5. Servidor y seguridad (Backend)
- [ ] HTTPS obligatorio y redirección de `http` y de `www`/sin `www` al dominio canónico.
- [ ] Cookies: la de sesión (`cookieOptions` en `src/lib/server/supabase.ts`) y la flash `dl_auth_flash` (`src/lib/server/auth.ts`) ya son `HttpOnly` y `SameSite=Lax`; falta **`Secure`** (p. ej. `secure: import.meta.env.PROD`, fuera de local porque `npm run preview` va por http).
- [ ] Cabeceras de seguridad: `Content-Security-Policy` (permitiendo el dominio de Supabase en `connect-src`), `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`.
- [ ] Caché larga para `/_astro/*` (los nombres llevan hash) y corta para el HTML.
- [x] Protección CSRF: `src/middleware.ts` comprueba `Origin` en los `POST` SSR (C1, T15).
- [ ] Detrás de un proxy o CDN, `Astro.url.origin` tiene que ser el origen público (cabeceras `Host` / `X-Forwarded-Host` / `X-Forwarded-Proto`, y `security.allowedDomains` de Astro si se usan las `X-Forwarded-*`). Si no coincide con el `Origin` del navegador, **todos los POST dan 403 `forbidden_origin`**.

## 6. Calidad y despliegue continuo (PM)
- [ ] Pipeline de CI: `npm ci`, `npm run typecheck`, `npm run check:content`, `npm run build`.
- [ ] Hacer el merge de `renovacion` en `master` y desplegar desde `master`.
- [ ] Monitorización de errores del servidor y de la disponibilidad.
- [ ] Pasada final de accesibilidad (Lighthouse/axe) sobre el dominio real.

## 7. Integridad del progreso (decisión D6)
- [ ] Hoy el navegador decide si una respuesta es correcta (`submit_result(p_exercise_id, p_correct)`), por simplicidad durante el desarrollo. Antes de producción: la RPC recibe la **respuesta** (`p_answer`) y la compara con `exercise_answers` dentro de la BD; `POST /api/exercises/[id]/result` pasa a `{ answer }` y `InterfazEjercicio` envía la respuesta en lugar de un booleano. Para `fill_blank`/`code_output`, el script de ejercicios debe incluir las variantes aceptadas en `accepted_answers`.

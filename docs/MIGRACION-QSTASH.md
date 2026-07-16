# Migracion a Upstash QStash

Este documento explica como migrar los procesos asincronos de Scheduleo
(actualmente basados en `after()` de Next.js, ver `lib/asyncTask.ts`) a
una cola real con Upstash QStash.

## Cuando hacerlo

El sistema recomienda esta migracion automaticamente cuando se detectan
5 o mas fallos de tareas asincronas en los ultimos 7 dias (ver
`debeRecomendarQStash()` en `lib/asyncTask.ts`). Tambien conviene
considerarla si:

- Empiezan a generarse reportes que tardan mas de unos segundos.
- El volumen de emails crece mucho (cientos al dia).
- Se necesita visibilidad de que tareas fallaron y por que, con
  reintentos automaticos.

## Por que QStash y no otra cosa

Scheduleo corre en Vercel serverless, sin proceso persistente. QStash
tiene plan gratuito, reintentos automaticos, y se integra bien sin
infraestructura adicional (no hace falta un servidor propio ni Redis).

## Pasos de migracion

1. Crear cuenta en https://upstash.com y crear un proyecto QStash.
2. Instalar el SDK:
3. Anadir las variables de entorno (desde el dashboard de Upstash):4. Crear una ruta interna que reciba los jobs, por ejemplo
   `app/api/jobs/enviar-email/route.ts`, protegida verificando la firma
   de QStash (el SDK trae un helper `verifySignatureAppRouter`).
5. Sustituir las llamadas a `runAsync(...)` de `lib/asyncTask.ts` por
   una llamada a `qstash.publishJSON({ url: ".../api/jobs/...", body })`
   que encole el trabajo en vez de ejecutarlo con `after()`.
6. La ruta interna hace el trabajo real (enviar el email, generar el
   reporte) y QStash reintenta automaticamente si falla.
7. Mantener `lib/asyncTask.ts` como esta durante la transicion — se
   puede migrar archivo por archivo sin romper nada, ya que ambos
   metodos conviven bien.

## Que NO hace falta cambiar

- Los emails que se quedaron deliberadamente sincronos (2FA,
  recuperacion de contrasena, verificacion) siguen sincronos aqui
  tambien — QStash no encaja con flujos donde el usuario espera una
  respuesta inmediata.
# RIT DRT · Reunión de Inicio de Turno

Aplicación web para registrar la **Reunión de Inicio de Turno (RIT)** desde el celular y hacerle seguimiento desde la Gerencia de Seguridad y Salud Ocupacional (GSSO) de la División Radomiro Tomic.

Solicitada por: Dirección de Prevención de Riesgos (DPR), GSSO-DRT.
Versión: 0.1.0 (MVP), noviembre de 2026.

---

## 1. Qué hace

| Módulo | Ruta | Usuario | Descripción |
|---|---|---|---|
| Inicio | `/` | Todos | Accesos a cada módulo. |
| Nueva RIT | `/rit/nueva` | Supervisor / capataz | Formulario pensado para el celular. Se guarda como borrador en el equipo mientras se llena, por si se corta la señal en terreno. |
| Detalle de RIT | `/rit/{id}` | Supervisor / GSSO | Resumen de la RIT enviada. |
| Cartilla PDF | `/rit/{id}/imprimir` | Supervisor / GSSO | Cartilla A3 horizontal con el formato oficial y los datos llenados. Se descarga con «Imprimir → Guardar como PDF». |
| Panel GSSO | `/panel` | GSSO (protegido) | Filtros por fecha, gerencia, EE.CC. y texto. Muestra indicadores, los RF más declarados, las RIT por gerencia y la lista de RIT. |
| Exportar Excel | `/api/export` | GSSO (protegido) | Archivo .xlsx con 4 hojas: RIT, Actividades y análisis, Aportes y Reconocimientos. Respeta los filtros del panel. |
| Guía RF | `/guia` | Todos | Los 21 RF de DRT: evento top, energía y controles críticos CCP y CCM, con buscador. |
| Preguntas | `/preguntas` | Todos | Las 21 preguntas frecuentes con los criterios acordados con Seguridad. |

### Contenido de la cartilla y reglas de negocio

- **Identificación:** fecha, centro de trabajo, gerencia, superintendencia, área o frente, supervisor, N.º de asistentes, EE.CC., N.º y nombre del contrato.
- **RF del turno:** los 21 riesgos de fatalidad aplicables a DRT, en `lib/rf.ts`. Si se elige un RF en el análisis de una actividad, se marca solo como RF del turno.
- **Actividades por turno:** hasta **6 actividades en el Turno A y 6 en el Turno B**. Cada actividad tiene:
  - SÍ/NO en los ítems Instructivos y/o PTS, Materiales, Herramientas y EPP. Los cuatro son obligatorios.
  - Si un ítem queda en **NO**, la actividad se marca como «no preparada», se avisa en pantalla y se cuenta en el panel.
  - Hasta 3 filas de análisis por actividad: RF, riesgo o evento top (se precarga con el evento top del RF), consecuencia y controles críticos verificados. Los controles se eligen de la lista del RF y quedan con códigos como `RF02-CCM1`.
- **Aportes a la gestión de riesgos:** propuesta, responsable (por defecto el supervisor) y fecha. **Reconocimientos:** quién y motivo.
- **Validaciones del servidor (zod), en `lib/validacion.ts`:**
  - campos obligatorios;
  - límite de actividades por turno;
  - un RF analizado debe estar marcado como RF del turno;
  - cada control debe corresponder al RF de su fila.

Los parámetros (6 actividades por turno y 3 análisis por actividad) se cambian en `lib/validacion.ts`.

---

### Instalar como app (PWA)

La app se puede instalar en el celular y en el computador, con ícono propio y sin barra del navegador:

- **Android / Chrome / Edge:** botón **Instalar app** arriba a la derecha, o menú del navegador → *Instalar aplicación*.
- **iPhone (Safari):** Compartir → *Agregar a pantalla de inicio*.

Una vez instalada, el formulario, la guía RF y las preguntas abren aunque no haya señal (el borrador queda guardado en el equipo); el envío de la RIT y el panel necesitan conexión. Archivos: `app/manifest.ts`, `public/sw.js`, `public/icons/`, `components/InstallApp.tsx`.

## 2. Tecnología

- **Next.js 14** (App Router) con **React 18** y **TypeScript**.
- **Tailwind CSS**, con los colores corporativos de la infografía RIT (`tailwind.config.ts`):
  - naranjo `#E4450D` y naranjo oscuro `#C23B0B`;
  - grafito `#333333` y grafito claro `#F3F3F3`.
- Tipografía IBM Plex Sans, incluida en `app/fonts`, sin dependencias externas.
- **PostgreSQL 13 o superior**, con SQL parametrizado y sin ORM (`lib/db.ts`, `lib/rit-repo.ts`). El esquema está en `lib/schema.sql`: es idempotente y se aplica solo al iniciar la app.
  - Producción: driver `pg`, con `DATABASE_URL`.
  - Desarrollo: si `DATABASE_URL` no está definida, usa **PGlite**, un Postgres embebido que guarda los datos en `./data/pglite`. No requiere instalar nada.
- **exceljs** para la exportación a Excel. **zod** para las validaciones.

### Estructura

```
app/
  page.tsx                 Inicio
  rit/nueva/page.tsx       Formulario (componente cliente: components/RitForm.tsx)
  rit/[id]/page.tsx        Detalle
  rit/[id]/imprimir/       Cartilla A3 para PDF
  panel/page.tsx           Panel GSSO
  guia/, preguntas/        Contenido de consulta
  api/rit/                 POST crear RIT · GET listar (protegido)
  api/rit/[id]/            GET una RIT
  api/export/              GET Excel (protegido)
components/                Shell (encabezado, pie y logos), formulario, detalle, guía
lib/
  schema.sql               Tablas: rit, actividad, analisis, aporte, reconocimiento
  db.ts                    Conexión pg / PGlite
  rit-repo.ts              Consultas
  validacion.ts            Reglas de negocio (zod)
  rf.ts, preguntas.ts      Contenido: RF, controles críticos y preguntas frecuentes
middleware.ts              Autenticación básica de /panel y /api/export
public/logos/              Codelco, Seguridad Salud y Bienestar, 5 valores
```

---

## 3. Ejecutar en desarrollo

```bash
npm install
npm run dev            # http://localhost:3000, con base embebida en ./data/pglite
```

Para conectar a un PostgreSQL, copiar `.env.example` como `.env.local` y completar `DATABASE_URL`.

## 4. Despliegue en producción

1. Crear la base y el usuario en PostgreSQL. El esquema se aplica solo al primer arranque, o se puede aplicar antes con `DATABASE_URL=... npm run db:init`.
2. Variables de entorno:

   | Variable | Obligatoria | Descripción |
   |---|---|---|
   | `DATABASE_URL` | Sí | `postgres://usuario:clave@servidor:5432/rit_drt` |
   | `PANEL_USER` / `PANEL_PASS` | Sí | Credenciales del panel GSSO y de la exportación. Si no se definen, el panel queda **abierto**. |
   | `PORT` | No | 3000 por defecto. |

3. Construir y levantar:
   ```bash
   npm ci && npm run build && npm start
   ```
   O con Docker:
   ```bash
   docker build -t rit-drt .
   docker run -p 3000:3000 --env-file .env rit-drt
   ```
4. Publicar con HTTPS detrás del proxy inverso corporativo. Los supervisores la abren desde el celular, conectados a la red o la VPN de Codelco.

## 4 b. Demo en Vercel (para presentar y pedir aprobación)

Use la demo **solo con datos de prueba**. Con `DEMO_MODE=1`, la app muestra un aviso en todas las páginas y, la primera vez que se abre el panel, carga 18 RIT ficticias de los últimos 9 días.

1. **GitHub:** cree un repositorio **privado** (por ejemplo `rit-drt-demo`), elija «uploading an existing file» y arrastre el **contenido** de la carpeta `rit-app`, sin la carpeta misma. Luego presione Commit.
2. **Vercel:** entre a vercel.com con su cuenta de GitHub → Add New → Project → importe el repositorio. Next.js se detecta solo.
3. Antes de presionar Deploy, en **Environment Variables** agregue:
   - `DEMO_MODE` = `1`
   - `PANEL_USER` = usuario del panel
   - `PANEL_PASS` = clave del panel
4. Presione **Deploy**.
5. **Base de datos:** en el proyecto → pestaña **Storage** → Create Database → **Neon** (Postgres, plan gratuito) → Connect. Vercel crea sola la variable `DATABASE_URL`.
6. **Deployments** → los tres puntos del último despliegue → **Redeploy**, para que tome la base.
7. Abra la URL `https://<proyecto>.vercel.app`. El panel pide el usuario y la clave del paso 3.

Si se omite el paso 5, la app funciona igual, pero con una base temporal que se borra cada vez que Vercel reinicia el servidor.

Nota: el plan gratuito Hobby de Vercel es para uso personal y no comercial. Para una demo corporativa corresponde el plan Pro, que tiene 14 días de prueba gratis. Para quitar el modo demo, borre `DEMO_MODE` y vuelva a desplegar.

## 5. Pendientes recomendados para TI

1. **SSO corporativo (Entra ID / Azure AD).** Reemplazar la autenticación básica de `middleware.ts` por NextAuth (Auth.js) con el proveedor Microsoft Entra ID, con dos roles:
   - **Supervisor:** puede crear RIT y ver las propias.
   - **GSSO:** tiene acceso al panel y a la exportación.

   Luego guardar el usuario que envía la RIT, con una columna `creado_por` en `rit`.
2. **Acceso al detalle.** Hoy, cualquier persona con el enlace `/rit/{id}` puede ver la RIT. Con SSO, restringir la vista al autor y a GSSO, o usar identificadores no secuenciales (UUID).
3. **Catálogos.** Cargar desde una tabla, o desde la fuente oficial de contratos, las gerencias de DRT y la lista de EE.CC. con sus N.º de contrato, para que se elijan de una lista y no se escriban a mano.
4. **Uso sin conexión.** El formulario ya guarda un borrador en el equipo. Si hace falta enviar sin señal, se puede agregar un service worker (PWA) con cola de envío.
5. **Integración con ZYGHT o la carpeta GSSO.** La respuesta oficial sobre el formato digital sigue «en proceso de definición con la GCSSO». La exportación a Excel sirve de puente mientras tanto.
6. **Versionar el contenido de RF.** `lib/rf.ts` refleja la Línea Base RF v2 (05-10-2026). Si cambia el estándar, actualizar ese archivo o moverlo a una tabla administrable.

## 6. Contenido y fuentes

- Cartilla y guía: «Reunión de Inicio de Turno (RIT)», GCSSO, Dirección Corporativa de Seguridad.
- Riesgos de fatalidad y controles críticos: Línea Base RF v2 (05-10-2026) y estándares SIGO-ECC-003 vigentes.
- Preguntas frecuentes: «Ronda de preguntas, consultas e inquietudes», con las respuestas de Seguridad.
- Logos: recortados de la infografía RIT. Son de baja resolución, así que conviene reemplazarlos por los archivos oficiales en `public/logos/` con el mismo nombre.

© 2026 Codelco Chile · Uso interno.

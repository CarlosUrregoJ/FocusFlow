# FocusFlow

FocusFlow es una aplicación web de productividad sin backend, construida con Next.js 15, TypeScript, TailwindCSS, shadcn/ui style components, Lucide React y Recharts. Todo se guarda en `localStorage`.

## Entorno

La app usa un archivo local de entorno para personalizar algunos valores sin backend:

- `.env.local` para desarrollo local.
- `.env.example` como referencia.

Variables disponibles:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_DEFAULT_THEME`

## Funcionalidades

- Dashboard con métricas en tiempo real.
- CRUD completo de tareas con prioridad, fecha límite y filtros.
- Temporizador Pomodoro configurable.
- Sonido al completar sesiones y registro automático.
- Estadísticas semanales con gráficos.
- Tema claro/oscuro.
- Sidebar colapsable y navegación superior.
- Diseño responsive para móvil, tablet y desktop.

## Tecnologías

- Next.js 15 App Router
- TypeScript
- TailwindCSS
- shadcn/ui style components
- Lucide React
- Recharts

## Instalación

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` inicia el servidor de desarrollo.
- `npm run build` genera la compilación de producción.
- `npm run start` ejecuta la app compilada.
- `npm run lint` ejecuta ESLint.
- `npm run typecheck` valida TypeScript sin emitir archivos.

## Persistencia

Los datos se guardan localmente en el navegador usando `localStorage`:

- tareas
- sesiones Pomodoro
- configuración del tema
- duración personalizada del Pomodoro
- objetivo diario

## Estructura

- `app/` contiene el layout, estilos globales y la página principal.
- `components/` contiene la interfaz y los componentes reutilizables.
- `hooks/` contiene la lógica de persistencia y temporizador.
- `lib/` contiene tipos y utilidades compartidas.

## Notas

La app no requiere backend, Firebase ni APIs externas. Si quieres reiniciar todos los datos, usa el botón de configuración o el botón del sidebar.

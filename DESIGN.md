# DESIGN.md — Dirección de arte de StarMap BA

> Fuente de verdad visual. Si un componente contradice esto, gana esto.

## La escena (lo que fuerza cada decisión)

Un astrónomo amateur abre la app **de noche, en el campo, con los ojos adaptados a la oscuridad**, el brillo del celular al mínimo, planeando o ya parado bajo el cielo. Esto no es "dark mode porque queda lindo": es una restricción física.

Consecuencias directas:
- **Nada de blanco puro ni de neón** que encandile o rompa la adaptación a la oscuridad.
- **El ámbar y el rojo apagado** son colores que preservan la visión nocturna (los astrónomos usan linternas rojas). Por eso el acento es ámbar, no cian/violeta neón.
- Contraste alto pero **suave**, no agresivo.

## Registro
- **Landing** = registro *brand* (el diseño ES el producto: primera impresión).
- **App (`/mapa`, `/punto`)** = registro *product* (el diseño SIRVE a la tarea).

## Color (estrategia: Restrained — neutros tintados + 1 acento)

Todo en OKLCH. Ningún `#000` ni `#fff`. Neutros tintados hacia un índigo-tinta.

| Token | OKLCH | Rol |
|---|---|---|
| `ink` | `oklch(0.15 0.014 265)` | Fondo base (obsidiana cálida) |
| `surface` | `oklch(0.20 0.016 265)` | Paneles, capas elevadas |
| `surface-2` | `oklch(0.25 0.018 265)` | Elevación mayor / chips |
| `fg` | `oklch(0.95 0.006 250)` | Texto principal (blanco roto) |
| `fg-muted` | `oklch(0.74 0.02 265)` | Texto secundario (gris lavanda) |
| `fg-faint` | `oklch(0.55 0.022 265)` | Texto terciario / metadatos |
| `accent` | `oklch(0.82 0.13 78)` | Ámbar estelar — acciones, activo |
| `accent-soft` | `oklch(0.74 0.13 70)` | Hover del acento |
| `night` | `oklch(0.60 0.17 25)` | Rojo apagado — visión nocturna, destructivo |

- **Hairlines** en vez de cajas: separadores `border-white/5` a `border-white/10`. No encerrar cada sección.
- **Escala Bortle** (data viz, mantiene significado pero en tonos apagados, nunca neón):
  verde sage → lima oliva → ámbar → naranja terroso → rojo ladrillo. Siempre acompañada de etiqueta de texto (el color nunca es la única señal).

## Tipografía
- **Geist Sans** para UI. Títulos con `tracking-tight` y peso semibold real (600).
- **Geist Mono + tabular-nums** SOLO para datos numéricos (score, azimut, distancias, %): que los números no bailen. Integrado con elegancia, no todo monoespaciado.
- Jerarquía por escala + peso (ratio ≥1.25). Body ≥16px, line-height 1.5.

## Geometría
- Radios maduros: `rounded-2xl` / `rounded-xl`. Cápsulas (`rounded-full`) solo en chips chicos y FABs del mapa.
- Padding generoso; el espacio en blanco divide, no los bordes.
- Profundidad por capas: `bg-surface/60 backdrop-blur-md` SOLO en paneles que flotan sobre el mapa (uso legítimo del vidrio: ver el mapa detrás). Nunca glass decorativo en el resto.

## Motion (orgánico, no robótico)
- Curva: ease-out exponencial `cubic-bezier(0.22, 1, 0.36, 1)` (token `--ease-organic`).
- Duración 200–300ms en micro-interacciones; salidas ~70% de la entrada.
- Solo `transform`/`opacity`. Respetar `prefers-reduced-motion`.

## Bans (heredados de impeccable, ya presentes en el código viejo)
- ❌ **Gradient text** (`bg-clip-text`) — estaba en el wordmark "BA". Erradicado: ámbar sólido.
- ❌ **Botones con gradiente neón** — estaba en el CTA. Erradicado: superficie ámbar sólida.
- ❌ **Glass decorativo** — permitido solo sobre el mapa.
- ❌ Bordes laterales de color, sombras duras, emojis como íconos estructurales.

## Test final
Si alguien puede mirar la interfaz y decir "esto lo hizo una IA", falló. El antídoto acá es la coherencia con la escena nocturna: ámbar cálido + tinta + visión nocturna, no el combo cian/violeta-sobre-negro de plantilla.

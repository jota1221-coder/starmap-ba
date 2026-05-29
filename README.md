# StarMap BA

> Los mejores cielos de la Provincia de Buenos Aires para ver las estrellas.

App web para amateurs de astronomía que combina **mapa interactivo**, **score dinámico** por clima y contaminación lumínica, y **guía de observación** que te dice qué planetas y estrellas son visibles esta noche desde cada punto.

## Estado del proyecto

🚧 **En construcción — MVP en camino.** Plan completo en [tasks/plan.md](./tasks/plan.md).

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind
- **Prisma** + **PostgreSQL** ([Neon](https://neon.tech) serverless)
- **Leaflet** + OpenStreetMap para el mapa
- **Open-Meteo** para clima en tiempo real
- **astronomy-engine** para cálculos celestes
- **NASA VIIRS** para contaminación lumínica

## Desarrollo local

### Requisitos
- Node.js 22+
- npm
- Una cuenta gratuita en [Neon](https://console.neon.tech) (toma 5 min)

### Setup

```bash
# 1. Clonar
git clone https://github.com/jota1221-coder/starmap-ba.git
cd starmap-ba

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu DATABASE_URL de Neon

# 4. Generar Prisma Client
npx prisma generate

# 5. Aplicar schema a la DB
npx prisma db push

# 6. Levantar dev server
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Estructura

```
starmap-ba/
├── app/                  # Rutas Next.js (App Router)
├── lib/                  # Utilidades compartidas (prisma client, etc.)
├── prisma/               # Schema y migraciones
├── public/               # Assets estáticos
├── tasks/                # Plan de implementación y checklist
│   ├── plan.md
│   └── todo.md
└── ...
```

## Roadmap

Ver [tasks/todo.md](./tasks/todo.md) para el detalle. Hitos principales:

- **🚩 MVP en producción** — mapa + score + guía de observación funcional
- **🚩 Versión completa** — capa de contaminación lumínica + showcase de Data Science
- **🚩 Producto con retención** — cuentas de usuario, alertas por email, calendario de eventos

## Autor

[Joaquin Rao](https://github.com/jota1221-coder) — Data Analyst en construcción.

## Licencia

MIT (por definir formalmente).

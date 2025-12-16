# Prisma Module for Nuxt

Módulo de Nuxt para integrar Prisma en tu aplicación.

## Dependencias Requeridas

Este módulo requiere las siguientes dependencias:

```bash
# Dependencias principales
npm install @prisma/client@^7.1.0
npm install prisma@^7.1.0 --save-dev

# Dependencias del módulo
npm install @nuxt/kit@^4.1.3
npm install consola@^3.4.2
npm install dotenv@^17.2.3
```

## Configuración

### 1. Configurar Nuxt

Agrega el módulo en tu `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['prisma-module'],
  myModule: {
    routePrismaDir: 'lib/prisma.ts', // Ruta donde se encuentra tu instancia de Prisma
  },
})
```

### 2. Configurar Prisma 7

Crea el archivo `prisma.config.ts` en la raíz de tu proyecto:

```typescript
import { defineConfig } from '@prisma/client/config'

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL!,
    },
  },
})
```

### 3. Schema de Prisma

Tu archivo `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite" // o postgresql, mysql, etc.
}

// Tus modelos aquí
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
}
```

### 4. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="file:./dev.db"
```

## Uso

El módulo automáticamente importa tu instancia de Prisma en el servidor. Puedes usarla en tus endpoints:

```typescript
// server/api/users.get.ts
export default defineEventHandler(async () => {
  const users = await prisma.user.findMany()
  return users
})
```

## Comandos de Prisma

```bash
# Generar el cliente de Prisma
npx prisma generate

# Crear una migración
npx prisma migrate dev --name init

# Abrir Prisma Studio
npx prisma studio
```

## Licencia

MIT

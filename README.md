# CRM Juventud

Sistema de gestión para ministerios juveniles. Construido con Next.js 15 (App Router), Prisma, Tailwind CSS, shadcn/ui y NextAuth v5.

## Requisitos previos

- Node.js (v18 o superior)
- PostgreSQL (puedes usar Docker, Neon.tech o Supabase)

## Instalación

1. Clona el repositorio e instala las dependencias:
   ```bash
   npm install
   ```

2. Configura las variables de entorno. Renombra o edita el archivo `.env`:
   ```bash
   DATABASE_URL="postgresql://usuario:password@localhost:5432/juventud?schema=public"
   NEXTAUTH_SECRET="tu-secreto-seguro"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. Sincroniza el esquema de la base de datos (asegúrate de que tu PostgreSQL esté corriendo):
   ```bash
   npx prisma db push
   ```

4. Genera los datos de prueba (Seed):
   Instala `tsx` globalmente si no lo tienes (`npm install -g tsx`) y corre el seed:
   ```bash
   npx tsx prisma/seed.ts
   ```
   *Credenciales de prueba generadas por el seed:*
   - **Admin:** admin@juventud.com / admin123
   - **Líder 1:** juan@juventud.com / lider123
   - **Líder 2:** maria@juventud.com / lider123

## Ejecutar en local

Inicia el servidor de desarrollo:
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) con tu navegador para ver el resultado.

## Arquitectura y Decisiones

- **Next.js App Router:** Manejando tanto el frontend como el backend (Server Actions para mutaciones).
- **Prisma + PostgreSQL:** Modelo relacional fuerte. Se usa `@prisma/adapter-pg` para compatibilidad futura y soporte en el edge si fuera necesario.
- **shadcn/ui + Tailwind:** Componentes altamente personalizables, accesibles y con diseño limpio y profesional.
- **NextAuth.js (v5 beta):** Para manejo de sesiones seguras por credenciales, middlewares de protección de rutas y tipado de roles (Admin, Leader, Viewer).

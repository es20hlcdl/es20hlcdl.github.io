# Academy LMS

Aplicacion Next.js independiente para una base LMS minima. Vive dentro de
`/academy` y no modifica la web estatica publicada desde la raiz del
repositorio.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL
- `@supabase/ssr` para sesiones con cookies

## Variables de entorno

Copia `.env.example` a `.env.local` y completa:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

No uses `SUPABASE_SERVICE_ROLE_KEY` en esta aplicacion frontend.

## Desarrollo local

Desde la carpeta `academy`:

```bash
npm run dev
```

Abre `http://localhost:3000`.

## Supabase

Ejecuta el SQL inicial de `supabase.sql` en el SQL Editor de Supabase. Crea:

- `profiles` con roles `admin` y `student`
- `courses`
- `enrollments`
- trigger para crear perfil al registrarse
- politicas RLS basicas

## Rutas

- `/` landing interna de Academy
- `/login`
- `/register`
- `/auth/callback`
- `/dashboard`
- `/dashboard/courses`

`/dashboard` y sus subrutas estan protegidas por middleware. Si no hay sesion,
el usuario se redirige a `/login`.

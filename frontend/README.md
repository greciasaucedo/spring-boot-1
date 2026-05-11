# Panel de Partido en Vivo — Spring Boot + React

Cliente React para el laboratorio de Realtime con Spring Boot backend.

## Requisitos

- Node.js 18+
- Servidor Spring Boot corriendo en http://localhost:8080

## Instalación

```bash
npm install
```

## Configurar variables de entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` con la URL del servidor:

```
VITE_API_URL=http://localhost:8080
```

## Ejecutar en desarrollo

```bash
npm run dev
```

Abre http://localhost:5173.

## Cómo funciona

- **HTTP REST** para carga inicial y envío de cambios
- **WebSocket STOMP** para recibir actualizaciones en tiempo real
- Todos los componentes escuchan los mensajes de WebSocket y actualizan el estado

## Demostración

1. Abre la app en dos navegadores conectados al mismo servidor.
2. Pulsa "+1 Local" en uno → ambos ven el cambio inmediatamente.
3. Agrega un evento → aparece en ambos navegadores.

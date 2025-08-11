# Product Microservice

## Dev

1. Clonar repositorio
2. Instalar Dependencias
3. Crear un archivo `.env` basado en el `env.template`
4. ejecutar migración de prisma `pnpx prisma migrate dev`
5. Levantar el servidor de NATS

```
docker run -d --name nats-main -p 4222:4222 -p 6222:6222 -p 8222:8222 nats
```

6. Ejecutar `pnpm run start:dev`

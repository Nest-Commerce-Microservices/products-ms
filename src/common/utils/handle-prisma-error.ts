import { RpcException } from '@nestjs/microservices';
import { Prisma } from '../../../generated/prisma/client';
import { PRISMA_ERROR_MAP } from './prisma-error.map';
import { Logger, HttpStatus } from '@nestjs/common';

const logger = new Logger('PrismaErrorHandler');

/**
 * Maneja errores de Prisma y los transforma en `RpcException` con información útil.
 *
 * Este handler busca códigos de error conocidos de Prisma (como P2002, P2003, etc.)
 * y los mapea a un mensaje más comprensible con un `HttpStatus` adecuado.
 *
 * También permite interpolar variables dinámicas en el mensaje, como IDs o nombres de entidad.
 *
 * @param error - El error lanzado por Prisma (o cualquier otro)
 * @param context - Contexto desde donde se llamó (ej: 'ProductsService::update')
 * @param variables - Variables a interpolar dentro del mensaje de error (ej: `{ id, entity: 'Producto' }`)
 *
 * @throws RpcException - Siempre lanza un `RpcException` listo para ser capturado por un filtro global
 *
 * @example
 * handlePrismaError(error, 'ProductsService::create', { entity: 'Producto', id });
 */
export function handlePrismaError(
  error: unknown,
  context: string = '',
  variables: Record<string, any> = {},
): never {
  const finalContext = context || 'UnknownContext';

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = PRISMA_ERROR_MAP.get(error.code);
    if (mapped) {
      const interpolatedMessage = interpolate(mapped.message, variables);
      throw new RpcException({
        status: mapped.status,
        message: interpolatedMessage,
      });
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    logger.error(`[${finalContext}] PrismaValidationError: ${error.message}`);
    throw new RpcException({
      status: HttpStatus.BAD_REQUEST,
      message: `Datos inválidos en ${finalContext}`,
    });
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    logger.error(
      `[${finalContext}] Error inesperado: ${
        error instanceof Error ? error.message : JSON.stringify(error)
      } (Prisma code: ${error.code})`,
    );
  } else {
    logger.error(
      `[${finalContext}] Error inesperado: ${
        error instanceof Error ? error.message : JSON.stringify(error)
      }`,
    );
  }

  throw new RpcException({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: `Error inesperado en ${finalContext}`,
  });
}

/**
 * Reemplaza variables dentro de un string de plantilla usando la forma {{variable}}.
 *
 * @param template - El string con variables a reemplazar (ej: "Producto con ID {{id}} no encontrado")
 * @param vars - Objeto con claves y valores a insertar en el mensaje
 *
 * @returns El mensaje con las variables interpoladas
 */
function interpolate(template: string, vars: Record<string, unknown>): string {
  return template.replace(
    /\{\{(.*?)\}\}/g,
    (_: string, key: string): string => {
      const trimmed: string = key.trim();
      const value = vars[trimmed];

      return typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : `{{${trimmed}}}`;
    },
  );
}

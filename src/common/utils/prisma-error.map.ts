import { HttpStatus } from '@nestjs/common';

// prettier-ignore
export const PRISMA_ERROR_MAP = new Map<
  string,
  { status: number; message: string }
>([
  ['P2002', { status: HttpStatus.CONFLICT,     message: 'Valor duplicado' }],
  ['P2003', { status: HttpStatus.BAD_REQUEST,  message: 'Clave foránea inválida' }],
  ['P2000', { status: HttpStatus.BAD_REQUEST,  message: 'Valor demasiado largo para un campo' }],
  ['P2025', { status: HttpStatus.NOT_FOUND, message: '{{entity}} con ID {{id}} no encontrado' }],
]);

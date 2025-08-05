import { IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

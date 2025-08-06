import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ENTITY_NAMES,
  handlePrismaError,
  PaginationDto,
  PrismaService,
} from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export default class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    try {
      return await this.prisma.product.create({
        data: createProductDto,
      });
    } catch (error) {
      if (error instanceof RpcException) throw error;
      handlePrismaError(error, `${this.constructor.name}::create`);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;

    try {
      const totalItems = await this.prisma.product.count({
        where: { available: true },
      });

      const lastPage = Math.ceil(totalItems / limit);

      const data = await this.prisma.product.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where: { available: true },
      });

      return {
        data,
        meta: {
          totalItems,
          currentPage: page,
          perPage: limit,
          totalPages: lastPage,
          nextPage: page < lastPage ? page + 1 : null,
          previousPage: page > 1 ? page - 1 : null,
        },
      };
    } catch (error) {
      if (error instanceof RpcException) throw error;
      handlePrismaError(error, `${this.constructor.name}::findAll`);
    }
  }

  async findOne(id: number) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id, available: true },
      });

      if (!product) {
        throw new RpcException({
          message: `Product with ID ${id} not found`,
          status: HttpStatus.BAD_REQUEST,
        });
      }

      return product;
    } catch (error) {
      if (error instanceof RpcException) throw error;
      handlePrismaError(error, `${this.constructor.name}::findOne`, {
        id,
        entity: ENTITY_NAMES.PRODUCT,
      });
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: _, ...data } = updateProductDto;

    try {
      return await this.prisma.product.update({
        where: { id, available: true },
        data,
      });
    } catch (error) {
      if (error instanceof RpcException) throw error;
      handlePrismaError(error, `${this.constructor.name}::update`, {
        id,
        entity: ENTITY_NAMES.PRODUCT,
      });
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: {
        available: false,
      },
    });
  }
}

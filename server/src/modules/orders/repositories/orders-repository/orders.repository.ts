import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma-service';
import { OrderQueryDto } from '../../dto/order-query-dto';

export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: {
          select: {
            id: true;
            sku: true;
            name: true;
            unit: true;
          };
        };
      };
    };
    supplier: {
      select: {
        id: true;
        name: true;
        email: true;
        phone: true;
      };
    };
    customer: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        companyName: true;
      };
    };
    warehouse: {
      select: {
        id: true;
        code: true;
        name: true;
      };
    };
    createdBy: {
      select: {
        id: true;
        email: true;
        firstName: true;
        lastName: true;
      };
    };
  };
}>;

/**
 * Repository d'accès aux données des commandes (achats et ventes).
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhereClause(query?: OrderQueryDto): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {};

    if (query?.type) {
      where.type = query.type;
    }

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.paymentStatus) {
      where.paymentStatus = query.paymentStatus;
    }

    if (query?.warehouseId) {
      where.warehouseId = query.warehouseId;
    }

    if (query?.supplierId) {
      where.supplierId = query.supplierId;
    }

    if (query?.customerId) {
      where.customerId = query.customerId;
    }

    if (query?.startDate || query?.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    if (query?.search) {
      const search = query.search.trim();
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  /**
   * Récupère une liste paginée de commandes avec leurs relations.
   */
  async findMany(query?: OrderQueryDto): Promise<OrderWithRelations[]> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const where = this.buildWhereClause(query);

    return await this.prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
                unit: true,
              },
            },
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Compte le nombre total de commandes selon les critères.
   */
  async count(query?: OrderQueryDto): Promise<number> {
    const where = this.buildWhereClause(query);
    return await this.prisma.order.count({ where });
  }

  /**
   * Recherche une commande par son identifiant unique UUID.
   */
  async findById(id: string): Promise<OrderWithRelations | null> {
    return await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
                unit: true,
              },
            },
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Recherche une commande par son numéro de commande unique.
   */
  async findByOrderNumber(
    orderNumber: string,
  ): Promise<OrderWithRelations | null> {
    return await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
                unit: true,
              },
            },
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Exécute des requêtes au sein d'une transaction Prisma.
   */
  async transaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return await this.prisma.$transaction(fn);
  }
}

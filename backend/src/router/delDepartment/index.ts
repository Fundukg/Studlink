import { z } from 'zod';
import { trpc } from '../../lib/trpc';
import { zDeleteDepartmentTrpcInput } from './input';

export const deleteDepartmentTrpcRoute = trpc.procedure
  .input(zDeleteDepartmentTrpcInput)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.me) {throw Error('Unauthorized');}

    // Благодаря onDelete: Cascade в Prisma, удаление кафедры 
    // автоматически удалит все связанные группы и сообщения.
    await ctx.prisma.department.delete({
      where: { id: input.id },
    });

    return { success: true };
  });

  export const getDepartmentDeleteStats = trpc.procedure
  .input(zDeleteDepartmentTrpcInput)
  .query(async ({ input, ctx }) => {
    const stats = await ctx.prisma.department.findUnique({
      where: { id: input.id },
      select: {
        _count: {
          select: {
            groups: true,
            messages: true,
          }
        }
      }
    });
    return stats;
  });
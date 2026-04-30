import { z } from 'zod';    
import { trpc } from '../../lib/trpc';
import { zUpdateDepartmentTrpcInput } from './input';

export const updateDepartmentTrpcRoute = trpc.procedure
  .input(zUpdateDepartmentTrpcInput)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.me) {throw Error('Unauthorized');}

    // Проверяем, существует ли кафедра
    const department = await ctx.prisma.department.findUnique({
      where: { id: input.id }
    });

    if (!department) {throw Error('Кафедра не найдена');}

    // Проверяем уникальность имени, если оно меняется
    if (input.name !== department.name) {
      const nameConflict = await ctx.prisma.department.findUnique({
        where: { name: input.name }
      });
      if (nameConflict) {throw Error('Кафедра с таким названием уже существует');}
    }

    return await ctx.prisma.department.update({
      where: { id: input.id },
      data: {
        name: input.name,
        facultyId: input.facultyId,
      },
    });
  });
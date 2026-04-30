import { z } from 'zod';

export const zUpdateDepartmentTrpcInput = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Название не может быть пустым"),
  facultyId: z.string().uuid(),
})
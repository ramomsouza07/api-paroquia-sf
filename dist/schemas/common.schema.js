import { z } from 'zod';
// Formato padrão de erro retornado pela API
export const erroResponseSchema = z.object({
    erro: z.string(),
});
//# sourceMappingURL=common.schema.js.map
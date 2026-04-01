import { z } from 'zod'

export const createCallSchema = z.object({
  receiverId: z.string().uuid(),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  status: z.enum(['MISSED', 'ANSWERED', 'REJECTED', 'ONGOING', 'ACCEPTED'])
})

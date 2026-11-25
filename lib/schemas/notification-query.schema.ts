import { listQuerySchema } from "@/lib/schemas/list-query.schema"

// Search params of /notifications.
export const notificationQuerySchema = listQuerySchema.pick({ page: true })

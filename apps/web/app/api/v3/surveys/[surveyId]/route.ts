import { z } from "zod";
import { withV3ApiWrapper } from "@/app/api/v3/lib/api-wrapper";
import { deleteV3Survey } from "../lib/operations";

export const DELETE = withV3ApiWrapper({
  auth: "both",
  action: "deleted",
  targetType: "survey",
  schemas: {
    params: z.object({
      surveyId: z.cuid2(),
    }),
  },
  handler: async ({ parsedInput, authentication, requestId, instance, auditLog }) => {
    return await deleteV3Survey({
      surveyId: parsedInput.params.surveyId,
      authentication,
      requestId,
      instance,
      auditLog,
    });
  },
});

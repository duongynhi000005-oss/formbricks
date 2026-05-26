import { withV3ApiWrapper } from "@/app/api/v3/lib/api-wrapper";
import { listV3Surveys } from "./lib/operations";

export const GET = withV3ApiWrapper({
  auth: "both",
  handler: async ({ req, authentication, requestId, instance }) => {
    return await listV3Surveys({
      searchParams: new URL(req.url).searchParams,
      authentication,
      requestId,
      instance,
    });
  },
});

import "server-only";
import { logger } from "@formbricks/logger";
import { DatabaseError, ResourceNotFoundError } from "@formbricks/types/errors";
import { requireV3WorkspaceAccess } from "@/app/api/v3/lib/auth";
import {
  problemBadRequest,
  problemForbidden,
  problemInternalError,
  successListResponse,
  successResponse,
} from "@/app/api/v3/lib/response";
import type { TV3AuditLog, TV3Authentication } from "@/app/api/v3/lib/types";
import { getSurvey } from "@/lib/survey/service";
import { deleteSurvey } from "@/modules/survey/lib/surveys";
import { getSurveyCount } from "@/modules/survey/list/lib/survey";
import { getSurveyListPage } from "@/modules/survey/list/lib/survey-page";
import { parseV3SurveysListQuery } from "../parse-v3-surveys-list-query";
import { serializeV3SurveyListItem } from "../serializers";

type TListV3SurveysParams = {
  searchParams: URLSearchParams;
  authentication: TV3Authentication;
  requestId: string;
  instance: string;
};

type TDeleteV3SurveyParams = {
  surveyId: string;
  authentication: TV3Authentication;
  requestId: string;
  instance: string;
  auditLog?: TV3AuditLog;
};

export async function listV3Surveys({
  searchParams,
  authentication,
  requestId,
  instance,
}: TListV3SurveysParams): Promise<Response> {
  const log = logger.withContext({ requestId });

  try {
    const parsed = parseV3SurveysListQuery(searchParams);
    if (!parsed.ok) {
      log.warn({ statusCode: 400, invalidParams: parsed.invalid_params }, "Validation failed");
      return problemBadRequest(requestId, "Invalid query parameters", {
        invalid_params: parsed.invalid_params,
        instance,
      });
    }

    const authResult = await requireV3WorkspaceAccess(
      authentication,
      parsed.workspaceId,
      "read",
      requestId,
      instance
    );
    if (authResult instanceof Response) {
      return authResult;
    }

    const { workspaceId } = authResult;

    const surveyPagePromise = getSurveyListPage(workspaceId, {
      limit: parsed.limit,
      cursor: parsed.cursor,
      sortBy: parsed.sortBy,
      filterCriteria: parsed.filterCriteria,
    });
    const totalCountPromise = parsed.includeTotalCount
      ? getSurveyCount(workspaceId, parsed.filterCriteria)
      : Promise.resolve(null);
    const [surveyPage, totalCount] = await Promise.all([surveyPagePromise, totalCountPromise]);

    return successListResponse(
      surveyPage.surveys.map(serializeV3SurveyListItem),
      {
        limit: parsed.limit,
        nextCursor: surveyPage.nextCursor,
        totalCount,
      },
      { requestId, cache: "private, no-store" }
    );
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      log.warn({ statusCode: 403, errorCode: err.name }, "Resource not found");
      return problemForbidden(requestId, "You are not authorized to access this resource", instance);
    }
    if (err instanceof DatabaseError) {
      log.error({ error: err, statusCode: 500 }, "Database error");
      return problemInternalError(requestId, "An unexpected error occurred.", instance);
    }
    log.error({ error: err, statusCode: 500 }, "V3 surveys list unexpected error");
    return problemInternalError(requestId, "An unexpected error occurred.", instance);
  }
}

export async function deleteV3Survey({
  surveyId,
  authentication,
  requestId,
  instance,
  auditLog,
}: TDeleteV3SurveyParams): Promise<Response> {
  const log = logger.withContext({ requestId, surveyId });

  try {
    const survey = await getSurvey(surveyId);

    if (!survey) {
      log.warn({ statusCode: 403 }, "Survey not found or not accessible");
      return problemForbidden(requestId, "You are not authorized to access this resource", instance);
    }

    const authResult = await requireV3WorkspaceAccess(
      authentication,
      survey.workspaceId,
      "readWrite",
      requestId,
      instance
    );

    if (authResult instanceof Response) {
      return authResult;
    }

    if (auditLog) {
      auditLog.targetId = survey.id;
      auditLog.organizationId = authResult.organizationId;
      auditLog.oldObject = survey;
    }

    const deletedSurvey = await deleteSurvey(surveyId);

    return successResponse(
      {
        id: deletedSurvey.id,
      },
      { requestId }
    );
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      log.warn({ errorCode: error.name, statusCode: 403 }, "Survey not found or not accessible");
      return problemForbidden(requestId, "You are not authorized to access this resource", instance);
    }

    if (error instanceof DatabaseError) {
      log.error({ error, statusCode: 500 }, "Database error");
      return problemInternalError(requestId, "An unexpected error occurred.", instance);
    }

    log.error({ error, statusCode: 500 }, "V3 survey delete unexpected error");
    return problemInternalError(requestId, "An unexpected error occurred.", instance);
  }
}

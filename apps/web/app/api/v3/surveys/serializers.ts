import type { TSurvey } from "@/modules/survey/list/types/surveys";

export type TV3SurveyListItem = Pick<
  TSurvey,
  | "id"
  | "name"
  | "workspaceId"
  | "type"
  | "status"
  | "publishOn"
  | "createdAt"
  | "updatedAt"
  | "responseCount"
  | "creator"
>;

/**
 * Keep the v3 API contract isolated from internal persistence naming.
 * Surveys are scoped by workspaceId.
 */
export function serializeV3SurveyListItem(survey: TSurvey): TV3SurveyListItem {
  return {
    id: survey.id,
    name: survey.name,
    workspaceId: survey.workspaceId,
    type: survey.type,
    status: survey.status,
    publishOn: survey.publishOn,
    createdAt: survey.createdAt,
    updatedAt: survey.updatedAt,
    responseCount: survey.responseCount,
    creator: survey.creator,
  };
}

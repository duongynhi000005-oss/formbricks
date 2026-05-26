import type { TSurvey } from "@/modules/survey/list/types/surveys";

export type TV3SurveyCreator = Pick<NonNullable<TSurvey["creator"]>, "name">;

type TV3SurveyListItemBase = Pick<
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
>;

export type TV3SurveyListItem = TV3SurveyListItemBase & {
  creator: TV3SurveyCreator | null;
};

export function serializeV3SurveyCreator(creator: TSurvey["creator"]): TV3SurveyCreator | null {
  if (!creator) {
    return null;
  }

  return {
    name: creator.name,
  };
}

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
    creator: serializeV3SurveyCreator(survey.creator),
  };
}

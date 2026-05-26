import { describe, expect, test } from "vitest";
import type { TSurvey } from "@/modules/survey/list/types/surveys";
import { serializeV3SurveyListItem } from "./serializers";

const baseSurvey = {
  id: "survey_1",
  name: "Customer onboarding",
  workspaceId: "workspace_1",
  type: "link",
  status: "draft",
  publishOn: null,
  createdAt: new Date("2026-04-15T10:00:00.000Z"),
  updatedAt: new Date("2026-04-16T10:00:00.000Z"),
  responseCount: 0,
  singleUse: null,
} satisfies Omit<TSurvey, "creator">;

describe("serializeV3SurveyListItem", () => {
  test("allowlists nested creator fields", () => {
    const survey = {
      ...baseSurvey,
      creator: {
        name: "Ada",
        email: "ada@example.com",
        id: "user_1",
      },
    } as unknown as TSurvey;

    expect(serializeV3SurveyListItem(survey).creator).toEqual({ name: "Ada" });
  });

  test("preserves null creator", () => {
    const survey = {
      ...baseSurvey,
      creator: null,
    } satisfies TSurvey;

    expect(serializeV3SurveyListItem(survey).creator).toBeNull();
  });
});

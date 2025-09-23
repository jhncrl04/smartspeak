import { Learner } from "./user";

export type Section = {
  id: string;
  name: string;
  grade_id: string;
};

export type GradeLevel = {
  id: string;
  name: string;
};

export type GradeAndSection = {
  sectionId: string | undefined;
  sectionName: string | undefined;
  gradeId: string | undefined;
  gradeName: string | undefined;
  learners: Learner[];
};

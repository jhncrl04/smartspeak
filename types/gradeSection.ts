import { Learner } from "./user";

export type Section = {
  id: string;
  name: string;
  grade_id: string;
  students: [];
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

export type SectionsStore = {
  sections: Section[];
  isLoading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;

  startListener: (userId: string) => void;
  stopListener: () => void;
};

export type GradeLevelsStore = {
  gradeLevels: GradeLevel[];
  isLoading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;

  startListener: () => void;
  stopListener: () => void;
};

export type LogAction =
  | "Create Card"
  | "Update Card"
  | "Delete Card"
  | "Assign Card"
  | "Create Category"
  | "Update Category"
  | "Delete Category";

type BaseLog = {
  action: LogAction;
  image: string | null;
  item_category: string | null;
  item_id: string | null;
  item_name: string | null;
  item_type: string | null;
  created_for?: string;
};

export type CreateLog = BaseLog & {
  action: "Create Card" | "Create Category";
  timestamp: Date;
  user_id: string;
  user_name: string;
  user_type: string;
};

type DeleteCards = {
  id: string;
  category_name: string;
  card_name: string;
};

type deleteCategory = {
  id: string;
  category_name: string;
  image: string;
};

export type DeleteLog = BaseLog & {
  action: "Delete Card" | "Delete Category";
  category_id: string;
  category_name: string;
  deleted_at: Date;
  deleted_by_user_id: string;
  deleted_by_user_name: string;
  deleted_by_user_type: string;
  deleted_cards?: [DeleteCards];
  deleted_categories?: [deleteCategory];
};

export type LogBody = CreateLog | DeleteLog;

export type CreateLogInput = Omit<
  CreateLog,
  "user_id" | "user_name" | "user_type"
>;

export type DeleteLogInput = Omit<
  DeleteLog,
  "deleted_by_user_id" | "deleted_by_user_name" | "deleted_by_user_type"
>;

export type CardDetail = {
  card_id?: string;
  card_name: string | undefined;
  category_name: string | undefined;
  image: string | undefined;
};

export type CategoryDetail = {
  category_name: string | undefined;
  image: string | undefined;
  background_color: string | undefined;
};

export type UpdateLog = {
  action: LogAction;
  before: CardDetail | CategoryDetail;
  after: CardDetail | CategoryDetail;
  timestamp: Date;
  user_id: string;
  user_name: string;
  user_type: string;
};

export type UpdateLogInput = Omit<
  UpdateLog,
  "user_id" | "user_name" | "user_type" | "before" | "after"
>;

export type AssignLog = {
  action: LogAction;
  assigned_to: { id: string | undefined; name: string };
  card: CardDetail;
  timestamp: Date;
  assigned_by_user_id: string;
  assigned_by_user_name: string;
  assigned_by_user_type: string;
};

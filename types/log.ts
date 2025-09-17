export type LogAction =
  | "Create Card"
  | "Update Card"
  | "Delete Card"
  | "Create Category"
  | "Update Category"
  | "Delete Category";

type BaseLog = {
  action: LogAction;
  image: string;
  item_category: string;
  item_id: string;
  item_name: string;
  item_type: string;
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

export type DeleteLog = BaseLog & {
  action: "Delete Card" | "Delete Category";
  category_id: string;
  category_name: string;
  deleted_at: Date;
  deleted_by_user_id: string;
  deleted_by_user_name: string;
  deleted_by_user_type: string;
  deleted_cards: [DeleteCards];
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

import getCurrentUid from "@/helper/getCurrentUid";
import firestore from "@react-native-firebase/firestore";
import { getUserInfo } from "./userApi/Authentication";

import {
  AssignLog,
  CreateLog,
  CreateLogInput,
  DeleteLog,
  DeleteLogInput,
  UpdateLog,
  UpdateLogInput,
} from "@/types/log";

const logCollection = firestore().collection("guardianTeacherLogs");

const removeEmpty = <T extends object>(obj: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== undefined && value !== null
    )
  ) as Partial<T>;
};

export const createLog = async (
  logBody: CreateLogInput | DeleteLogInput | UpdateLogInput | AssignLog
) => {
  const uid = getCurrentUid();
  const user = await getUserInfo(uid as string);

  if (
    logBody.action === "Create Card" ||
    logBody.action === "Create Category"
  ) {
    const finalLog: CreateLog = {
      ...(logBody as CreateLog),
      user_id: uid as string,
      timestamp: firestore.Timestamp.fromDate(new Date()) as any,
      user_name: `${user?.first_name} ${user?.last_name}`,
      user_type: user?.role,
    };

    await logCollection.add(removeEmpty(finalLog));
  }

  if (
    logBody.action === "Delete Card" ||
    logBody.action === "Delete Category"
  ) {
    const finalLog: DeleteLog = {
      ...(logBody as DeleteLog),
      deleted_by_user_id: uid as string,
      deleted_at: firestore.Timestamp.fromDate(new Date()) as any,
      deleted_by_user_name: `${user?.first_name} ${user?.last_name}`,
      deleted_by_user_type: user?.role,
    };

    const cleaned = removeEmpty(finalLog);

    try {
      await logCollection.add(cleaned);
    } catch (error) {
      console.error(error);
    }
  }

  // UPDATE
  if (
    logBody.action === "Update Card" ||
    logBody.action === "Update Category"
  ) {
    const finalLog: UpdateLog = {
      ...(logBody as UpdateLog),
      timestamp: firestore.Timestamp.fromDate(new Date()) as any,
      user_id: uid as string,
      user_name: `${user?.first_name} ${user?.last_name}`,
      user_type: user?.role,
    };

    const cleaned = removeEmpty(finalLog);

    try {
      await logCollection.add(cleaned);
    } catch (error) {
      console.error(error);
    }

    console.log("Log created");
  }

  if (logBody.action === "Assign Card") {
    try {
      const finalLog = {
        ...logBody,
        timestamp: firestore.Timestamp.fromDate(new Date()) as any,
        assigned_by_user_id: uid as string,
        assigned_by_user_name: `${user?.first_name} ${user?.last_name}`,
        assigned_by_user_type: user?.role,
      };

      await logCollection.add(finalLog);
    } catch (error) {
      console.error(error);
    }
  }
};

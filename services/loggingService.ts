import getCurrentUid from "@/helper/getCurrentUid";
import firestore from "@react-native-firebase/firestore";
import { getUserInfo } from "./userApi/Authentication";

import {
  CreateLog,
  CreateLogInput,
  DeleteLog,
  DeleteLogInput,
} from "@/types/log";

const logCollection = firestore().collection("logs");

const removeEmpty = <T extends object>(obj: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== undefined && value !== null
    )
  ) as Partial<T>;
};

export const createLog = async (logBody: CreateLogInput | DeleteLogInput) => {
  const uid = getCurrentUid();
  const user = await getUserInfo(uid as string);

  if (
    logBody.action === "Create Card" ||
    logBody.action === "Create Category"
  ) {
    const finalLog: CreateLog = {
      ...logBody,
      user_id: uid as string,
      timestamp: firestore.Timestamp.fromDate(new Date()) as any,
      user_name: `${user?.first_name} ${user?.last_name}`,
      user_type: user?.role,
    };

    console.log(removeEmpty(finalLog));
    await logCollection.add(removeEmpty(finalLog));
  }

  if (
    logBody.action === "Delete Card" ||
    logBody.action === "Delete Category"
  ) {
    console.log("delete test");

    const finalLog: DeleteLog = {
      ...logBody,
      deleted_by_user_id: uid as string,
      deleted_at: firestore.Timestamp.fromDate(new Date()) as any,
      deleted_by_user_name: `${user?.first_name} ${user?.last_name}`,
      deleted_by_user_type: user?.role,
    };

    finalLog.image = "";

    const cleaned = removeEmpty(finalLog);
    console.log("Cleaned finalLog:", cleaned);

    try {
      await logCollection.add(cleaned);
    } catch (error) {
      console.error(error);
    }
  }

  console.log("Log created");
};

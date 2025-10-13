import { useAuthStore } from "@/stores/userAuthStore";

const getCurrentUid = () => {
  return useAuthStore.getState().user?.uid;
};

export default getCurrentUid;

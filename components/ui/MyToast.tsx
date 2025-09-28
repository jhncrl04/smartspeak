import Toast from "react-native-toast-message";

type ToastType = "success" | "error" | "info";

export const showToast = (
  msgType: ToastType,
  title: string = "",
  msg: string,
  position: "top" | "bottom" = "top"
) => {
  Toast.show({ type: msgType, text1: title, text2: msg, position: position });
};

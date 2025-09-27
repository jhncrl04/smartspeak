import COLORS from "@/constants/Colors";
import { ReactElement } from "react";
import { Text, TouchableOpacity } from "react-native";

type actionDetail = {
  text: string;
  clickHandler: () => void;
  icon?: ReactElement;
  iconPosition?: "start" | "end";
};

const ActionLink = ({
  text,
  clickHandler,
  icon,
  iconPosition = "start",
}: actionDetail) => {
  return (
    <TouchableOpacity
      onPress={clickHandler}
      style={{
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderBottomColor: COLORS.accent,
        borderBottomWidth: 1,
      }}
    >
      {icon && iconPosition === "start" && icon}
      <Text
        style={{
          fontFamily: "Poppins",
          fontWeight: 500,
          color: COLORS.accent,
          fontSize: 14,
          lineHeight: 16,
        }}
      >
        {text}
      </Text>

      {icon && iconPosition === "end" && icon}
    </TouchableOpacity>
  );
};

export default ActionLink;

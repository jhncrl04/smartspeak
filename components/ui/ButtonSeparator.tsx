import COLORS from "@/constants/Colors";
import { Text, View } from "react-native";
import HorizontalLine from "./HorizontalLine";

const ButtonSeparator = () => {
  return (
    <View
      style={{
        position: "relative",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <HorizontalLine />
      <Text
        style={{
          fontSize: 14,
          fontFamily: "Poppins",
          color: COLORS.gray,
          backgroundColor: COLORS.white,
          padding: 10,
        }}
      >
        OR
      </Text>
    </View>
  );
};

export default ButtonSeparator;

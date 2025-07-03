import COLORS from "@/constants/Colors";
import { View } from "react-native";

const HorizontalLine = () => {
  return (
    <View
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateY: "-50%" }, { translateX: "-50%" }],
        width: "100%",
        height: 0.3,
        backgroundColor: COLORS.gray,
      }}
    />
  );
};

export default HorizontalLine;

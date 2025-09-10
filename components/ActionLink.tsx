import COLORS from "@/constants/Colors";
import { Text, TouchableOpacity } from "react-native";

type actionDetail = {
  text: string;
  clickHandler: () => void;
};

const ActionLink = (props: actionDetail) => {
  return (
    <TouchableOpacity
      onPress={props.clickHandler}
      style={{
        alignSelf: "flex-end",
        borderBottomColor: COLORS.accent,
        borderBottomWidth: 1,
      }}
    >
      <Text style={{ color: COLORS.accent, fontSize: 16 }}>{props.text}</Text>
    </TouchableOpacity>
  );
};

export default ActionLink;

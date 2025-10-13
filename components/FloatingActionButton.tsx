import COLORS from "@/constants/Colors";
import { StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Octicons";

const FloatingButton = (props: { actionHandler: () => void }) => {
  return (
    <TouchableOpacity
      style={styles.buttonContainer}
      onPress={props.actionHandler}
    >
      <Icon name="plus" size={24} color={COLORS.white} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute", // 👈 floating
    bottom: 20,
    right: 20,

    width: 50,
    height: 50,
    borderRadius: 50,

    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // shadow on Android
    shadowColor: "#000", // shadow on iOS
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
});

export default FloatingButton;

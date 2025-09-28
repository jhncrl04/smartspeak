import COLORS from "@/constants/Colors";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type buttonDetail = {
  title: string;
  clickHandler: () => void;
  disabled?: boolean;
};

const SecondaryButton = (props: buttonDetail) => {
  const styles = StyleSheet.create({
    buttonContainer: {
      flexGrow: 1,

      borderColor: props.disabled ? COLORS.gray : COLORS.accent,
      borderWidth: 1.5,
      borderRadius: 5,

      height: "auto",
      padding: 5,

      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      fontSize: 14,
      fontFamily: "Poppins",
      fontWeight: "700",
      color: props.disabled ? COLORS.gray : COLORS.accent,
    },
  });

  return (
    <TouchableOpacity
      style={styles.buttonContainer}
      onPress={props.clickHandler}
      disabled={props.disabled}
    >
      <Text style={styles.buttonText}>{props.title}</Text>
    </TouchableOpacity>
  );
};

export default SecondaryButton;

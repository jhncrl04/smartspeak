import COLORS from "@/constants/Colors";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type buttonDetail = {
  title: string;
  clickHandler: () => void;
  disabled?: boolean;
};

const PrimaryButton = (props: buttonDetail) => {
  const styles = StyleSheet.create({
    buttonContainer: {
      borderRadius: 5,
      flexGrow: 1,
      height: "auto",
      maxHeight: 35,
      padding: 5,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: props.disabled ? COLORS.gray : COLORS.accent, // change bg
      opacity: props.disabled ? 0.7 : 1, // faded look
    },
    buttonText: {
      fontSize: 16,
      fontFamily: "Poppins",
      fontWeight: "500",
      color: props.disabled ? COLORS.semiWhite : COLORS.pureWhite, // lighter text
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

export default PrimaryButton;

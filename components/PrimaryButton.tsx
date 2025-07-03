import COLORS from "@/constants/Colors";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type buttonDetail = { title: string; clickHandler: () => void };

const PrimaryButton = (props: buttonDetail) => {
  const styles = StyleSheet.create({
    buttonContainer: {
      backgroundColor: COLORS.accent,
      borderRadius: 5,
      flexGrow: 1,

      height: "auto",
      padding: 5,

      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      fontSize: 16,
      fontFamily: "Poppins",
      fontWeight: "500",
      color: COLORS.pureWhite,
    },
  });

  return (
    <TouchableOpacity
      style={styles.buttonContainer}
      onPress={props.clickHandler}
    >
      <Text style={styles.buttonText}>{props.title}</Text>
    </TouchableOpacity>
  );
};

export default PrimaryButton;

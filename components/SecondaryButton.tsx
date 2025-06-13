import COLORS from "@/constants/Colors";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type buttonDetail = { title: string; clickHandler: () => void };

const SecondaryButton = (props: buttonDetail) => {
  const styles = StyleSheet.create({
    buttonContainer: {
      borderColor: COLORS.accent,
      borderWidth: 1,
      borderRadius: 5,

      padding: 5,

      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      color: COLORS.accent,
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

export default SecondaryButton;

import COLORS from "@/constants/Colors";
import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  children?: ReactNode;
  label: string;
  isFlex?: boolean;
};

const TextFieldWrapper = ({ children, label, isFlex }: Props) => {
  return (
    <View style={[styles.container, isFlex && { flex: 1 }]}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    fontFamily: "Poppins",
    fontWeight: "600",
    color: COLORS.gray,
    paddingLeft: 4,
  },
});

export default TextFieldWrapper;

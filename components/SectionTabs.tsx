import COLORS from "@/constants/Colors";
import { Pressable, StyleSheet, Text, View } from "react-native";

const SectionTabs = (props: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) => {
  const styles = StyleSheet.create({
    container: {
      minWidth: 100,
      backgroundColor: props.active ? COLORS.accent : COLORS.lightGray,
      borderRadius: 50,
      paddingVertical: 8,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionName: {
      color: props.active ? COLORS.white : COLORS.black,
      fontFamily: "Poppins",
      fontWeight: "500",
      fontSize: 14,
      lineHeight: 18,
    },
  });

  return (
    <Pressable onPress={props.onPress}>
      <View style={styles.container}>
        <Text style={styles.sectionName}>{props.label}</Text>
      </View>
    </Pressable>
  );
};

export default SectionTabs;

import COLORS from "@/constants/Colors";
import { StyleSheet, View } from "react-native";
import Card from "./Card";

const CardContainer = () => {
  const styles = StyleSheet.create({
    cardContainer: {
      flex: 1,
      flexWrap: "wrap",
      flexDirection: "row",

      alignItems: "center",

      gap: 20,

      backgroundColor: COLORS.white,

      paddingVertical: 20,
    },
  });

  return (
    <View style={styles.cardContainer}>
      <Card cardType="addProfile" name="" age={0} gender="" />
      <Card cardType="profile" name="Creeper" age={12} gender="Male" />
      <Card cardType="profile" name="Steve" age={12} gender="Male" />
      <Card cardType="profile" name="Azule" age={12} gender="Male" />
    </View>
  );
};

export default CardContainer;

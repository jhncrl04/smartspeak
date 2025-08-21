import COLORS from "@/constants/Colors";
import { StyleSheet, View } from "react-native";
import LearnerCard from "./LearnerCard";

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
      <LearnerCard cardType="addProfile" name="" age={0} gender="" />
      <LearnerCard cardType="profile" name="Creeper" age={12} gender="Male" />
      <LearnerCard cardType="profile" name="Steve" age={12} gender="Male" />
      <LearnerCard cardType="profile" name="Azule" age={12} gender="Male" />
    </View>
  );
};

export default CardContainer;

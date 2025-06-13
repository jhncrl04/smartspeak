import COLORS from "@/constants/Colors";
import { StyleSheet, View } from "react-native";

const HeroImage = () => {
  const styles = StyleSheet.create({
    heroImage: { width: "60%", height: "60%", backgroundColor: COLORS.gray },
  });
  return <View style={styles.heroImage}></View>;
};

export default HeroImage;

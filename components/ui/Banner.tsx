import COLORS from "@/constants/Colors";
import { StyleSheet, Text, View } from "react-native";
import HeroImage from "./HeroImage";

const Banner = () => {
  const styles = StyleSheet.create({
    banner: {
      flexGrow: 1,
      flexShrink: 1,

      backgroundColor: COLORS.shadow,

      justifyContent: "center",
      alignItems: "center",

      paddingHorizontal: 20,

      gap: 20,
    },
    bannerPhrase: {
      textAlign: "left",
      width: "80%",
      fontSize: 16,
    },
  });
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerPhrase}>
        SmartSpeak your digital companion for Picture Exchange Communication
        System
      </Text>
      <HeroImage />
    </View>
  );
};

export default Banner;

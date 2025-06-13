import COLORS from "@/constants/Colors";
import { Button, StyleSheet, Text, View } from "react-native";

const index = () => {
  return (
    <View style={styles.container}>
      <View></View>
      <View style={styles.appInfoContainer}>
        <View style={styles.homepageImage} />
        <Text style={styles.appName}>SmartSpeak</Text>
        <Text style={styles.appPhrase}>
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Natus.
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Test 1" />
        <Button title="Test 2" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,

    flexDirection: "column",
    justifyContent: "space-around",
  },
  appInfoContainer: {
    flexGrow: 0,
    flexDirection: "column",
    gap: 20,

    alignItems: "center",
  },
  homepageImage: {
    width: "25%",
    height: "25%",

    backgroundColor: COLORS.shadow,
  },
  appName: {
    fontSize: 24,
    fontFamily: "Poppins",
    fontWeight: "700",
    letterSpacing: 1,

    color: COLORS.accent,
  },
  appPhrase: {
    fontSize: 16,
    fontFamily: "Poppins",
    textAlign: "center",
    color: COLORS.gray,
  },
  buttonContainer: {
    flexGrow: 0,
    flexShrink: 0,
    gap: 10,
  },
});

export default index;

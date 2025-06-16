import PrimaryButton from "@/components/PrimaryButton";
import COLORS from "@/constants/Colors";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const SignupScreen = () => {
  return (
    <View style={styles.container}>
      <View style={{ backgroundColor: COLORS.gray, height: 1 }}></View>
      <View style={styles.formContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.stepIndicator}>Step 1 of 3</Text>
          <Text style={styles.header}>Select Your Role.</Text>
        </View>
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={"Teacher"}
            clickHandler={() => router.push("/screens/signup/personalDetails")}
          />
          <PrimaryButton
            title={"Parent"}
            clickHandler={() => router.push("/screens/signup/personalDetails")}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",

    paddingVertical: "20%",
    paddingHorizontal: "5%",
  },
  formContainer: {
    width: "100%",
    gap: 20,
  },
  headerContainer: {
    gap: 5,
  },
  stepIndicator: {
    fontSize: 14,
    fontFamily: "Poppins",
    color: COLORS.gray,
    fontWeight: 800,

    height: "auto",
  },
  header: {
    fontSize: 16,
    fontFamily: "Poppins",
    color: COLORS.black,
  },
  buttonContainer: {
    flexGrow: 1,

    width: "100%",
    gap: 10,
  },
});

export default SignupScreen;

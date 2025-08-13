import PrimaryButton from "@/components/PrimaryButton";
import COLORS from "@/constants/Colors";
import { useSignupForm } from "@/context/signupContext";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const SignupScreen = () => {
  const { formData, setFormData } = useSignupForm();

  const setFormRole = (role: string) => {
    setFormData({ ...formData, role: role });

    proceedToStepTwo();
  };

  const proceedToStepTwo = () => {
    router.push("/screens/signup/personalDetails");
  };

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
            clickHandler={() => {
              setFormRole("Teacher");
            }}
          />
          <PrimaryButton
            title={"Guardian"}
            clickHandler={() => setFormRole("Guardian")}
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
    justifyContent: "space-around",

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
    width: "100%",
    gap: 10,
  },
});

export default SignupScreen;

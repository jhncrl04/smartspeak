import PrimaryButton from "@/components/PrimaryButton";
import COLORS from "@/constants/Colors";
import { StyleSheet, Text, TextInput, View } from "react-native";

const SignUpCredentialScreens = () => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.stepIndicator}>Step 3 of 3</Text>
        <Text style={styles.header}>Set Up Your Credentials.</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textbox}
          placeholder="Email"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.textbox}
          placeholder="Password"
          secureTextEntry={true}
        />
        <TextInput
          style={styles.textbox}
          placeholder="Confirm Password"
          secureTextEntry={true}
        />
      </View>

      <View>
        <PrimaryButton title="Sign Up" clickHandler={() => {}} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,

    paddingVertical: "10%",
    paddingHorizontal: "5%",

    gap: 30,
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
  inputContainer: {
    gap: 15,
  },
  textbox: {
    borderColor: COLORS.gray,
    borderWidth: 1,
    borderRadius: 5,

    paddingVertical: 5,
    paddingHorizontal: 15,

    fontSize: 18,
  },
});

export default SignUpCredentialScreens;

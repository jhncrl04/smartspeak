import PrimaryButton from "@/components/PrimaryButton";
import COLORS from "@/constants/Colors";
import { useSignupForm } from "@/context/signupContext";
import { registerUser } from "@/services/userApi/NonLearnerRegistration";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

type userDataType = {
  role: string;
  fname: string;
  lname: string;
  phoneNum: string;
  email: string;
  password: string;
};

const SignUpCredentialScreens = () => {
  const { formData, setFormData } = useSignupForm();
  const [confirmPass, setConfirmPass] = useState("");

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
          onChangeText={(userMail) => {
            setFormData({ ...formData, email: userMail });
          }}
          value={formData.email}
        />
        <TextInput
          style={styles.textbox}
          placeholder="Password"
          secureTextEntry={true}
          onChangeText={(userPassword) => {
            setFormData({ ...formData, password: userPassword });
          }}
          value={formData.password}
        />
        <TextInput
          style={styles.textbox}
          placeholder="Confirm Password"
          secureTextEntry={true}
          onChangeText={(confirmPassword) => {
            setConfirmPass(confirmPassword);
          }}
          value={confirmPass}
        />
      </View>

      <View>
        <PrimaryButton
          title="Sign Up"
          clickHandler={() =>
            finishRegistration(
              formData.email,
              formData.password,
              confirmPass,
              formData
            )
          }
        />
      </View>
    </View>
  );
};

const finishRegistration = (
  email: string,
  password: string,
  confirmPassword: string,
  userData: userDataType
) => {
  if (
    !email ||
    email.trim().length === 0 ||
    !password ||
    password.trim().length === 0 ||
    !confirmPassword ||
    confirmPassword.trim().length === 0
  ) {
    console.log("====================================");
    console.log("a textfield is empty");
    console.log("====================================");
    return false;
  }

  if (password !== confirmPassword) {
    console.log("====================================");
    console.log("password don't match");
    console.log("====================================");
    return false;
  }

  registerUser(userData);

  console.log("====================================");
  console.log("register successfully");
  console.log("====================================");
  return true;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,

    paddingVertical: 10,
    paddingHorizontal: "5%",

    gap: 10,
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

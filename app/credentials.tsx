import PrimaryButton from "@/components/PrimaryButton";
import TextFieldWrapper from "@/components/TextfieldWrapper";
import COLORS from "@/constants/Colors";
import { useSignupForm } from "@/context/signupContext";
import { registerAdultUser } from "@/services/userApi/Registration";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type userDataType = {
  role: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  password: string;
  creation_date: Date;
};

const SignUpCredentialScreens = () => {
  const { formData, setFormData } = useSignupForm();
  const [confirmPass, setConfirmPass] = useState("Johncarlo1");

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.stepIndicator}>Step 3 of 4</Text>
          <Text style={styles.header}>Set Up Your Credentials.</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextFieldWrapper label="Email">
            <TextInput
              style={styles.textbox}
              placeholder=""
              keyboardType="email-address"
              onChangeText={(userMail) => {
                setFormData({ ...formData, email: userMail });
              }}
              value={formData.email}
            />
          </TextFieldWrapper>
          <TextFieldWrapper label="Password">
            <TextInput
              style={styles.textbox}
              placeholder=""
              secureTextEntry={true}
              onChangeText={(userPassword) => {
                setFormData({ ...formData, password: userPassword });
              }}
              value={formData.password}
            />
          </TextFieldWrapper>
          <TextFieldWrapper label="Confirm Password">
            <TextInput
              style={styles.textbox}
              placeholder=""
              secureTextEntry={true}
              onChangeText={(confirmPassword) => {
                setConfirmPass(confirmPassword);
              }}
              value={confirmPass}
            />
          </TextFieldWrapper>
        </View>

        <View>
          <PrimaryButton
            title="Sign Up"
            clickHandler={() =>
              // finishRegistration(
              //   formData.email,
              //   formData.password,
              //   confirmPass,
              //   formData
              // )
              router.push("/accountVerification")
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

const finishRegistration = async (
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
    return;
  }

  if (password !== confirmPassword) {
    console.log("====================================");
    console.log("password don't match");
    console.log("====================================");
    return;
  }

  const isRegisterSuccess = await registerAdultUser(userData);
  if (isRegisterSuccess) {
    console.log("====================================");
    console.log("register successfully");
    console.log("====================================");

    Alert.alert("Registration Successful");
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: "5%",
    paddingVertical: 25,
    gap: 8,
  },
  headerContainer: {
    gap: 0,
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
  errorMsgContainer: {
    padding: 15,

    backgroundColor: COLORS.errorText,
    borderRadius: 5,
  },
  errorMessage: {
    fontSize: 12,
    fontFamily: "Poppins",
    letterSpacing: 0.7,
    color: COLORS.white,
  },
  logoImage: {
    width: 150,
    height: 100,
  },
  inputContainer: {
    flex: 1,
    gap: 0,
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

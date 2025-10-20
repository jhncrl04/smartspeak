import PrimaryButton from "@/components/PrimaryButton";
import TextFieldWrapper from "@/components/TextfieldWrapper";
import { showToast } from "@/components/ui/MyToast";
import COLORS from "@/constants/Colors";
import { FormDataType, useSignupForm } from "@/context/signupContext";
import { registerAdultUser } from "@/services/userApi/Registration";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Icon from "react-native-vector-icons/Octicons";

import validator from "validator";
import zxcvbn from "zxcvbn";

type userDataType = FormDataType;

const SignUpCredentialScreens = () => {
  const { formData, setFormData } = useSignupForm();
  const [confirmPass, setConfirmPass] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [passwordMsg, setPasswordMsg] = useState("");

  const validatePasswordStrength = (password: string) => {
    const { score, feedback } = zxcvbn(password);

    setPasswordStrength(score);

    switch (score) {
      case 0:
        setPasswordMsg("Password required");
        break; // ADDED
      case 1:
        setPasswordMsg(
          feedback.warning !== ""
            ? `${feedback.warning}.\nPassword is too weak.`
            : `Password is too weak.`
        );
        break;
      case 2:
        setPasswordMsg(
          feedback.warning !== ""
            ? `${feedback.warning}.\nPassword is good.`
            : "Password is good."
        );
        break; // ADDED
      case 3:
        setPasswordMsg("Password is excellent.");
        break; // ADDED
      case 4:
        setPasswordMsg("Password is very strong.");
        break;
      default:
        break;
    }
  };

  if (passwordStrength < 2) {
    // CHANGED: < instead of >
    showToast(
      "error",
      "Password is too weak",
      "Please use a stronger password"
    );
    return;
  }

  const [isLoading, setIsLoading] = useState(false);

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
      showToast("error", "Missing input", "Please fill all the inputs");

      return;
    }

    if (!validator.isEmail(email)) {
      showToast("error", "Invalid Email", "Please check your email");

      return;
    }

    if (password !== confirmPassword) {
      showToast("error", "Password Error", "Password don't match");
      return;
    }

    setIsLoading(true);
    const isRegisterSuccess = await registerAdultUser(userData);

    if (isRegisterSuccess) {
      router.replace("/accountVerification");

      console.log("register successfully");
    }
  };

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

          <Text
            style={{
              fontSize: 14,
              fontFamily: "Poppins",
              fontWeight: 500,
              marginTop: 5,
              lineHeight: 18,
              color: COLORS.black,
            }}
          >
            Create a strong password — at least 8 characters with a mix of
            letters, numbers, and symbols *
          </Text>
          <TextFieldWrapper label="Password">
            <View
              style={[
                styles.textbox,
                {
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",

                  paddingHorizontal: 0,
                  paddingVertical: 0,
                },
              ]}
            >
              <TextInput
                style={[
                  styles.textbox,
                  {
                    flex: 1,
                    borderWidth: 0,
                  },
                ]}
                placeholder=""
                secureTextEntry={!showPassword}
                onChangeText={(userPassword) => {
                  validatePasswordStrength(userPassword);
                  setFormData({ ...formData, password: userPassword });
                }}
                value={formData.password}
              />
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 8,
                }}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon name={showPassword ? "eye-closed" : "eye"} size={20} />
              </TouchableOpacity>
            </View>
          </TextFieldWrapper>
          <View>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Poppins",
                fontWeight: 500,
                color:
                  passwordStrength <= 1 ? COLORS.errorText : COLORS.successText,
                height: passwordMsg === "" ? 0 : "auto",
              }}
            >
              {passwordMsg}
            </Text>
          </View>
          <View style={styles.passwordStrengthContainer}>
            <View
              style={{
                flex: 1,
                borderRadius: 5,
                backgroundColor:
                  passwordStrength >= 1 ? COLORS.errorText : COLORS.lightGray,
              }}
            />
            <View
              style={{
                flex: 1,
                borderRadius: 5,
                backgroundColor:
                  passwordStrength >= 2 ? COLORS.warningBg : COLORS.lightGray,
              }}
            />
            <View
              style={{
                flex: 1,
                borderRadius: 5,
                backgroundColor:
                  passwordStrength >= 3 ? COLORS.successText : COLORS.lightGray,
              }}
            />
          </View>
          <TextFieldWrapper label="Confirm Password">
            <View
              style={[
                styles.textbox,
                {
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",

                  paddingHorizontal: 0,
                  paddingVertical: 0,
                },
              ]}
            >
              <TextInput
                style={[
                  styles.textbox,
                  {
                    flex: 1,
                    borderWidth: 0,
                  },
                ]}
                placeholder=""
                secureTextEntry={!showPassword}
                onChangeText={(confirmPassword) => {
                  setConfirmPass(confirmPassword);
                }}
                value={confirmPass}
              />
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 8,
                }}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon name={showPassword ? "eye-closed" : "eye"} size={20} />
              </TouchableOpacity>
            </View>
          </TextFieldWrapper>
        </View>

        <View>
          <PrimaryButton
            title="Sign Up"
            clickHandler={() => {
              if (passwordStrength > 2) {
                showToast(
                  "error",
                  "Password is too weak",
                  "Please use a stronger password"
                );

                return;
              }
              finishRegistration(
                formData.email,
                formData.password,
                confirmPass,
                formData
              );
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: COLORS.white,
  },
  passwordStrengthContainer: {
    gap: 5,
    overflow: "hidden",

    borderRadius: 10,
    flex: 1,
    flexDirection: "row",
    height: 10,
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
    gap: 5,
  },
  textbox: {
    backgroundColor: COLORS.pureWhite,

    borderColor: COLORS.gray,
    borderWidth: 1,
    borderRadius: 5,

    paddingVertical: 8,
    paddingHorizontal: 15,

    fontSize: 18,
  },
});

export default SignUpCredentialScreens;

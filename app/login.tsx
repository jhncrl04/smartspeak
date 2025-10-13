import ActionLink from "@/components/ActionLink";
import PrimaryButton from "@/components/PrimaryButton";
import TextFieldWrapper from "@/components/TextfieldWrapper";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { showToast } from "@/components/ui/MyToast";
import COLORS from "@/constants/Colors";
import { loginAuth } from "@/services/userApi/Authentication";
import { checkVerification, setLoginState } from "@/services/userService";
import auth from "@react-native-firebase/auth";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Icon from "react-native-vector-icons/Octicons";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const validateInput = async (email: string, password: string) => {
    try {
      setLoading(true);

      const userAuth = await loginAuth(email, password);

      if (userAuth) {
        const isVerified = await checkVerification();

        if (!isVerified) {
          Alert.alert(
            "Account not verified",
            "Your account is not yet verified. We’ve sent you a verification link via email.\n\nDo you want to resend the verification link?",
            [
              {
                text: "Resend link",
                onPress: async () => {
                  try {
                    const user = auth().currentUser;
                    if (user && !user.emailVerified) {
                      await user.sendEmailVerification();
                      showToast(
                        "success",
                        "Verification link sent",
                        "Please check your email."
                      );
                    } else {
                      showToast(
                        "success",
                        "Already verified",
                        "Your email is already verified."
                      );
                    }
                  } catch (error) {
                    console.error("Error sending verification link:", error);
                    showToast(
                      "error",
                      "Error",
                      "Failed to send verification link. Please try again later."
                    );
                  }
                },
              },
              {
                text: "OK",
                style: "cancel",
              },
            ]
          );
          return;
        }

        const [firebaseUser, userDoc] = userAuth;

        if (userDoc && "role" in userDoc) {
          const role = userDoc.role;

          setLoginState(firebaseUser, userDoc);

          // await registerPushNotifications(userDoc.uid);
          router.replace(`/screens/${role.toLowerCase()}` as any);
        } else {
          console.log("User document missing or role not found.");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LoadingScreen visible={loading} />

      <View style={{ flex: 1, width: "100%" }}>
        <View style={styles.loginForm}>
          <View style={styles.inputContainer}>
            <TextFieldWrapper label="Email">
              <TextInput
                style={styles.textbox}
                placeholder=""
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </TextFieldWrapper>

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
                  value={password}
                  onChangeText={setPassword}
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
          <ActionLink
            text="Forgot Password?"
            clickHandler={() => {
              router.push("/forgotPassword");
            }}
          />
          <View>
            <PrimaryButton
              title={"Log In"}
              disabled={loading}
              clickHandler={async () => {
                await validateInput(email, password);
              }}
            />
            {/* <ButtonSeparator />
            <SecondaryButton
              title={"Continue With Google"}
              clickHandler={() => {}}
            /> */}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    flex: 1,

    paddingHorizontal: 50,
    gap: 15,
  },
  loginForm: {
    width: "100%",

    gap: 10,
    justifyContent: "center",

    paddingVertical: 10,
  },
  textbox: {
    borderColor: COLORS.gray,
    borderWidth: 1,
    borderRadius: 5,

    paddingHorizontal: 15,
    paddingVertical: 5,

    fontSize: 16,
  },
  inputContainer: {
    gap: 5,
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
});

export default LoginScreen;

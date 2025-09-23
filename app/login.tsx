import ActionLink from "@/components/ActionLink";
import PrimaryButton from "@/components/PrimaryButton";
import TextFieldWrapper from "@/components/TextfieldWrapper";
import LoadingScreen from "@/components/ui/LoadingScreen";
import COLORS from "@/constants/Colors";
import { loginAuth } from "@/services/userApi/Authentication";
import { checkVerification, setLoginState } from "@/services/userService";
import { useAuthStore } from "@/stores/userAuthStore";
import auth from "@react-native-firebase/auth";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, TextInput, View } from "react-native";

const LoginScreen = () => {
  // added a value for testing, remove when done
  const [email, setEmail] = useState("johncarloservidad1@gmail.com");
  const [password, setPassword] = useState("Johncarlo12");
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);

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
                      Alert.alert(
                        "Verification link sent",
                        "Please check your email."
                      );
                    } else {
                      Alert.alert(
                        "Already verified",
                        "Your email is already verified."
                      );
                    }
                  } catch (error) {
                    console.error("Error sending verification link:", error);
                    Alert.alert(
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
              <TextInput
                style={styles.textbox}
                placeholder=""
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />
            </TextFieldWrapper>
          </View>
          <ActionLink
            text="Forgot Password?"
            clickHandler={() => {
              router.push("/registration");
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

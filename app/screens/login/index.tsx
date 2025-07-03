import ActionLink from "@/components/ActionLink";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import ButtonSeparator from "@/components/ui/ButtonSeparator";
import COLORS from "@/constants/Colors";
import { router } from "expo-router";
import { StyleSheet, TextInput, View } from "react-native";

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <View style={{ width: "100%" }}>
        <View style={styles.loginForm}>
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
          <ActionLink
            text="Forgot Password?"
            clickHandler={() => {
              router.push("/screens/signup");
            }}
          />
          {/* <Link style={styles.forgotPassword} href="/screens/signup">
            Forgot Password?
          </Link> */}
          <View>
            <PrimaryButton
              title={"Log In"}
              clickHandler={() => router.push("./teacher/")}
            />
            <ButtonSeparator />
            <SecondaryButton
              title={"Continue With Google"}
              clickHandler={() => {}}
            />
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

    padding: 20,
    gap: 15,
  },
  loginForm: {
    width: "100%",

    gap: 10,
    justifyContent: "center",
  },
  textbox: {
    borderColor: COLORS.gray,
    borderWidth: 1,
    borderRadius: 5,

    paddingHorizontal: 15,

    fontSize: 16,
  },
  inputContainer: {
    gap: 10,
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
});

export default LoginScreen;

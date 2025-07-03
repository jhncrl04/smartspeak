import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import HorizontalLine from "@/components/ui/HorizontalLine";
import COLORS from "@/constants/Colors";
import { Link, router } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <View style={{ width: "100%" }}>
        <View style={styles.loginForm}>
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
            <Link href="/screens/signup">Forgot Password?</Link>
            {/* <ActionLink text={"Forgot Password?"} clickHandler={() => {}} /> */}
          </View>
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={"Log In"}
              clickHandler={() => router.push("./teacher/")}
            />
          </View>
        </View>
        <View
          style={{
            position: "relative",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HorizontalLine />
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Poppins",
              color: COLORS.gray,
              backgroundColor: COLORS.white,
              padding: 10,
            }}
          >
            OR
          </Text>
        </View>
        <View style={styles.oauthContainer}>
          <SecondaryButton
            title={"Continue With Google"}
            clickHandler={() => {}}
          />
        </View>
      </View>
      <Text
        style={{
          color: COLORS.gray,
          textAlign: "center",
        }}
      >
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sed, optio!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    flex: 1,

    justifyContent: "space-between",
    alignItems: "center",

    paddingVertical: "20%",
    paddingHorizontal: 20,
    gap: 15,
  },
  loginForm: {
    width: "100%",
    height: "auto",

    backgroundColor: "#ff0",
    gap: 30,
    justifyContent: "center",
  },
  textbox: {
    borderColor: COLORS.gray,
    borderWidth: 1,
    borderRadius: 5,

    paddingHorizontal: 15,

    fontSize: 18,
  },
  inputContainer: {
    gap: 10,
  },
  buttonContainer: {
    gap: 10,
  },
  oauthContainer: {
    width: "100%",
  },
});

export default LoginScreen;

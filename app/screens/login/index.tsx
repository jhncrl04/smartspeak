import ActionLink from "@/components/ActionLink";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import COLORS from "@/constants/Colors";
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
            <ActionLink text={"Forgot Password?"} clickHandler={() => {}} />
          </View>
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={"Log In"}
              clickHandler={() => console.log("button test")}
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
          <View
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: [{ translateY: "-50%" }, { translateX: "-50%" }],
              width: "100%",
              height: 0.3,
              backgroundColor: COLORS.gray,
            }}
          />
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

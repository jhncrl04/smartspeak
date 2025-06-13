import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import Banner from "@/components/ui/Banner";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

const LoginScreen = () => {
  return (
    <View>
      <Banner />
      <View style={styles.loginForm}>
        <Text>LOGIN</Text>
        <TextInput placeholder="Email" />
        <TextInput placeholder="Password" secureTextEntry={true} />
        <Button title="Forgot Password?" />

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={"Log In"}
            clickHandler={() => console.log("button test")}
          />
          <SecondaryButton
            title={"Create an account"}
            clickHandler={() => console.log("button test")}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  loginForm: {
    flexGrow: 0,
    flexShrink: 0,

    paddingHorizontal: 50,
    justifyContent: "center",
    width: "35%",
  },
  buttonContainer: {
    gap: 10,
  },
});

export default LoginScreen;

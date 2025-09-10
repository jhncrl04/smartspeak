import ActionLink from "@/components/ActionLink";
import PrimaryButton from "@/components/PrimaryButton";
import COLORS from "@/constants/Colors";
import { loginAuth } from "@/services/userApi/Authentication";
import { useAuthStore } from "@/stores/userAuthStore";
import auth from "@react-native-firebase/auth";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

const LoginScreen = () => {
  // added a value for testing, remove when done
  const [email, setEmail] = useState("johncarloservidad1@gmail.com");
  const [password, setPassword] = useState("Johncarlo1");

  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);

  const validateInput = async (email: string, password: string) => {
    const userAuth = await loginAuth(email, password);

    if (userAuth) {
      const [firebaseUser, userDoc] = userAuth;

      if (userDoc && "role" in userDoc) {
        const role = userDoc.role;
        const currentUser = auth().currentUser;

        login({
          fname: userDoc.first_name,
          lname: userDoc.last_name,
          email: userDoc.email,
          phoneNumber: userDoc.phone_number,
          profile: userDoc.profile_pic,
          role: role,
          uid: firebaseUser?.uid,
        });

        console.log(firebaseUser?.uid);

        router.replace(`/screens/${role.toLowerCase()}` as any);
      } else {
        console.log("User document missing or role not found.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ width: "100%" }}>
        <View style={styles.loginForm}>
          <TextInput
            style={styles.textbox}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.textbox}
            placeholder="Password"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
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
    paddingVertical: 5,

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

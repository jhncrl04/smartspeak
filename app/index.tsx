import ActionLink from "@/components/ActionLink";
import PrimaryButton from "@/components/PrimaryButton";
import COLORS from "@/constants/Colors";
import { router } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

const index = () => {
  // const user = useAuthStore((state) => state.user);

  // useEffect(() => {
  //   if (user?.role) {
  //     router.replace(`/screens/${user.role.toLowerCase()}` as any);
  //   }
  // }, [user]);

  return (
    <View style={styles.container}>
      <View></View>
      <View style={styles.appInfoContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.homepageImage}
        />
        {/* <Text style={styles.appName}>SmartSpeak</Text> */}
        <Text style={styles.appPhrase}>
          Your localized picture exchange communication app.
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <PrimaryButton
          title={"Sign In"}
          clickHandler={() => router.push("./screens/login/")}
        />
        <View style={styles.registerContainer}>
          <Text
            style={{
              fontSize: 16,
              color: COLORS.gray,
            }}
          >
            Don't have an account?
          </Text>
          <ActionLink
            text={"Register"}
            clickHandler={() => router.push("./screens/signup/")}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,

    flexDirection: "column",
    justifyContent: "space-around",
  },
  appInfoContainer: {
    flexGrow: 0,
    flexDirection: "column",
    gap: 10,

    alignItems: "center",
  },
  homepageImage: {
    width: 200,
    height: 100,
  },
  appName: {
    fontSize: 24,
    fontFamily: "Poppins",
    fontWeight: "700",
    letterSpacing: 1,

    color: COLORS.accent,
  },
  appPhrase: {
    fontSize: 16,
    fontFamily: "Poppins",
    textAlign: "center",
    color: COLORS.gray,
  },
  buttonContainer: {
    flexGrow: 0,
    flexShrink: 0,
    gap: 10,
  },
  registerContainer: {
    flexDirection: "row",
    gap: 5,

    justifyContent: "center",
  },
});

export default index;

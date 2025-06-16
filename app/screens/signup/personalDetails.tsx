import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import COLORS from "@/constants/Colors";
import { router } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";

const PersonalDetailsScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.stepIndicator}>Step 2 of 3</Text>
        <Text style={styles.header}>Let's Get to Know You.</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput style={styles.textbox} placeholder="First Name" />
        <TextInput style={styles.textbox} placeholder="Last Name" />
        <TextInput
          style={styles.textbox}
          placeholder="Phone Number"
          keyboardType="phone-pad"
        />
      </View>
      <View>
        <PrimaryButton
          title={"Next"}
          clickHandler={() => router.push("/screens/signup/credentials")}
        />
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
        <SecondaryButton
          title={"Continue with Google"}
          clickHandler={() => {}}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingVertical: "10%",
    paddingHorizontal: "5%",

    backgroundColor: COLORS.white,

    gap: 30,
  },
  headerContainer: {
    gap: 5,
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
  logoImage: {
    width: 150,
    height: 100,
  },
  inputContainer: {
    gap: 15,
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

export default PersonalDetailsScreen;

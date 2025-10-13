import ActionLink from "@/components/ActionLink";
import PrimaryButton from "@/components/PrimaryButton";
import COLORS from "@/constants/Colors";
import { useSignupForm } from "@/context/signupContext";
import { censorEmail } from "@/helper/censorEmail";
import { useAuthStore } from "@/stores/userAuthStore";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

const AccountVerificationScreen = () => {
  const { formData, setFormData } = useSignupForm();

  const handleLogout = () => {
    useAuthStore.getState().logout();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.stepIndicator}>Step 4 of 4</Text>
          <Text style={styles.header}>Verify your account.</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.infoText}>
            We have sent a verification link on your email.
          </Text>
          <Text style={styles.emailText}>{censorEmail(formData.email)}</Text>
        </View>
        <View>
          <PrimaryButton
            title="Already verified? Proceed to login"
            clickHandler={handleLogout}
          />
        </View>
        <ActionLink
          text="Verify later"
          clickHandler={() => {
            Alert.alert(
              "Verification Required",
              "We have sent you a verification link in your email.\n⚠️ The link will expire in 1 hour. Please verify your account before logging in.",
              [
                {
                  text: "OK",
                  style: "default",
                  onPress: () => {
                    handleLogout(); // 👈 call your logout function here
                  },
                },
              ]
            );
          }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: COLORS.white,
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
  infoText: {
    fontSize: 14,
    fontFamily: "Poppins",
    fontWeight: "400",
    color: COLORS.gray,
  },
  emailText: {
    fontSize: 15,
    fontFamily: "Poppins",
    fontWeight: "600",
    marginLeft: 10,
    marginBottom: 10,
    color: COLORS.accent,
  },
  logoImage: {
    width: 150,
    height: 100,
  },
  inputContainer: {
    flex: 1,
    gap: 0,
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

export default AccountVerificationScreen;

import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import ButtonSeparator from "@/components/ui/ButtonSeparator";
import COLORS from "@/constants/Colors";
import { useSignupForm } from "@/context/signupContext";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

const PersonalDetailsScreen = () => {
  const [errorMsg, setErrorMsg] = useState("This is an error message");

  const { formData, setFormData } = useSignupForm();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.stepIndicator}>Step 2 of 3</Text>
        <Text style={styles.header}>Let's Get to Know You.</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textbox}
          placeholder="First Name"
          onChangeText={(firstName) => {
            setFormData({ ...formData, fname: firstName });
          }}
          value={formData.fname}
        />
        <TextInput
          style={styles.textbox}
          placeholder="Last Name"
          onChangeText={(lastName) => {
            setFormData({ ...formData, lname: lastName });
          }}
          value={formData.lname}
        />
        <TextInput
          style={styles.textbox}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          onChangeText={(phoneNum) => {
            setFormData({ ...formData, phoneNum: phoneNum });
          }}
          value={formData.phoneNum}
        />
      </View>
      <View>
        <PrimaryButton
          title={"Next"}
          clickHandler={() =>
            proceedToStepThree(
              formData.fname,
              formData.lname,
              formData.phoneNum
            )
          }
        />
        <ButtonSeparator />
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

    paddingHorizontal: "5%",

    backgroundColor: COLORS.white,

    gap: 10,
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
  logoImage: {
    width: 150,
    height: 100,
  },
  inputContainer: {
    gap: 5,
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

const isDataValid = (firstName: string, lastName: string, phoneNum: string) => {
  if (
    !firstName ||
    firstName.trim().length === 0 ||
    !lastName ||
    lastName.trim().length === 0 ||
    !phoneNum ||
    phoneNum.trim().length === 0
  ) {
    return false;
  }

  return true;
};

const proceedToStepThree = (
  firstName: string,
  lastName: string,
  phoneNum: string
) => {
  if (isDataValid(firstName, lastName, phoneNum)) {
    router.push("/screens/signup/credentials");
  }
};

export default PersonalDetailsScreen;

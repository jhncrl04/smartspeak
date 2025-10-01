import ActionLink from "@/components/ActionLink";
import PrimaryButton from "@/components/PrimaryButton";
import TextFieldWrapper from "@/components/TextfieldWrapper";
import COLORS from "@/constants/Colors";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import auth from "@react-native-firebase/auth";

import Icon from "react-native-vector-icons/Octicons";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setErrorMsg("");

    // Validate email
    if (!email.trim()) {
      setErrorMsg("Email address is required");
      return;
    }

    if (!validateEmail(email.trim())) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      auth().sendPasswordResetEmail(email);

      Alert.alert(
        "Reset Link Sent",
        `A password reset link has been sent to ${email}. Please check your email and follow the instructions.`,
        [
          {
            text: "OK",
            onPress: () => router.back(), // Navigate back to login
          },
        ]
      );

      // Clear the form
      setEmail("");
    } catch (error) {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Forgot Your Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your
            password.
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextFieldWrapper label="Email Address">
            <TextInput
              style={styles.textbox}
              placeholder="Enter your email address"
              value={email}
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </TextFieldWrapper>
        </View>

        <View>
          <PrimaryButton
            title={isLoading ? "Sending..." : "Send Reset Link"}
            clickHandler={handleSubmit}
          />
        </View>

        <View style={styles.footer}>
          <ActionLink
            icon={<Icon name="arrow-left" size={24} color={COLORS.accent} />}
            text="Back to Sign In"
            clickHandler={router.back}
            isBold={true}
            fontSize={16}
          />
        </View>
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
    marginBottom: 10,
  },
  header: {
    fontSize: 16,
    fontFamily: "Poppins",
    color: COLORS.black,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins",
    color: COLORS.gray,
    lineHeight: 20,
  },
  inputContainer: {
    flex: 1,
    gap: 0,
    marginBottom: 5,
  },
  textbox: {
    borderColor: COLORS.gray,
    borderWidth: 1,
    borderRadius: 5,

    paddingVertical: 8,
    paddingHorizontal: 10,

    fontSize: 18,
  },
  footer: {
    alignItems: "center",
    marginTop: 10,
  },
  linkText: {
    fontSize: 14,
    fontFamily: "Poppins",
    color: COLORS.accent,
    fontWeight: "600",
  },
});

export default ForgotPasswordScreen;

import COLORS from "@/constants/Colors";
import { useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

const SignupOtpVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    const filtered = text.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = filtered;
    setOtp(newOtp);

    if (filtered && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (otp[index]) {
        // Delete current field
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous field and delete it
        inputs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          Enter the OTP we have sent to your email.
        </Text>
        <Text style={styles.sublabel}>J************1@gmail.com</Text>
      </View>
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            style={styles.otpInput}
            ref={(ref) => {
              if (ref) inputs.current[index] = ref;
            }}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 30,
    gap: 20,
  },
  labelContainer: {
    gap: 5,
  },
  label: {
    fontSize: 16,
    color: COLORS.gray,
  },
  sublabel: {
    fontFamily: "Poppins",
    fontWeight: "500",
    color: COLORS.accent,
  },
  otpContainer: { flexDirection: "row", gap: 10 },
  otpInput: {
    borderColor: COLORS.gray,
    borderWidth: 1,
    borderRadius: 5,
    fontSize: 16,
    fontFamily: "Poppins",
    textAlign: "center",
    width: 40,
    height: 40,
  },
});

export default SignupOtpVerification;

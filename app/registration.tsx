import PrimaryButton from "@/components/PrimaryButton";
import COLORS from "@/constants/Colors";
import { useSignupForm } from "@/context/signupContext";
import { router } from "expo-router";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SignupScreen = () => {
  const { formData, setFormData } = useSignupForm();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const setFormRole = (role: string) => {
    setFormData({ ...formData, role: role });
    proceedToStepTwo();
  };

  const proceedToStepTwo = () => {
    router.push("/personalDetails");
  };

  const LegalModal = ({
    visible,
    onClose,
    title,
    content,
  }: {
    visible: boolean;
    onClose: () => void;
    title: string;
    content: string;
  }) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalText}>{content}</Text>
          </ScrollView>
          <View style={styles.modalFooter}>
            <PrimaryButton title="Close" clickHandler={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View></View>
      <View style={styles.formContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.stepIndicator}>Step 1 of 4</Text>
          <Text style={styles.header}>Select Your Role</Text>
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={"Teacher"}
            clickHandler={() => {
              setFormRole("Teacher");
            }}
          />
          <PrimaryButton
            title={"Guardian"}
            clickHandler={() => setFormRole("Guardian")}
          />
        </View>

        {/* Privacy Policy and Terms Links - MOVED TO BOTTOM */}
        <View style={styles.legalContainer}>
          <Text style={styles.legalText}>
            By continuing, you agree to our{" "}
            <Text style={styles.link} onPress={() => setShowTermsModal(true)}>
              Terms & Conditions
            </Text>{" "}
            and acknowledge our{" "}
            <Text style={styles.link} onPress={() => setShowPrivacyModal(true)}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>

      {/* Terms & Conditions Modal */}
      <LegalModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Terms & Conditions"
        content={`Please read these terms and conditions carefully before using our service.

1. Acceptance of Terms
By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.

2. User Responsibilities
You are responsible for maintaining the confidentiality of your account and password and for restricting access to your device.

3. Content
Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material.

4. Termination
We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever.

5. Changes to Terms
We reserve the right, at our sole discretion, to modify or replace these Terms at any time.

If you have any questions about these Terms, please contact us.`}
      />

      {/* Privacy Policy Modal */}
      <LegalModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Privacy Policy"
        content={`We are committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed.

1. Information We Collect
We collect information you provide directly to us, such as when you create an account, update your profile, or use our services.

2. How We Use Your Information
We use the information we collect to:
- Provide, maintain, and improve our services
- Send you technical notices and support messages
- Respond to your comments and questions
- Monitor and analyze trends and usage

3. Information Sharing
We do not share your personal information with third parties except as described in this policy.

4. Data Security
We implement appropriate technical and organizational security measures to protect your personal information.

5. Your Rights
You have the right to access, correct, or delete your personal information.

6. Children's Privacy
Our service does not address anyone under the age of 13.

If you have any questions about this Privacy Policy, please contact us.`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
    paddingHorizontal: "5%",
  },
  formContainer: {
    width: "100%",
    gap: 20,
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
  buttonContainer: {
    width: "100%",
    gap: 10,
  },
  legalContainer: {
    paddingHorizontal: 10,
  },
  legalText: {
    fontSize: 14,
    fontFamily: "Poppins",
    color: COLORS.gray,
    textAlign: "center",
    lineHeight: 20,
  },
  link: {
    color: COLORS.primary,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "100%",
    maxHeight: "95%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray + "20",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins",
    fontWeight: "700",
    color: COLORS.black,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: COLORS.gray,
    fontWeight: "300",
  },
  modalBody: {
    padding: 20,
  },
  modalText: {
    fontSize: 14,
    fontFamily: "Poppins",
    color: COLORS.black,
    lineHeight: 20,
  },
  modalFooter: {
    padding: 10,
  },
});

export default SignupScreen;

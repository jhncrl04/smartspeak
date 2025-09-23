import COLORS from "@/constants/Colors";
import { addStudentToSection } from "@/services/sectionService";
import { addAsStudent } from "@/services/userService";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../PrimaryButton";

type previewProps = {
  learnerName: string;
  learnerProfile?: string;
  learnerId: string;
  sectionId?: string;
};

const AddChildPreview = ({
  learnerName,
  learnerProfile,
  learnerId,
  sectionId,
}: previewProps) => {
  const [buttonTitle, setButtonTitle] = useState("Add");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleAddEvent = async (learnerId: string, sectionId: string) => {
    const result = await addAsStudent(learnerId);
    const sectionResult = await addStudentToSection(learnerId, sectionId);

    if (result.success && sectionResult.success) {
      setIsButtonDisabled(true);
      setButtonTitle("Added");
    }
  };

  return (
    <View style={styles.profilePreview}>
      <View style={styles.profileInfoContainer}>
        <Image source={{ uri: learnerProfile }} style={styles.profileImage} />
        <Text style={styles.profileName}>{learnerName}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <PrimaryButton
          title={buttonTitle}
          disabled={isButtonDisabled}
          clickHandler={() => {
            handleAddEvent(learnerId, sectionId as string);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profilePreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileInfoContainer: {
    gap: 10,
    alignItems: "center",
    flexDirection: "row",
  },
  profileImage: { width: 50, height: 50, borderRadius: 50 },
  profileName: { fontSize: 16, fontFamily: "Poppins", color: COLORS.gray },
  buttonContainer: {
    width: 75,
  },
});

export default AddChildPreview;

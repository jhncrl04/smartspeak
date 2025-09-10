import COLORS from "@/constants/Colors";
import { addAsStudent } from "@/services/userService";
import { Image, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../PrimaryButton";

type previewProps = {
  learnerName: string;
  learnerProfile?: string;
  learnerId: string;
};

const AddChildPreview = ({
  learnerName,
  learnerProfile,
  learnerId,
}: previewProps) => {
  return (
    <View style={styles.profilePreview}>
      <View style={styles.profileInfoContainer}>
        <Image source={{ uri: learnerProfile }} style={styles.profileImage} />
        <Text style={styles.profileName}>{learnerName}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <PrimaryButton
          title="Add"
          clickHandler={() => {
            addAsStudent(learnerId);
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

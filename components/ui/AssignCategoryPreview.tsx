import COLORS from "@/constants/Colors";
import { assignCategory } from "@/services/categoryService";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../PrimaryButton";

type previewProps = {
  categoryName: string;
  categoryImage?: string;
  categoryId: string;
  learnerId?: string;
};

const AssignCategoryPreview = ({
  categoryName,
  categoryImage,
  categoryId,
  learnerId,
}: previewProps) => {
  const [isAssigned, setIsAssigned] = useState(false);
  const [isButtonDisabled, setIsButtonDisable] = useState(false);

  const handleAssign = async () => {
    try {
      await assignCategory(categoryId, learnerId);
      setIsAssigned(true); // update UI after assigning
      // setIsButtonDisable(true);
    } catch (err) {
      console.error("Failed to assign category:", err);
    }
  };

  return (
    <View style={styles.categoryPreview}>
      <View style={styles.categoryInfoContainer}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: categoryImage }} style={styles.categoryImage} />
        </View>
        <Text style={styles.categoryName}>{categoryName}</Text>
      </View>
      <View>
        <PrimaryButton
          title={"Assign"} // change label
          clickHandler={handleAssign}
          disabled={isButtonDisabled}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryInfoContainer: {
    gap: 10,
    alignItems: "center",
    flexDirection: "row",
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 50,

    overflow: "hidden",
    backgroundColor: COLORS.white,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryName: { fontSize: 16, fontFamily: "Poppins", color: COLORS.gray },
});

export default AssignCategoryPreview;

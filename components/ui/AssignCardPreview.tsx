import COLORS from "@/constants/Colors";
import { assignCard } from "@/services/cardsService";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../PrimaryButton";

type CardProps = {
  cardId: string;
  cardName: string;
  cardCategory: string;
  categoryColor: string;
  image: string;
  learnerId: string;
};

const AssignCardPreview = ({
  cardId,
  cardName,
  cardCategory,
  categoryColor,
  image,
  learnerId,
}: CardProps) => {
  const [isAssigned, setIsAssigned] = useState(false);
  const [isButtonDisabled, setIsButtonDisable] = useState(false);

  const handleAssign = async () => {
    try {
      await assignCard(cardId, learnerId);
      setIsAssigned(true); // update UI after assigning
      setIsButtonDisable(true);
    } catch (err) {
      console.error("Failed to assign card:", err);
    }
  };

  return (
    <View style={styles.categoryPreview}>
      <View style={styles.categoryInfoContainer}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.categoryImage} />
        </View>
        <Text style={styles.categoryName}>{cardName}</Text>
      </View>
      <View>
        <PrimaryButton
          title={isAssigned ? "Added" : "Assign"} // change label
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
  },
  categoryImage: { width: "100%", height: "100%" },
  categoryName: { fontSize: 16, fontFamily: "Poppins", color: COLORS.gray },
  buttonContainer: {
    width: 75,
  },
});

export default AssignCardPreview;

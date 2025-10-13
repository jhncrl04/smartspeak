import COLORS from "@/constants/Colors";
import { useResponsiveCardSize } from "@/helper/setCardWidth";
import { Entypo } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AddChildModal from "./ui/AddChildModal";
import AddLearnerModal from "./ui/AddLearnerModal";

type screenType = "guardian" | "teacher";

type addLearnerProps = { screen: screenType };

const AddLearnerCard = (props: addLearnerProps) => {
  const { cardWidth, cardHeight } = useResponsiveCardSize();

  const styles = StyleSheet.create({
    cards: {
      height: cardHeight,
      width: cardWidth,
      backgroundColor: COLORS.cardBg,

      alignItems: "center",

      borderRadius: 5,
      elevation: 5,
      shadowColor: COLORS.black,
      shadowOffset: { width: 10, height: 10 },
      shadowRadius: 20,

      overflow: "hidden",
      justifyContent: "flex-start",
    },
    cardImageContainer: {
      width: cardWidth,
      aspectRatio: 1,

      backgroundColor: COLORS.shadow,

      justifyContent: "center",
      alignItems: "center",
    },
    cardImage: {
      width: "100%",
      height: "100%",
      color: COLORS.black,
      fontSize: 40,
    },
    addCardIcon: {
      width: "auto",
      height: "auto",
    },
    addCardLabel: {
      width: "100%",
      textAlign: "center",

      fontSize: 16,
      letterSpacing: 0.5,

      paddingVertical: 10,
    },
    cardInfoContainer: {
      flex: 1,
      width: "100%",
      backgroundColor: COLORS.white,
      justifyContent: "center",
      alignItems: "center",

      gap: 5,

      paddingVertical: 5,
      paddingHorizontal: 10,
    },
  });

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      {props.screen === "guardian" && (
        <AddChildModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      )}
      {props.screen === "teacher" && (
        <AddLearnerModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      )}
      <TouchableOpacity
        style={styles.cards}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.cardImageContainer}>
          <Entypo
            name="plus"
            size={24}
            style={[styles.cardImage, styles.addCardIcon]}
          />
        </View>
        <View style={styles.cardInfoContainer}>
          <Text style={styles.addCardLabel}>Add Learner</Text>
        </View>
      </TouchableOpacity>
    </>
  );
};

export default AddLearnerCard;

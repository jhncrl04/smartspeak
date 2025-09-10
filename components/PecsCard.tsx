import COLORS from "@/constants/Colors";
import { useResponsiveCardSize } from "@/helper/setCardWidth";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ViewCardModal from "./ui/ViewCardModal";

type actionType = "Unassign" | "Delete";

type CardProps = {
  learnerId?: string;
  action?: actionType;
  cardId: string;
  cardName: string;
  cardCategory: string;
  categoryColor: string;
  image: string;
};

const PecsCard = (props: CardProps) => {
  const { cardWidth } = useResponsiveCardSize();

  const styles = StyleSheet.create({
    pecsContainer: {
      borderRadius: 5,
      overflow: "hidden",
      width: cardWidth,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 10, height: 10 },
      shadowRadius: 20,
    },
    pecsImage: { width: cardWidth, height: cardWidth },
    pecsInfoContainer: {
      paddingVertical: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: props.categoryColor,
    },
    pecsName: {
      fontFamily: "Poppins",
      fontWeight: 500,
      fontSize: 16,

      color: COLORS.white,
      lineHeight: 17,
    },
    pecsCategory: { color: COLORS.semiWhite },
  });

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <ViewCardModal
        action={props.action as string}
        learnerId={props.learnerId as string}
        onClose={() => setModalVisible(false)}
        visible={modalVisible}
        cardId={props.cardId}
      />
      <TouchableOpacity
        style={styles.pecsContainer}
        onPress={() => setModalVisible(true)}
      >
        <Image style={styles.pecsImage} source={{ uri: props.image }} />
        <View style={styles.pecsInfoContainer}>
          <Text style={styles.pecsName}>{props.cardName}</Text>
          <Text style={styles.pecsCategory}>{props.cardCategory}</Text>
        </View>
      </TouchableOpacity>
    </>
  );
};

export default PecsCard;

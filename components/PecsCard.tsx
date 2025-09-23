import COLORS from "@/constants/Colors";
import getCurrentUid from "@/helper/getCurrentUid";
import { useResponsiveCardSize } from "@/helper/setCardWidth";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Octicons";
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
  isDisabled?: boolean;
  creatorId?: string;
};

const PecsCard = (props: CardProps) => {
  const { cardWidth } = useResponsiveCardSize();

  const styles = StyleSheet.create({
    lockIconContainer: {
      position: "absolute",
      top: 5,
      left: 5,
      zIndex: 1,

      justifyContent: "center",
      alignItems: "center",

      borderRadius: 8,

      height: 25,
      width: 25,
      backgroundColor: COLORS.semiWhite,
    },
    shadowWrapper: {
      borderRadius: 5,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 5,
    },
    pecsContainer: {
      borderRadius: 5,
      overflow: "hidden",
      backgroundColor: COLORS.white,
      width: cardWidth,
    },
    pecsImage: { width: cardWidth, height: cardWidth },
    pecsInfoContainer: {
      paddingVertical: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: props.categoryColor
        ? props.categoryColor
        : COLORS.successText,
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
  const uid = getCurrentUid();

  return (
    <>
      <ViewCardModal
        action={props.action as string}
        learnerId={props.learnerId as string}
        onClose={() => setModalVisible(false)}
        visible={modalVisible}
        cardId={props.cardId}
        isDisabled={props.isDisabled}
      />
      <View style={styles.shadowWrapper}>
        <TouchableOpacity
          style={styles.pecsContainer}
          onPress={() => setModalVisible(true)}
        >
          {props.creatorId !== uid && (
            <View style={styles.lockIconContainer}>
              <Icon name="lock" size={15} color={COLORS.black} />
            </View>
          )}
          <Image style={styles.pecsImage} source={{ uri: props.image }} />
          <View style={styles.pecsInfoContainer}>
            <Text style={styles.pecsName}>{props.cardName}</Text>
            <Text style={styles.pecsCategory}>{props.cardCategory}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default PecsCard;

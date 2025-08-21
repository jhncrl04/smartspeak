import COLORS from "@/constants/Colors";
import { useResponsiveCardSize } from "@/helper/setCardWidth";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Octicons";
import AddCategoryModal from "./ui/AddCategoryModal";
import AddPecsModal from "./ui/AddPecsModal";

const HORIZONTAL_PADDING = 70;
const COLUMN_GAP = 10;
const MIN_CARD_WIDTH = 100;

type CardProps = {
  cardType: string;
  onPress?: () => void;
};

const AddCard = (props: CardProps) => {
  const { cardWidth } = useResponsiveCardSize();

  const cardStyles = StyleSheet.create({
    pecsContainer: {
      borderRadius: 5,
      overflow: "hidden",
      width: cardWidth,
    },
    iconContainer: {
      justifyContent: "center",
      alignItems: "center",

      backgroundColor: COLORS.cardBg,
      width: cardWidth,
      height: cardWidth,
    },
    pecsInfoContainer: {
      paddingVertical: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: COLORS.gray,
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

  const boardIconSize = cardWidth * 0.3;

  const boardStyles = StyleSheet.create({
    boardContainer: {
      width: cardWidth,
      height: cardWidth * 0.9,
      position: "relative",

      justifyContent: "center",
      alignItems: "center",
    },
    folderIcon: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: [{ translateX: "-50%" }, { translateY: "-50%" }],
    },
    boardInfoContainer: {
      paddingTop: 30,
      justifyContent: "center",
      alignItems: "center",

      gap: 10,
    },
    boardIcon: {
      width: boardIconSize,
      height: boardIconSize,
    },
    boardName: {
      fontSize: 16,
      fontFamily: "Poppins",
      color: COLORS.white,

      width: "auto",
    },
  });

  const [pecsModalVisible, setPecsModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  return (
    <>
      <AddPecsModal
        visible={pecsModalVisible}
        onClose={() => setPecsModalVisible(false)}
      />
      <AddCategoryModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
      />
      {props.cardType === "card" && (
        <TouchableOpacity
          style={cardStyles.pecsContainer}
          onPress={() => setPecsModalVisible(true)}
        >
          <View style={cardStyles.iconContainer}>
            <Icon name="plus" size={50} color={COLORS.gray} />
          </View>
          <View style={cardStyles.pecsInfoContainer}>
            <Text style={cardStyles.pecsName}>Add Card</Text>
            <Text style={cardStyles.pecsCategory}>Category</Text>
          </View>
        </TouchableOpacity>
      )}
      {props.cardType === "board" && (
        <TouchableOpacity
          style={boardStyles.boardContainer}
          onPress={() => setCategoryModalVisible(true)}
        >
          <Icon
            style={boardStyles.folderIcon}
            name={"file-directory"}
            size={cardWidth}
            color={COLORS.gray}
          />
          <View style={boardStyles.boardInfoContainer}>
            <Icon name="plus" size={50} color={COLORS.white} />
            <Text style={boardStyles.boardName}>Add Board</Text>
          </View>
        </TouchableOpacity>
      )}
    </>
  );
};

export default AddCard;

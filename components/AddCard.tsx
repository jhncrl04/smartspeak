import COLORS from "@/constants/Colors";
import { useSidebarWidth } from "@/context/sidebarContext";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Octicons";
import AddPecsModal from "./ui/AddPecsModal";

const HORIZONTAL_PADDING = 70;
const COLUMN_GAP = 30;
const MIN_CARD_WIDTH = 100;

type CardProps = {
  cardType: string;
  onPress?: () => void;
};

const AddCard = (props: CardProps) => {
  const { width } = useWindowDimensions();
  const { width: sidebarWidth } = useSidebarWidth();

  const SidebarWidthInPixel =
    typeof sidebarWidth === "number" ? sidebarWidth : width * 0.25;

  const availableWidth = width - (HORIZONTAL_PADDING + SidebarWidthInPixel);

  // Add a check for sidebar width then decrease it to the available width
  let cardWidth: number = 200;
  let colCount: number =
    (availableWidth + COLUMN_GAP) / (cardWidth + COLUMN_GAP);
  colCount = Math.ceil(colCount);

  let totalGapSpace = (colCount - 1) * COLUMN_GAP;

  // dynamically setting the card width acccording to screen size
  cardWidth = (availableWidth - totalGapSpace) / colCount;

  if (cardWidth < MIN_CARD_WIDTH) {
    cardWidth = availableWidth;
  }

  const cardStyles = StyleSheet.create({
    pecsContainer: {
      borderRadius: 10,
      overflow: "hidden",
      width: cardWidth,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 10, height: 10 },
      shadowRadius: 20,
    },
    iconContainer: {
      justifyContent: "center",
      alignItems: "center",

      backgroundColor: COLORS.cardBg,
      width: cardWidth,
      height: cardWidth,
    },
    pecsInfoContainer: {
      paddingVertical: 15,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: COLORS.gray,
    },
    pecsName: {
      fontFamily: "Poppins",
      fontWeight: 500,
      fontSize: 18,

      color: COLORS.white,
      lineHeight: 18,
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

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <AddPecsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
      {props.cardType === "card" && (
        <TouchableOpacity
          style={cardStyles.pecsContainer}
          onPress={() => setModalVisible(true)}
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
        <View style={boardStyles.boardContainer}>
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
        </View>
      )}
    </>
  );
};

export default AddCard;

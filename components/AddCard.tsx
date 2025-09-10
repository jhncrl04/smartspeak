import COLORS from "@/constants/Colors";
import { useResponsiveCardSize } from "@/helper/setCardWidth";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Octicons";
import AddCategoryModal from "./ui/AddCategoryModal";
import AddPecsModal from "./ui/AddPecsModal";
import AssignCardModal from "./ui/AssignCardModal";
import AssignCategoryModal from "./ui/AssignCategoryModal";

type CardProps = {
  cardType: "card" | "board";
  action: "add" | "assign";
  onPress?: () => void;
  learnerId?: string;
  categoryId?: string;
};

const AddCard = (props: CardProps) => {
  const { cardWidth } = useResponsiveCardSize();

  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const renderModal = () => {
    if (!modalVisible) return null;

    if (props.cardType === "card" && props.action === "add") {
      return (
        <AddPecsModal
          visible={modalVisible}
          onClose={closeModal}
          categoryId={props.categoryId}
        />
      );
    }

    if (props.cardType === "card" && props.action === "assign") {
      return (
        <AssignCardModal
          visible={modalVisible}
          onClose={closeModal}
          learnerId={props.learnerId}
          categoryId={props.categoryId}
        />
      );
    }

    if (props.cardType === "board" && props.action === "add") {
      return <AddCategoryModal visible={modalVisible} onClose={closeModal} />;
    }

    if (props.cardType === "board" && props.action === "assign") {
      return (
        <AssignCategoryModal
          visible={modalVisible}
          onClose={closeModal}
          learnerId={props.learnerId}
        />
      );
    }

    return null;
  };

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
      fontWeight: "500",
      fontSize: 16,
      color: COLORS.white,
      lineHeight: 17,
    },
    pecsCategory: { color: COLORS.semiWhite },
  });

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
      transform: [
        { translateX: -cardWidth / 2 },
        { translateY: -cardWidth / 2 },
      ],
    },
    boardInfoContainer: {
      paddingTop: 20,
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
    },
    boardName: {
      fontSize: 14,
      fontFamily: "Poppins",
      color: COLORS.white,
      width: "auto",
    },
  });

  return (
    <>
      {/* ✅ Only the correct modal shows */}
      {renderModal()}

      <TouchableOpacity
        style={
          props.cardType === "card"
            ? cardStyles.pecsContainer
            : boardStyles.boardContainer
        }
        onPress={handlePress}
      >
        {props.cardType === "card" ? (
          <>
            <View style={cardStyles.iconContainer}>
              <Icon name="plus" size={50} color={COLORS.gray} />
            </View>
            <View style={cardStyles.pecsInfoContainer}>
              <Text style={cardStyles.pecsName}>
                {props.action === "add" ? "Add Card" : "Assign Card"}
              </Text>
              <Text style={cardStyles.pecsCategory}>Category</Text>
            </View>
          </>
        ) : (
          <>
            <Icon
              style={boardStyles.folderIcon}
              name="file-directory"
              size={cardWidth}
              color={COLORS.gray}
            />
            <View style={boardStyles.boardInfoContainer}>
              <Icon name="plus" size={40} color={COLORS.white} />
              <Text style={boardStyles.boardName}>
                {props.action === "add" ? "Add Category" : "Assign Category"}
              </Text>
            </View>
          </>
        )}
      </TouchableOpacity>
    </>
  );
};

export default AddCard;

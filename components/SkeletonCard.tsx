import COLORS from "@/constants/Colors";
import { useResponsiveCardSize } from "@/helper/setCardWidth";
import React from "react";
import { StyleSheet, View } from "react-native";
import Icon from "react-native-vector-icons/Octicons";

type SkeletonType = "pecs" | "learner" | "board";

const SkeletonCard = ({ type }: { type: SkeletonType }) => {
  const { cardWidth, cardHeight } = useResponsiveCardSize();

  const sharedStyles = StyleSheet.create({
    container: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 15,
      justifyContent: "flex-start",
    },
  });

  // ===== LEARNER CARD =====
  const learnerCardStyles = StyleSheet.create({
    cards: {
      height: cardHeight,
      width: cardWidth,
      backgroundColor: COLORS.pureWhite,
      alignItems: "center",
      borderRadius: 10,
      elevation: 5,
      shadowColor: COLORS.black,
      shadowOffset: { width: 10, height: 10 },
      shadowRadius: 20,
      overflow: "hidden",
    },
    cardImageContainer: {
      width: cardWidth,
      aspectRatio: 1,
      padding: 4,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f5f5f5",
    },
    cardImage: {
      width: "100%",
      height: "100%",
      borderRadius: 8,
      backgroundColor: "#e8e8e8",
    },
    cardInfoContainer: {
      flex: 1,
      width: "100%",
      justifyContent: "center",
      alignItems: "flex-start",
      paddingVertical: 20,
      paddingHorizontal: 10,
    },
    nameLine: {
      width: "70%",
      height: 14,
      borderRadius: 4,
      marginBottom: 6,
      backgroundColor: "#e8e8e8",
    },
    smallLine: {
      width: "50%",
      height: 12,
      borderRadius: 4,
      backgroundColor: "#e8e8e8",
    },
  });

  const learnerSkeleton = (
    <View style={sharedStyles.container}>
      {[...Array(5)].map((_, i) => (
        <View key={i} style={learnerCardStyles.cards}>
          <View style={learnerCardStyles.cardImageContainer}>
            <View style={learnerCardStyles.cardImage} />
          </View>
          <View style={learnerCardStyles.cardInfoContainer}>
            <View style={learnerCardStyles.nameLine} />
            <View style={learnerCardStyles.smallLine} />
          </View>
        </View>
      ))}
    </View>
  );

  // ===== PECS CARD =====
  const pecsStyles = StyleSheet.create({
    shadowWrapper: {
      height: cardHeight,
      width: cardWidth,
      borderRadius: 5,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 5,
      backgroundColor: COLORS.pureWhite,
    },
    pecsContainer: {
      borderRadius: 5,
      overflow: "hidden",
      backgroundColor: COLORS.pureWhite,
      width: cardWidth,
    },
    pecsImage: {
      width: cardWidth,
      height: cardWidth,
      backgroundColor: "#e8e8e8",
    },
    pecsInfoContainer: {
      paddingVertical: 10,
      paddingHorizontal: 5,
      justifyContent: "center",
      alignItems: "center",
    },
    pecsName: {
      width: "70%",
      height: 14,
      borderRadius: 4,
      marginBottom: 6,
      backgroundColor: "#e8e8e8",
    },
    pecsCategory: {
      width: "50%",
      height: 12,
      borderRadius: 4,
      backgroundColor: "#e8e8e8",
    },
  });

  const pecsSkeleton = (
    <View style={sharedStyles.container}>
      {[...Array(5)].map((_, i) => (
        <View key={i} style={pecsStyles.shadowWrapper}>
          <View style={pecsStyles.pecsContainer}>
            <View style={pecsStyles.pecsImage} />
            <View style={pecsStyles.pecsInfoContainer}>
              <View style={pecsStyles.pecsName} />
              <View style={pecsStyles.pecsCategory} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  // ===== BOARD CARD =====
  const boardIconSize = cardWidth * 0.3;
  const boardStyles = StyleSheet.create({
    boardContainer: {
      width: cardWidth,
      height: cardWidth * 0.9,
      justifyContent: "center",
      alignItems: "center",
    },
    folderIcon: {
      position: "absolute",
    },
    boardInfoContainer: {
      paddingTop: 30,
      justifyContent: "center",
      alignItems: "center",
    },
    boardIcon: {
      width: boardIconSize,
      height: boardIconSize,
      borderRadius: 5,
      backgroundColor: "#e8e8e8",
    },
    boardName: {
      width: 75,
      height: 14,
      borderRadius: 4,
      marginTop: 4,
      marginBottom: 6,
      backgroundColor: "#e8e8e8",
    },
    creatorName: {
      width: "90%",
      height: 12,
      borderRadius: 4,
      backgroundColor: "#e8e8e8",
    },
  });

  const boardSkeleton = (
    <View style={sharedStyles.container}>
      {[...Array(5)].map((_, i) => (
        <View key={i} style={boardStyles.boardContainer}>
          <Icon
            style={boardStyles.folderIcon}
            name="file-directory"
            size={cardWidth}
            color={COLORS.lightGray}
          />
          <View style={boardStyles.boardInfoContainer}>
            <View style={boardStyles.boardIcon} />
            <View style={boardStyles.boardName} />
            <View style={boardStyles.creatorName} />
          </View>
        </View>
      ))}
    </View>
  );

  switch (type) {
    case "learner":
      return learnerSkeleton;
    case "pecs":
      return pecsSkeleton;
    case "board":
      return boardSkeleton;
    default:
      return null;
  }
};

export default SkeletonCard;

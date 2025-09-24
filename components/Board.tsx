import COLORS from "@/constants/Colors";
import getCurrentUid from "@/helper/getCurrentUid";
import { useResponsiveCardSize } from "@/helper/setCardWidth";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Octicons";

type boardProp = {
  categoryId: string;
  image: string;
  boardName: string;
  boardBackground: string;
  actionHandler: () => void;
  creatorName?: string;
  creatorId?: string;
};

const Board = (props: boardProp) => {
  const { cardWidth } = useResponsiveCardSize();

  const boardIconSize = cardWidth * 0.3;

  const styles = StyleSheet.create({
    boardContainer: {
      width: cardWidth,
      height: cardWidth * 0.9,
      position: "relative",
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
      gap: 0,
      paddingHorizontal: 5, // prevents text clipping
    },
    boardIcon: {
      width: boardIconSize,
      height: boardIconSize,
      borderRadius: 5,
    },
    boardName: {
      fontSize: 14,
      lineHeight: 18,
      textAlign: "center",
      fontFamily: "Poppins",
      color: COLORS.white,
    },
    creatorName: {
      fontSize: 12,
      textAlign: "center",
      fontFamily: "Poppins",
      color: COLORS.semiWhite,
    },
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
  });

  const uid = getCurrentUid();

  return (
    <TouchableOpacity
      style={styles.boardContainer}
      onPress={props.actionHandler}
    >
      {props.creatorId !== uid && (
        <View style={styles.lockIconContainer}>
          <Icon name="lock" size={15} color={COLORS.black} />
        </View>
      )}
      <Icon
        style={styles.folderIcon}
        name={"file-directory"}
        size={cardWidth}
        color={
          props.boardBackground ? props.boardBackground : COLORS.successText
        }
      />
      <View style={styles.boardInfoContainer}>
        <Image
          style={styles.boardIcon}
          source={
            props.image
              ? { uri: props.image }
              : require("@/assets/images/pecs1.png")
          }
        />
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.boardName}>
          {props.boardName}
        </Text>
        <Text style={styles.creatorName}>
          {props.creatorName ? `by  ${props.creatorName}` : "System Default"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default Board;

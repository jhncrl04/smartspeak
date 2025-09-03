import COLORS from "@/constants/Colors";
import { useResponsiveCardSize } from "@/helper/setCardWidth";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Octicons";

type boardProp = {
  categoryId: string;
  image: string;
  boardName: string;
  boardBackground: string;
  actionHandler: () => void;
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

  return (
    <TouchableOpacity
      style={styles.boardContainer}
      onPress={props.actionHandler}
    >
      <Icon
        style={styles.folderIcon}
        name={"file-directory"}
        size={cardWidth}
        color={props.boardBackground}
      />
      <View style={styles.boardInfoContainer}>
        <Image style={styles.boardIcon} source={{ uri: props.image }} />
        <Text style={styles.boardName}>{props.boardName}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default Board;

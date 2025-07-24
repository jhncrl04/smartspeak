import COLORS from "@/constants/Colors";
import { useSidebarWidth } from "@/context/sidebarContext";
import {
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Octicons";

const HORIZONTAL_PADDING = 70;
const COLUMN_GAP = 30;
const MIN_CARD_WIDTH = 100;

type boardProp = { boardName: string; boardBackground: string };

const Board = (props: boardProp) => {
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
    <View style={styles.boardContainer}>
      <Icon
        style={styles.folderIcon}
        name={"file-directory"}
        size={cardWidth}
        color={props.boardBackground}
      />
      <View style={styles.boardInfoContainer}>
        <Image
          style={styles.boardIcon}
          source={require("../assets/images/creeper.png")}
        />
        <Text style={styles.boardName}>{props.boardName}</Text>
      </View>
    </View>
  );
};

export default Board;

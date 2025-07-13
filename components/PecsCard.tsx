import COLORS from "@/constants/Colors";
import { useSidebarWidth } from "@/context/sidebarContext";
import {
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const HORIZONTAL_PADDING = 70;
const COLUMN_GAP = 30;
const MIN_CARD_WIDTH = 100;

type CardProps = {
  cardName: string;
  cardCategory: string;
  categoryColor: string;
};

const PecsCard = (props: CardProps) => {
  const { width } = useWindowDimensions();
  const { width: sidebarWidth } = useSidebarWidth();

  const SidebarWidthInPixel =
    typeof sidebarWidth === "number" ? sidebarWidth : width * 0.2;

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

  const styles = StyleSheet.create({
    pecsContainer: {
      borderRadius: 10,
      overflow: "hidden",
      width: cardWidth,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 10, height: 10 },
      shadowRadius: 20,
    },
    pecsImage: { width: cardWidth, height: cardWidth },
    pecsInfoContainer: {
      paddingVertical: 15,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: props.categoryColor,
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

  return (
    <View style={styles.pecsContainer}>
      <Image
        style={styles.pecsImage}
        source={require("../assets/images/creeper.png")}
      />
      <View style={styles.pecsInfoContainer}>
        <Text style={styles.pecsName}>{props.cardName}</Text>
        <Text style={styles.pecsCategory}>{props.cardCategory}</Text>
      </View>
    </View>
  );
};

export default PecsCard;

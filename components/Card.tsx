import COLORS from "@/constants/Colors";
import { useSidebarWidth } from "@/context/sidebarContext";
import { Entypo } from "@expo/vector-icons";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

type profile = { cardType: string; name: string; age: number; gender: string };

const HORIZONTAL_PADDING = 60;
const COLUMN_GAP = 20;
const MIN_CARD_WIDTH = 100;

const Card = (props: profile) => {
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

  // setting the card height to a specific aspect ratio (40% longer than the width)
  let cardHeight: number = cardWidth + cardWidth * 0.4;

  const styles = StyleSheet.create({
    cards: {
      height: cardHeight,
      width: cardWidth,
      backgroundColor: COLORS.cardBg,

      alignItems: "center",

      borderRadius: 5,
      elevation: 5,

      shadowColor: COLORS.shadow,
      shadowOffset: { width: 10, height: 10 },
      shadowRadius: 20,

      overflow: "hidden",
      justifyContent: "flex-start",
    },
    cardImageContainer: {
      width: cardWidth,
      aspectRatio: 1,

      backgroundColor: COLORS.shadow,

      justifyContent: "center",
      alignItems: "center",
    },
    cardImage: {
      width: "100%",
      height: "100%",
      color: COLORS.black,
      fontSize: 40,
    },
    addCardIcon: {
      width: "auto",
      height: "auto",
    },
    addCardLabel: {
      width: "100%",
      textAlign: "center",

      fontSize: 16,
      letterSpacing: 0.5,

      paddingVertical: 10,
    },
    cardInfoContainer: {
      flex: 1,
      width: "100%",
      backgroundColor: COLORS.white,
      justifyContent: "center",
      alignItems: "center",

      gap: 5,

      paddingVertical: 5,
      paddingHorizontal: 10,
    },
    labelContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",

      width: "100%",
    },
    cardLabels: {
      flexShrink: 0,
      textAlign: "left",
      fontSize: 12,

      width: "35%",

      color: COLORS.gray,
    },
    profileInfo: {
      flexShrink: 0,

      width: "65%",

      fontSize: 16,
      color: COLORS.black,

      textAlign: "left",
    },
  });

  return props.cardType === "profile" ? (
    <TouchableOpacity style={styles.cards}>
      <View style={styles.cardImageContainer}>
        <Image
          source={require("../assets/images/creeper.png")}
          style={styles.cardImage}
        />
      </View>
      <View style={styles.cardInfoContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.cardLabels}>Name</Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.profileInfo}
          >
            {props.name}
          </Text>
        </View>
        <View style={styles.labelContainer}>
          <Text style={styles.cardLabels}>Age</Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.profileInfo}
          >
            {props.age.toString()}
          </Text>
        </View>
        <View style={styles.labelContainer}>
          <Text style={styles.cardLabels}>Gender</Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.profileInfo}
          >
            {props.gender}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity style={styles.cards}>
      <View style={styles.cardImageContainer}>
        <Entypo
          name="plus"
          size={24}
          style={[styles.cardImage, styles.addCardIcon]}
        />
      </View>
      <View style={styles.cardInfoContainer}>
        <Text style={styles.addCardLabel}>Add Learner</Text>
      </View>
    </TouchableOpacity>
  );
};

export default Card;

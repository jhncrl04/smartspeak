import COLORS from "@/constants/Colors";
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

const HORIZONTAL_PADDING = 20;
const COLUMN_GAP = 30;
const MIN_CARD_WIDTH = 100;

const Card = (props: profile) => {
  const { width } = useWindowDimensions();
  const availableWidth = width - HORIZONTAL_PADDING;

  let cardWidth: number = 200;
  let colCount: number =
    (availableWidth + COLUMN_GAP) / (cardWidth + COLUMN_GAP);
  colCount = Math.ceil(colCount);

  let totalGapSpace = (colCount - 1) * COLUMN_GAP;

  // dynamically setting the card width if screen is too small
  cardWidth = (availableWidth - totalGapSpace) / colCount;

  if (cardWidth < MIN_CARD_WIDTH) {
    cardWidth = availableWidth;
  }

  let cardHeight: number = cardWidth + cardWidth * 0.4;

  const styles = StyleSheet.create({
    cards: {
      height: cardHeight,
      width: cardWidth,
      backgroundColor: COLORS.pureWhite,

      justifyContent: "center",
      alignItems: "center",

      borderRadius: 5,
      elevation: 5,

      shadowColor: COLORS.shadow,
      shadowOffset: { width: 10, height: 10 },
      shadowRadius: 20,

      overflow: "hidden",
    },
    cardImageContainer: {
      width: cardWidth,
      height: cardWidth,

      backgroundColor: COLORS.shadow,

      justifyContent: "center",
      alignItems: "center",
    },
    cardImage: {
      width: "100%",
      height: "100%",
      color: COLORS.black,
      fontSize: 40,

      objectFit: "cover",
    },
    addCardIcon: {
      width: "auto",
      height: "auto",
    },
    addCardLabel: {
      width: "100%",
      textAlign: "center",

      backgroundColor: COLORS.pureWhite,
      fontSize: 16,
      letterSpacing: 0.5,

      paddingVertical: 10,
    },
    cardInfoContainer: {
      justifyContent: "center",
      alignItems: "center",

      width: "100%",

      flexGrow: 1,
      paddingVertical: 10,
      paddingHorizontal: 20,
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

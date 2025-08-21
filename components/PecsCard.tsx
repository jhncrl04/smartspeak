import COLORS from "@/constants/Colors";
import { useResponsiveCardSize } from "@/helper/setCardWidth";
import { Image, StyleSheet, Text, View } from "react-native";

type CardProps = {
  cardName: string;
  cardCategory: string;
  categoryColor: string;
};

const PecsCard = (props: CardProps) => {
  const { cardWidth } = useResponsiveCardSize();

  const styles = StyleSheet.create({
    pecsContainer: {
      borderRadius: 5,
      overflow: "hidden",
      width: cardWidth,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 10, height: 10 },
      shadowRadius: 20,
    },
    pecsImage: { width: cardWidth, height: cardWidth },
    pecsInfoContainer: {
      paddingVertical: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: props.categoryColor,
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

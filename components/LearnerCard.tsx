import COLORS from "@/constants/Colors";
import { useResponsiveCardSize } from "@/helper/setCardWidth";
import { Entypo } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type cardType = "profile" | "add card";

type profile = {
  cardType: cardType;
  name: string;
  age: number;
  gender: string;
  learnerId: string;
  image: string | null;
};

const LearnerCard = (props: profile) => {
  const { cardWidth, cardHeight } = useResponsiveCardSize();

  const styles = StyleSheet.create({
    cards: {
      height: cardHeight,
      width: cardWidth,
      backgroundColor: COLORS.cardBg,

      alignItems: "center",

      borderRadius: 5,
      elevation: 5,
      shadowColor: COLORS.black,
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
    },
    cardLabels: {
      flex: 1,

      fontSize: 12,

      color: COLORS.gray,
    },
    profileInfo: {
      flex: 1,

      fontSize: 14,
      color: COLORS.black,

      textAlign: "left",
    },
  });

  console.log(props);

  return props.cardType === "profile" ? (
    <TouchableOpacity
      style={styles.cards}
      onPress={() => {
        router.push(`../screens/teacher/user/${props.learnerId}` as any);
      }}
    >
      <View style={styles.cardImageContainer}>
        <Image
          source={
            props.image
              ? { uri: props.image }
              : require("../assets/images/creeper.png")
          }
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
        {/* <View style={styles.labelContainer}>
          <Text style={styles.cardLabels}>Age</Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.profileInfo}
          >
            {props.age.toString()}
          </Text>
        </View> */}
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
    <>
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
    </>
  );
};

export default LearnerCard;

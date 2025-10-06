import COLORS from "@/constants/Colors";
import { useResponsiveCardSize } from "@/helper/setCardWidth";
import { useAuthStore } from "@/stores/userAuthStore";
import { useUsersStore } from "@/stores/userStore";
import { Entypo } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type cardType = "profile" | "add card";

type profile = {
  cardType: cardType;
  learnerId: string;
  onSection?: string;
};

const LearnerCard = ({ cardType, learnerId, onSection }: profile) => {
  const { cardWidth, cardHeight } = useResponsiveCardSize();

  const user = useAuthStore((state) => state.user);

  const users = useUsersStore((state) => state.users);

  const learner = users.find((user) => user.id === learnerId);

  const styles = StyleSheet.create({
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
      justifyContent: "flex-start",
    },
    cardImageContainer: {
      width: cardWidth,
      aspectRatio: 1,

      padding: 4,

      justifyContent: "center",
      alignItems: "center",
    },
    cardImage: {
      width: "100%",
      height: "100%",

      borderRadius: 8,

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
      justifyContent: "center",
      alignItems: "center",

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

      fontSize: 12,
      fontFamily: "Poppins",

      color: COLORS.gray,

      textAlign: "left",
    },
    profileName: {
      fontSize: 15,
      lineHeight: 18,

      fontWeight: 500,

      color: COLORS.black,
    },
  });

  return cardType === "profile" ? (
    <TouchableOpacity
      style={styles.cards}
      onPress={() => {
        router.push({
          pathname:
            user?.role.toLowerCase() === "guardian"
              ? `/screens/guardian/user/[userId]`
              : "/screens/teacher/user/[userId]",
          params: {
            userId: learnerId,
            sectionId: onSection,
          },
        });
      }}
    >
      <View style={styles.cardImageContainer}>
        <Image
          source={
            learner?.profile_pic
              ? { uri: learner?.profile_pic }
              : require("@/assets/images/default.jpg")
          }
          style={styles.cardImage}
        />
      </View>
      <View style={styles.cardInfoContainer}>
        <View style={styles.labelContainer}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.profileInfo, styles.profileName]}
          >
            {`${learner?.first_name} ${learner?.last_name}`}
          </Text>
        </View>
        <View style={styles.labelContainer}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.profileInfo}
          >
            {learner?.gender ?? "n/a"}
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

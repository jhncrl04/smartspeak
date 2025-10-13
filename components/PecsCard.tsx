import COLORS from "@/constants/Colors";
import getCurrentUid from "@/helper/getCurrentUid";
import { useResponsiveCardSize } from "@/helper/setCardWidth";
import { useCardsStore } from "@/stores/cardsStore";
import { useCategoriesStore } from "@/stores/categoriesStores";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Octicons";
import ViewCardModal from "./ui/ViewCardModal";

type actionType = "Unassign" | "Delete";

type CardProps = {
  learnerId?: string;
  action?: actionType;
  cardId: string;
};

const PecsCard = ({ learnerId, action, cardId }: CardProps) => {
  const { cardWidth } = useResponsiveCardSize();
  const uid = getCurrentUid();

  const card = useCardsStore((state) =>
    state.cards.find((c) => c.id === cardId)
  );
  const { categories } = useCategoriesStore();

  const category = categories.find((category) => {
    if (
      card?.created_by === "ADMIN" &&
      card.category_name === category.category_name
    )
      return category;

    if (category.id === card?.category_id) return category;
  });

  const styles = StyleSheet.create({
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
    shadowWrapper: {
      borderRadius: 5,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 5,
    },
    pecsContainer: {
      borderRadius: 5,
      overflow: "hidden",
      backgroundColor: COLORS.white,
      width: cardWidth,
    },
    pecsImage: { width: cardWidth, height: cardWidth },
    pecsInfoContainer: {
      paddingVertical: 10,
      paddingHorizontal: 5,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: category?.background_color
        ? category?.background_color
        : COLORS.successText,
    },
    pecsName: {
      fontFamily: "Poppins",
      fontWeight: 500,
      fontSize: 14,

      color: COLORS.white,
      lineHeight: 17,
    },
    pecsCategory: { color: COLORS.semiWhite },
  });

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <ViewCardModal
        action={action!}
        learnerId={learnerId!}
        onClose={() => setModalVisible(false)}
        visible={modalVisible}
        cardId={cardId}
      />
      <View style={styles.shadowWrapper}>
        <TouchableOpacity
          style={styles.pecsContainer}
          onPress={() => setModalVisible(true)}
        >
          {card?.created_by !== uid && (
            <View style={styles.lockIconContainer}>
              <Icon name="lock" size={15} color={COLORS.black} />
            </View>
          )}
          <Image style={styles.pecsImage} source={{ uri: card?.image }} />
          <View style={styles.pecsInfoContainer}>
            <Text
              style={styles.pecsName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {card?.card_name}
            </Text>
            <Text style={styles.pecsCategory}>{category?.category_name}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default PecsCard;

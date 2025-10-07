import COLORS from "@/constants/Colors";
import getCurrentUid from "@/helper/getCurrentUid";
import { useResponsiveCardSize } from "@/helper/setCardWidth";
import { useCategoriesStore } from "@/stores/categoriesStores";
import { useUsersStore } from "@/stores/userStore";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Octicons";

type boardProp = {
  categoryId: string;
  routerHandler: () => void;
};

const Board = ({ categoryId, routerHandler }: boardProp) => {
  const { categories } = useCategoriesStore();
  const { users } = useUsersStore();

  const category = categories.find((cat) => cat.id === categoryId);

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

  const creatorName = () => {
    if (!category) return "Unknown";

    if (category.creator_name) {
      return `by ${category.creator_name}`;
    }

    // Fallback for admin categories
    if (category.created_by_role === "ADMIN") {
      return "System Default";
    }

    // If it's the current user's category
    if (category.created_by === uid) {
      return "by You";
    }

    // Generic fallback
    return "Shared Category";
  };

  return (
    <TouchableOpacity style={styles.boardContainer} onPress={routerHandler}>
      {category?.created_by !== uid && (
        <View style={styles.lockIconContainer}>
          <Icon name="lock" size={15} color={COLORS.black} />
        </View>
      )}
      <Icon
        style={styles.folderIcon}
        name={"file-directory"}
        size={cardWidth}
        color={category?.background_color ?? COLORS.successText}
      />
      <View style={styles.boardInfoContainer}>
        <Image
          style={styles.boardIcon}
          source={
            category?.image
              ? { uri: category?.image }
              : require("@/assets/images/pecs1.png")
          }
        />
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.boardName}>
          {category?.category_name}
        </Text>
        <Text style={styles.creatorName}>{creatorName()}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default Board;

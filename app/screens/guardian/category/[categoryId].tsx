import ActionLink from "@/components/ActionLink";
import FabMenu from "@/components/FabMenu";
import PageHeader from "@/components/PageHeader";
import PecsCard from "@/components/PecsCard";
import Sidebar from "@/components/Sidebar";
import SkeletonCard from "@/components/SkeletonCard";
import AddPecsModal from "@/components/ui/AddPecsModal";
import EditCategoryModal from "@/components/ui/EditCategoryModal";
import COLORS from "@/constants/Colors";
import getCurrentUid from "@/helper/getCurrentUid";
import { useCardsStore } from "@/stores/cardsStore";
import { useCategoriesStore } from "@/stores/categoriesStores";
import { useUsersStore } from "@/stores/userStore";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, View } from "react-native";

import Icon from "react-native-vector-icons/Octicons";

const ManageThisCategoryScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const { users } = useUsersStore();
  const { cards } = useCardsStore();
  const { categories } = useCategoriesStore();

  const { categoryId, creatorId } = useLocalSearchParams();

  const uid = getCurrentUid();

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScreenLoading, setIsScreenLoading] = useState(true);

  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | undefined>("");

  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isScreenLoading ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isScreenLoading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsScreenLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const activeCategory = categories.find((category) => {
    if (category.id === categoryId) return category;
  });

  const filteredCards = cards
    .filter((card) => {
      const isAdminCard =
        card.created_by === "ADMIN" &&
        card.category_name === activeCategory?.category_name;

      const isUserCard = card.category_id === categoryId;

      return isAdminCard || isUserCard;
    })
    .sort((a, b) => {
      return a.card_name.localeCompare(b.card_name);
    });

  const [activeModal, setActiveModal] = useState<
    "add-card" | "edit-category" | null
  >(null);

  const handleSearch = (query: string) => {
    setSearching(true);
    setSearchQuery(query);

    setTimeout(() => {
      setSearching(false);
    }, 1000);
  };

  return (
    <>
      <EditCategoryModal
        visible={activeModal === "edit-category"}
        onClose={() => setActiveModal(null)}
        categoryId={categoryId as string}
      />
      <AddPecsModal
        visible={activeModal === "add-card"}
        categoryId={categoryId as string}
        onClose={() => setActiveModal(null)}
      />
      <View style={styles.container}>
        <Sidebar userRole="teacher" onNavigate={handleNavigation} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.mainContentContainer}>
            <View style={styles.header}>
              <View>
                {creatorId !== uid && (
                  <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                      This are view only card. Editing and deleting is disabled.
                    </Text>
                  </View>
                )}

                <ActionLink
                  text="Return"
                  clickHandler={router.back}
                  icon={
                    <Icon name="arrow-left" size={22} color={COLORS.accent} />
                  }
                />
              </View>
              <PageHeader
                collectionToSearch="cards"
                onSearch={() => {}}
                query="card"
                pageTitle={`${activeCategory?.category_name} Cards`}
                hasFilter={true}
                searchPlaceholder="Search Card"
              />
            </View>

            <View style={styles.cardContainer}>
              {isScreenLoading || searching ? (
                <SkeletonCard type="pecs" />
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : filteredCards.length === 0 ? ( // ✅ Fixed condition
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No cards found in this category.
                  </Text>
                </View>
              ) : (
                filteredCards.map((card) => (
                  <PecsCard action="Delete" cardId={card.id} key={card.id} />
                ))
              )}
            </View>
          </View>
        </ScrollView>
        {uid === (creatorId as string) && (
          <FabMenu
            page="specificBoards"
            actions={{
              add_card: () => setActiveModal("add-card"),
              edit_category: () => setActiveModal("edit-category"),
            }}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  warningBox: {
    backgroundColor: COLORS.errorBg,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.errorText,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  warningText: {
    color: COLORS.errorText,
    fontWeight: "600",
    fontSize: 14,
  },

  container: {
    flex: 1,

    flexDirection: "row",

    gap: 10,
  },
  sidebar: {
    flex: 1,
    backgroundColor: "#eee",
  },
  header: {},
  actionLinkContainer: {
    flexDirection: "row",
    gap: 20,
    width: 50,
  },
  mainContentContainer: {
    flex: 1,

    gap: 10,

    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  cardContainer: {
    flex: 1,
    flexWrap: "wrap",
    flexDirection: "row",

    alignItems: "center",

    paddingVertical: 10,

    gap: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontFamily: "Poppins",
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.errorText,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "Poppins",
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gray,
  },
});

export default ManageThisCategoryScreen;

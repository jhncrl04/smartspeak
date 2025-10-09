import ActionLink from "@/components/ActionLink";
import FabMenu from "@/components/FabMenu";
import PageHeader from "@/components/PageHeader";
import PecsCard from "@/components/PecsCard";
import Sidebar from "@/components/Sidebar";
import AddPecsModal from "@/components/ui/AddPecsModal";
import EditCategoryModal from "@/components/ui/EditCategoryModal";
import COLORS from "@/constants/Colors";
import getCurrentUid from "@/helper/getCurrentUid";
import { useCardsStore } from "@/stores/cardsStore";
import { useCategoriesStore } from "@/stores/categoriesStores";
import { useUsersStore } from "@/stores/userStore";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

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
  const [error, setError] = useState<string | undefined>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const activeCategory = categories.find((category) => {
    if (category.id === categoryId) return category;
  });

  const filteredCards = cards.filter((card) => {
    if (
      (card.created_by === "ADMIN" &&
        card.category_name === activeCategory?.category_name) ||
      card.category_id === (categoryId as string)
    )
      return card;
  });

  const [activeModal, setActiveModal] = useState<
    "add-card" | "edit-category" | null
  >(null);

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
        <ScrollView>
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
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.black} />
                  <Text>Loading cards...</Text>
                </View>
              ) : error ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins",
                      fontSize: 16,
                      fontWeight: 600,

                      color: COLORS.errorText,
                    }}
                  >
                    {error}
                  </Text>
                </View>
              ) : filteredCards.length >= 0 ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins",
                      fontSize: 16,
                      fontWeight: 600,

                      color: COLORS.gray,
                    }}
                  >
                    No cards found in this category.
                  </Text>
                </View>
              ) : (
                filteredCards.map((card, index) => (
                  <PecsCard action="Delete" cardId={card.id} key={index} />
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
});

export default ManageThisCategoryScreen;

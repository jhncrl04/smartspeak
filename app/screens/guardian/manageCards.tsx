import FabMenu from "@/components/FabMenu";
import PageHeader from "@/components/PageHeader";
import PecsCard from "@/components/PecsCard";
import Sidebar from "@/components/Sidebar";
import AddPecsModal from "@/components/ui/AddPecsModal";
import COLORS from "@/constants/Colors";
import { useCardsStore } from "@/stores/cardsStore";
import { useCategoriesStore } from "@/stores/categoriesStores";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const ManageCardsScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const { cards, isLoading: cardsLoading } = useCardsStore();
  const { categories, isLoading: categoriesLoading } = useCategoriesStore();

  const mappedCards = cards.map((card) => {
    const category = categories.find((category) => {
      if (category.id === card.category_id) return category;
    });

    const cardDetails = {
      cardInfo: { ...card },
      categoryInfo: { ...category },
    };

    return { cardDetails };
  });

  // const [cards, setCards] = useState<any[]>([]);

  // useEffect(() => {
  //   const unsubscribe = listenToCards((cards) => {
  //     setCards(cards); // update your state
  //   });

  //   return () => unsubscribe(); // clean up listener on unmount
  // }, []);

  const [activeModal, setActiveModal] = useState<"add-card" | null>(null);

  return (
    <>
      <AddPecsModal
        visible={activeModal === "add-card"}
        onClose={() => setActiveModal(null)}
      />
      <View style={styles.container}>
        <Sidebar userRole="teacher" onNavigate={handleNavigation} />
        <View style={styles.mainContentContainer}>
          <PageHeader
            collectionToSearch="cards"
            onSearch={() => {}}
            query="card"
            pageTitle="Manage Cards"
            hasFilter={true}
            searchPlaceholder="Search Card"
          />
          <ScrollView>
            <View style={styles.cardContainer}>
              {cards.length === 0 ? (
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
                    No cards found.
                  </Text>
                </View>
              ) : (
                mappedCards.map((card, index) => (
                  <PecsCard
                    action="Delete"
                    key={index}
                    cardName={card.cardDetails.cardInfo.card_name}
                    cardCategory={
                      card.cardDetails.categoryInfo.category_name as string
                    }
                    categoryColor={
                      card.cardDetails.categoryInfo.background_color as string
                    }
                    image={card.cardDetails.cardInfo.image}
                    cardId={card.cardDetails.cardInfo.id}
                    creatorId={card.cardDetails.cardInfo.created_by}
                  />
                ))
              )}
            </View>
          </ScrollView>
        </View>
        <FabMenu
          page="manageCards"
          actions={{ add: () => setActiveModal("add-card") }}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    flexDirection: "row",

    gap: 10,
  },
  sidebar: {
    flex: 1,
    backgroundColor: "#eee",
  },
  mainContentContainer: {
    flex: 1,

    gap: 20,

    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  cardContainer: {
    flex: 1,
    flexWrap: "wrap",
    flexDirection: "row",

    alignItems: "center",

    gap: 15,
  },
});

export default ManageCardsScreen;

import FabMenu from "@/components/FabMenu";
import PageHeader from "@/components/PageHeader";
import PecsCard from "@/components/PecsCard";
import Sidebar from "@/components/Sidebar";
import AddPecsModal from "@/components/ui/AddPecsModal";
import COLORS from "@/constants/Colors";
import { useCardsStore } from "@/stores/cardsStore";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const ManageCardsScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const { cards, isLoading: cardsLoading, error: cardsError } = useCardsStore();

  const [activeModal, setActiveModal] = useState<"add" | null>(null);

  return (
    <>
      <AddPecsModal
        onClose={() => setActiveModal(null)}
        visible={activeModal === "add"}
      />
      <View style={styles.container}>
        <Sidebar userRole="teacher" onNavigate={handleNavigation} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.mainContentContainer}>
            <PageHeader
              collectionToSearch="cards"
              onSearch={() => {}}
              query="card"
              pageTitle="Manage Cards"
              hasFilter={true}
              searchPlaceholder="Search Card"
            />
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
                cards.map((card, index) => (
                  <PecsCard action="Delete" key={card.id} cardId={card.id} />
                ))
              )}
            </View>
          </View>
        </ScrollView>
        <FabMenu
          page="manageCards"
          actions={{ add: () => setActiveModal("add") }}
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

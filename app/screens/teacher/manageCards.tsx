import AddCard from "@/components/AddCard";
import PageHeader from "@/components/PageHeader";
import PecsCard from "@/components/PecsCard";
import Sidebar from "@/components/Sidebar";
import COLORS from "@/constants/Colors";
import { listenToCards } from "@/services/cardsService";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

const ManageCardsScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = listenToCards((cards) => {
      setCards(cards); // update your state
    });

    return () => unsubscribe(); // clean up listener on unmount
  }, []);

  return (
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
            <AddCard action="add" cardType="card" />
            {cards.map((card, index) => (
              <PecsCard
                action="Delete"
                key={index}
                cardName={card.card_name}
                cardCategory={card.category_title}
                categoryColor={card.background_color}
                image={card.image}
                cardId={card.id}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
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

    gap: 20,

    backgroundColor: COLORS.white,
  },
});

export default ManageCardsScreen;

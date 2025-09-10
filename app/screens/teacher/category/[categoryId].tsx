import ActionLink from "@/components/ActionLink";
import AddCard from "@/components/AddCard";
import PageHeader from "@/components/PageHeader";
import PecsCard from "@/components/PecsCard";
import Sidebar from "@/components/Sidebar";
import EditCategoryModal from "@/components/ui/EditCategoryModal";
import COLORS from "@/constants/Colors";
import { listenCardsWithCategory } from "@/services/cardsService";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

const ManageThisCategoryScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const { categoryId } = useLocalSearchParams();

  const [cards, setCards] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");

  useEffect(() => {
    if (!categoryId) return;

    const unsubscribe = listenCardsWithCategory(
      categoryId,
      (cards, categoryName) => {
        setCards(cards);
        setCategoryName(categoryName);
      }
    );

    return () => unsubscribe();
  }, [categoryId]);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  return (
    <>
      <EditCategoryModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        categoryId={categoryId as string}
      />
      <View style={styles.container}>
        <Sidebar userRole="teacher" onNavigate={handleNavigation} />
        <View style={styles.mainContentContainer}>
          <View style={styles.header}>
            <View style={styles.actionLinkContainer}>
              <ActionLink text="Return" clickHandler={router.back} />
              <ActionLink
                text="Edit"
                clickHandler={() => setIsEditModalVisible(true)}
              />
            </View>
            <PageHeader
              collectionToSearch="cards"
              onSearch={() => {}}
              query="card"
              pageTitle={`Manage ${categoryName} Cards`}
              hasFilter={true}
              searchPlaceholder="Search Card"
            />
          </View>

          <ScrollView>
            <View style={styles.cardContainer}>
              <AddCard
                cardType="card"
                action="add"
                categoryId={categoryId as string}
              />
              {cards.map((card, index) => (
                <PecsCard
                  action="Delete"
                  cardId={card.id}
                  key={index}
                  cardName={card.card_name}
                  cardCategory={card.category_title}
                  categoryColor={card.background_color}
                  image={card.image}
                />
              ))}
            </View>
          </ScrollView>
        </View>
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

    gap: 20,

    backgroundColor: COLORS.white,
  },
});

export default ManageThisCategoryScreen;

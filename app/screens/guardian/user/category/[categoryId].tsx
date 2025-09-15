import ActionLink from "@/components/ActionLink";
import AddCard from "@/components/AddCard";
import LearnerProfileHeader from "@/components/LeanerProfileHeader";
import PageHeader from "@/components/PageHeader";
import PecsCard from "@/components/PecsCard";
import Sidebar from "@/components/Sidebar";
import HorizontalLine from "@/components/ui/HorizontalLine";
import COLORS from "@/constants/Colors";
import {
  getAssignedCards,
  listenAssignedCardWithCategory,
} from "@/services/cardsService";
import { getStudentInfo } from "@/services/userService";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

const LearnerProfileCategory = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const { userId, categoryId } = useLocalSearchParams();

  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    if (!userId) return; // guard against undefined
    const fetchUserInfo = async () => {
      try {
        const data = await getStudentInfo(userId as string);
        setUserInfo(data);
      } catch (err) {
        console.error("Error fetching student info: ", err);
      }
    };

    fetchUserInfo();
  }, [userId]);
  const [cards, setCards] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");

  useEffect(() => {
    if (!userId || !categoryId) return;

    // fetch category name once
    const fetchCategoryName = async () => {
      try {
        const [, name] = await getAssignedCards(
          userId as string,
          categoryId as string
        );
        setCategoryName(name);
      } catch (err) {
        console.error("Error fetching category name: ", err);
      }
    };

    fetchCategoryName();

    // subscribe to assigned cards
    const unsubscribe = listenAssignedCardWithCategory(
      userId as string,
      categoryId as string,
      (cards) => {
        setCards(cards);
      }
    );

    return () => unsubscribe();
  }, [userId, categoryId]);

  return (
    <>
      <View style={styles.container}>
        <Sidebar userRole="teacher" onNavigate={handleNavigation} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.pageContainer}>
            <View style={styles.headerContainer}>
              <ActionLink text="Return" clickHandler={router.back} />
              <LearnerProfileHeader
                name={`${userInfo?.fname} ${userInfo?.lname}`}
                age={10}
                screen="teacher"
              />
              <View>
                <HorizontalLine />
              </View>
            </View>
            <View style={styles.pageHeaderContainer}>
              <PageHeader
                pageTitle={`${categoryName} Cards`}
                onSearch={() => {}}
                collectionToSearch="cards"
                query="card"
                hasFilter={true}
                searchPlaceholder="Search card"
              />
            </View>
            <View style={styles.boardContainer}>
              <AddCard
                cardType="card"
                action="assign"
                learnerId={userId as string}
                categoryId={categoryId as string}
              />
              {cards?.map((card, index) => (
                <PecsCard
                  action="Unassign"
                  learnerId={userId as string}
                  cardId={card.id}
                  cardCategory={categoryName}
                  cardName={card.card_name}
                  categoryColor={card.background_color}
                  image={card.image}
                  key={index}
                />
              ))}
            </View>
          </View>
        </ScrollView>
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
  pageContainer: {
    flex: 1,
    flexDirection: "column",

    backgroundColor: COLORS.white,

    gap: 5,

    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  headerContainer: {
    gap: 10,
  },
  pageHeaderContainer: {
    gap: 5,
  },
  buttonContainer: {
    width: "45%",
    height: 40,

    flexDirection: "row",
    gap: 10,
  },
  boardContainer: {
    flexWrap: "wrap",
    flexGrow: 0,
    flexDirection: "row",

    alignItems: "center",

    gap: 20,

    backgroundColor: COLORS.white,

    paddingVertical: 20,
  },
});

export default LearnerProfileCategory;

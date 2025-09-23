import ActionLink from "@/components/ActionLink";
import FabMenu from "@/components/FabMenu";
import LearnerProfileHeader from "@/components/LeanerProfileHeader";
import PageHeader from "@/components/PageHeader";
import PecsCard from "@/components/PecsCard";
import Sidebar from "@/components/Sidebar";
import AssignCardModal from "@/components/ui/AssignCardModal";
import HorizontalLine from "@/components/ui/HorizontalLine";
import COLORS from "@/constants/Colors";
import { calculateAge } from "@/helper/calculateAge";
import getCurrentUid from "@/helper/getCurrentUid";
import {
  getAssignedCards,
  listenAssignedCardWithCategory,
} from "@/services/cardsService";
import { getStudentInfo } from "@/services/userService";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const LearnerProfileCategory = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const { userId, categoryId, creatorId } = useLocalSearchParams();

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

  const uid = getCurrentUid();

  const [activeModal, setActiveModal] = useState<"assign-card" | null>(null);

  return (
    <>
      <AssignCardModal
        visible={activeModal === "assign-card"}
        categoryId={categoryId as string}
        onClose={() => setActiveModal(null)}
        learnerId={userId as string}
      />
      <View style={styles.container}>
        <Sidebar userRole="teacher" onNavigate={handleNavigation} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.pageContainer}>
            <View style={styles.headerContainer}>
              <View>
                {creatorId !== uid && (
                  <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                      This are view only category. Editing and deleting is
                      disabled.
                    </Text>
                  </View>
                )}

                <ActionLink text="Return" clickHandler={router.back} />
              </View>
              <LearnerProfileHeader
                profile={userInfo?.profile_pic}
                name={`${userInfo?.first_name} ${userInfo?.last_name}`}
                age={calculateAge(userInfo?.date_of_birth)}
                screen="guardian"
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
                  isDisabled={uid !== card.created_by}
                  creatorId={card.created_by}
                />
              ))}
            </View>
          </View>
        </ScrollView>
        {uid === (creatorId as string) && (
          <FabMenu
            page="learnerAssignedCategory"
            actions={{ assign_card: () => setActiveModal("assign-card") }}
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

    gap: 15,

    paddingVertical: 20,
  },
});

export default LearnerProfileCategory;

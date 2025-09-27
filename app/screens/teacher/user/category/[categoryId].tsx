import ActionLink from "@/components/ActionLink";
import FabMenu from "@/components/FabMenu";
import LearnerProfileHeader from "@/components/LeanerProfileHeader";
import PecsCard from "@/components/PecsCard";
import Sidebar from "@/components/Sidebar";
import AssignCardModal from "@/components/ui/AssignCardModal";
import ProgressReportModal from "@/components/ui/ProgressReportModal";
import COLORS from "@/constants/Colors";
import { calculateAge } from "@/helper/calculateAge";
import getCurrentUid from "@/helper/getCurrentUid";
import {
  getAssignedCards,
  listenAssignedCardWithCategory,
} from "@/services/cardsService";
import { unassignCategory } from "@/services/categoryService";
import { getStudentInfo } from "@/services/userService";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/Octicons";

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

  const [isReportModalActive, setIsReportModalActive] = useState(false);

  const handleUnassignCategory = async (
    categoryId: string,
    learnerId: string
  ) => {
    const success = await unassignCategory(categoryId, learnerId);

    if (success) router.back;
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <Sidebar userRole="teacher" onNavigate={handleNavigation} />
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileSection}>
            <View style={{ paddingTop: 10 }}>
              <ActionLink
                text="Back"
                icon={
                  <Icon name="arrow-left" size={22} color={COLORS.accent} />
                }
                clickHandler={router.back}
              />
            </View>
            <LearnerProfileHeader
              profile={userInfo?.profile_pic}
              name={`${userInfo?.first_name} ${userInfo?.last_name}`}
              age={calculateAge(userInfo?.date_of_birth)}
              buttonHandler={() => setIsReportModalActive(true)}
              screen="teacher"
            />
          </View>
          <View style={styles.categoriesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{categoryName} cards</Text>
              <Text style={styles.sectionSubtitle}>
                {`${cards?.length || 0} ${categoryName}`} cards assigned
              </Text>
            </View>
          </View>
          {creatorId !== uid && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                This are view only category. Editing and deleting is disabled.
              </Text>
            </View>
          )}
          <View style={styles.categoriesGrid}>
            {cards && cards.length <= 0 ? (
              <View style={styles.emptyState}>
                <Icon name="inbox" size={48} color={COLORS.gray} />
                <Text style={styles.emptyStateTitle}>
                  No Categories Assigned
                </Text>
                {/* <Text style={styles.emptyStateSubtitle}>
                    Tap the + button above to assign categories to this student
                  </Text> */}
              </View>
            ) : (
              cards?.map((card, index) => (
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
              ))
            )}
          </View>
        </ScrollView>
        {uid === (creatorId as string) && (
          <FabMenu
            page="learnerAssignedCategory"
            actions={{
              assign_card: () => setActiveModal("assign-card"),
              unassign_category: () => {
                handleUnassignCategory(categoryId as string, userId as string);
              },
            }}
          />
        )}
      </SafeAreaView>

      {/* Modals */}
      <ProgressReportModal
        visible={isReportModalActive}
        studentName={`${userInfo?.first_name} ${userInfo?.last_name}`}
        onClose={() => setIsReportModalActive(false)}
        onSubmit={() => {}}
        studentId={userId as string}
      />

      <AssignCardModal
        visible={activeModal === "assign-card"}
        categoryId={categoryId as string}
        onClose={() => setActiveModal(null)}
        learnerId={userId as string}
      />
    </>
  );
};

const styles = StyleSheet.create({
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.accent,
  },
  warningBox: {
    backgroundColor: COLORS.errorBg,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.errorText,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
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
  scrollContainer: {
    flex: 1,

    paddingHorizontal: 30,
  },
  pageContainer: {
    flex: 1,
    flexDirection: "column",

    gap: 5,

    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  profileSection: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray || "#f8f8f8",
  },
  categoriesSection: {
    flex: 1,
    paddingTop: 20,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "600",
    color: COLORS.black,
    fontFamily: "Poppins",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    fontFamily: "Poppins",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
    columnGap: 15,
    paddingBottom: 30,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    fontFamily: "Poppins",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
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

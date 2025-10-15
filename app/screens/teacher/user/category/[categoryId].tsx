import ActionLink from "@/components/ActionLink";
import FabMenu from "@/components/FabMenu";
import LearnerProfileHeader from "@/components/LeanerProfileHeader";
import PecsCard from "@/components/PecsCard";
import Sidebar from "@/components/Sidebar";
import SkeletonCard from "@/components/SkeletonCard";
import AssignCardModal from "@/components/ui/AssignCardModal";
import LearnerHistoryModal from "@/components/ui/PreviousReportModal";
import ProgressReportModal from "@/components/ui/ProgressReportModal";
import COLORS from "@/constants/Colors";
import { calculateAge } from "@/helper/calculateAge";
import getCurrentUid from "@/helper/getCurrentUid";
import { unassignCategory } from "@/services/categoryService";
import { useCardsStore } from "@/stores/cardsStore";
import { useCategoriesStore } from "@/stores/categoriesStores";
import { useUsersStore } from "@/stores/userStore";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Octicons";

const LearnerProfileCategory = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScreenLoading, setIsScreenLoading] = useState(true);

  const { users } = useUsersStore();
  const { cards } = useCardsStore();
  const { categories } = useCategoriesStore();

  const { userId, categoryId, creatorId } = useLocalSearchParams();

  const userInfo = users.find((user) => {
    if (user.id === userId) return user;
  });

  const activeCategory = categories.find((category) => {
    if (category.id === categoryId) return category;
  });

  const filteredCards = cards.filter(
    (card) =>
      (card.category_name === activeCategory?.category_name ||
        card.category_id === (categoryId as string)) &&
      card.assigned_to?.includes(userId)
  );

  const uid = getCurrentUid();

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

  const [activeModal, setActiveModal] = useState<"assign-card" | null>(null);

  const [isReportModalActive, setIsReportModalActive] = useState(false);
  const [isPreviousReportsModalActive, setIsPreviousReportsModalActive] =
    useState(false);

  const handleUnassignCategory = async (
    categoryId: string,
    learnerId: string,
    categoryName: string | undefined
  ) => {
    const result: any = await unassignCategory(
      categoryId,
      learnerId,
      activeCategory?.created_by_role === "ADMIN" ? categoryName : undefined
    );

    if (result.success) router.back();
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <Sidebar userRole="teacher" onNavigate={handleNavigation} />
        <ScrollView
          decelerationRate="fast"
          scrollEventThrottle={16}
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileSection}>
            <View style={{ paddingTop: 10 }}>
              <ActionLink
                text="Back"
                clickHandler={router.back}
                fontSize={16}
                isBold
                icon={
                  <Icon name="arrow-left" size={24} color={COLORS.accent} />
                }
              />
            </View>
            <LearnerProfileHeader
              profile={userInfo?.profile_pic!}
              name={`${userInfo?.first_name} ${userInfo?.last_name}`}
              age={calculateAge(userInfo?.date_of_birth!)}
              buttonHandler={() => setIsReportModalActive(true)}
              onViewReports={() => setIsPreviousReportsModalActive(true)}
              screen="teacher"
            />
          </View>
          <View style={styles.categoriesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeCategory?.category_name} cards
              </Text>
              <Text style={styles.sectionSubtitle}>
                {`${filteredCards?.length || 0} ${
                  activeCategory?.category_name
                }`}{" "}
                cards assigned
              </Text>
            </View>
          </View>
          {creatorId !== uid && creatorId !== "ADMIN" && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                This are view only category. Editing and deleting is disabled.
              </Text>
            </View>
          )}
          <View style={styles.categoriesGrid}>
            {isScreenLoading ? (
              <SkeletonCard type="pecs" />
            ) : filteredCards.length === 0 ? ( // ✅ Fixed condition
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>
                  No cards found in this category.
                </Text>
              </View>
            ) : (
              filteredCards.map((card) => (
                <PecsCard
                  action="Unassign"
                  cardId={card.id}
                  learnerId={userId as string}
                  key={card.id}
                />
              ))
            )}
          </View>
        </ScrollView>
        <FabMenu
          page={
            uid === (activeCategory?.created_by as string) ||
            activeCategory?.created_by_role === "ADMIN"
              ? "learnerAssignedCategory"
              : "learnerAssignedCategoryNoUnassign"
          }
          actions={{
            assign_card: () => setActiveModal("assign-card"),
            unassign_category: () => {
              handleUnassignCategory(
                categoryId as string,
                userId as string,
                activeCategory?.category_name
              );
            },
          }}
        />
      </SafeAreaView>

      {/* Modals */}
      <ProgressReportModal
        visible={isReportModalActive}
        studentName={`${userInfo?.first_name} ${userInfo?.last_name}`}
        onClose={() => setIsReportModalActive(false)}
        onSubmit={() => {}}
        studentId={userId as string}
      />

      {/* New Previous Reports Modal */}
      <LearnerHistoryModal
        visible={isPreviousReportsModalActive}
        onClose={() => setIsPreviousReportsModalActive(false)}
        learnerId={userId as string}
        learnerName={`${userInfo?.first_name} ${userInfo?.last_name}`}
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

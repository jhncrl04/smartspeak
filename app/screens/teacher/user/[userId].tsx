import ActionLink from "@/components/ActionLink";
import Board from "@/components/Board";
import FabMenu from "@/components/FabMenu";
import LearnerProfileHeader from "@/components/LeanerProfileHeader";
import Sidebar from "@/components/Sidebar";
import SkeletonCard from "@/components/SkeletonCard";
import AssignCategoryModal from "@/components/ui/AssignCategoryModal";
import PreviousReportsModal from "@/components/ui/PreviousReportModal";
import ProgressReportModal from "@/components/ui/ProgressReportModal";
import COLORS from "@/constants/Colors";
import { calculateAge } from "@/helper/calculateAge";
import getCurrentUid from "@/helper/getCurrentUid";
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
import { ActivityIndicator } from "react-native-paper";
import Icon from "react-native-vector-icons/Octicons";

const LearnerProfile = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const [isScreenLoading, setIsScreenLoading] = useState(true);
  const [navigatingCategoryId, setNavigatingCategoryId] = useState<
    string | null
  >(null);

  const { users } = useUsersStore();
  const { categories } = useCategoriesStore();

  const { userId, sectionId } = useLocalSearchParams();

  const userInfo = users.find((user) => {
    if (user.id === userId) return user;
  });

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
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const mappedCategories = categories
    .filter((category) => category.assigned_to?.includes(userId as string))
    .sort((a, b) => {
      const aIsUserCreated = a.created_by === uid;
      const bIsUserCreated = b.created_by === uid;

      if (aIsUserCreated && !bIsUserCreated) return -1;
      if (!aIsUserCreated && bIsUserCreated) return 1;

      const categoryA = (a.category_name || "").toLowerCase();
      const categoryB = (b.category_name || "").toLowerCase();

      if (categoryA !== categoryB) {
        return categoryA.localeCompare(categoryB);
      }

      return a.category_name
        .toLowerCase()
        .localeCompare(b.category_name.toLowerCase());
    });

  const [activeModal, setActiveModal] = useState<
    "assign_category" | "remove_learner" | null
  >(null);
  const [isReportModalActive, setIsReportModalActive] = useState(false);
  const [isPreviousReportsModalActive, setIsPreviousReportsModalActive] =
    useState(false);

  const age = calculateAge(userInfo?.date_of_birth!);

  // const handleRemoveLearner = async (learnerId: string, sectionId: string) => {
  //   await removeAsStudent(learnerId);
  //   await removeStudentToSection(learnerId, sectionId);
  // };

  const handleBoardPress = (categoryId: string, createdBy: string) => {
    // Prevent navigation if already navigating
    if (navigatingCategoryId) return;

    // Set the navigating state
    setNavigatingCategoryId(categoryId);

    router.push({
      pathname: "/screens/teacher/user/category/[categoryId]",
      params: {
        userId: userId,
        categoryId: categoryId,
        creatorId: createdBy,
      },
    });

    // Reset navigating state after a delay (fallback in case navigation doesn't complete)
    setTimeout(() => {
      setNavigatingCategoryId(null);
    }, 2000);
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <Sidebar userRole="teacher" onNavigate={handleNavigation} />

        <ScrollView
          decelerationRate="fast" // slows down the momentum
          scrollEventThrottle={16}
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Profile Section */}
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
              profile={userInfo?.profile_pic!}
              name={`${userInfo?.first_name} ${userInfo?.last_name}`}
              age={age}
              screen="teacher"
              buttonHandler={() => setIsReportModalActive(true)}
              onViewReports={() => setIsPreviousReportsModalActive(true)} // New prop
            />
          </View>

          {/* Categories Section */}
          <View style={styles.categoriesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Assigned Categories</Text>
              <Text style={styles.sectionSubtitle}>
                {mappedCategories?.length || 0} categories assigned
              </Text>
            </View>

            {/* Categories Grid */}
            {isScreenLoading ? (
              <SkeletonCard type="board" />
            ) : (
              <Animated.View
                style={[styles.categoriesGrid, { opacity: fadeAnim }]}
              >
                {mappedCategories.length === 0 ? (
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
                      No Categories found.
                    </Text>
                  </View>
                ) : (
                  mappedCategories.map((category, index) => (
                    <Board
                      categoryId={category.id}
                      key={category.id}
                      routerHandler={() => {
                        handleBoardPress(category.id, category.created_by);
                      }}
                    />
                  ))
                )}
              </Animated.View>
            )}
          </View>
        </ScrollView>

        {/* Modals */}
        <ProgressReportModal
          visible={isReportModalActive}
          studentName={`${userInfo?.first_name} ${userInfo?.last_name}`}
          onClose={() => setIsReportModalActive(false)}
          onSubmit={() => {}}
          studentId={userId as string}
        />
        {/* New Previous Reports Modal */}
        <PreviousReportsModal
          visible={isPreviousReportsModalActive}
          onClose={() => setIsPreviousReportsModalActive(false)}
          learnerId={userId as string}
          learnerName={`${userInfo?.first_name} ${userInfo?.last_name}`}
        />

        <AssignCategoryModal
          visible={activeModal === "assign_category"}
          learnerId={userId as string}
          onClose={() => setActiveModal(null)}
        />

        <FabMenu
          page="learnerProfile"
          actions={{
            assign_category: () => setActiveModal("assign_category"),
          }}
        />
      </SafeAreaView>

      {navigatingCategoryId && (
        <View style={styles.boardLoadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    flexDirection: "row",
    gap: 10,
  },
  mobileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || "#f0f0f0",
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    fontFamily: "Poppins",
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
  },
  scrollContainer: {
    flex: 1,

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
  emptyStateSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    fontFamily: "Poppins",
    textAlign: "center",
    lineHeight: 20,
  },
  boardLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
});

export default LearnerProfile;

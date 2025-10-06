import ActionLink from "@/components/ActionLink";
import Board from "@/components/Board";
import FabMenu from "@/components/FabMenu";
import LearnerProfileHeader from "@/components/LeanerProfileHeader";
import Sidebar from "@/components/Sidebar";
import AssignCategoryModal from "@/components/ui/AssignCategoryModal";
import PreviousReportsModal from "@/components/ui/PreviousReportModal";
import COLORS from "@/constants/Colors";
import { calculateAge } from "@/helper/calculateAge";
import { useCategoriesStore } from "@/stores/categoriesStores";
import { useUsersStore } from "@/stores/userStore";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import Icon from "react-native-vector-icons/Octicons";

const LearnerProfile = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const { users } = useUsersStore();
  const { categories } = useCategoriesStore();

  const { userId } = useLocalSearchParams();

  const userInfo = users.find((user) => {
    if (user.id === userId) return user;
  });

  const mappedCategories = categories.filter((category) => {
    if (
      category.assigned_to?.includes(userId as string) ||
      category.created_by_role === "ADMIN"
    )
      return category;
  });

  const [activeModal, setActiveModal] = useState<
    "assign_category" | "remove_learner" | null
  >(null);

  const [isReportModalActive, setIsReportModalActive] = useState(false);
  const [isPreviousReportsModalActive, setIsPreviousReportsModalActive] =
    useState(false);

  const age = calculateAge(userInfo?.date_of_birth);

  return (
    <>
      <SafeAreaView style={styles.container}>
        <Sidebar userRole="guardian" onNavigate={handleNavigation} />
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
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
              profile={userInfo?.profile_pic!}
              name={`${userInfo?.first_name} ${userInfo?.last_name}`}
              age={age}
              buttonHandler={() => {
                router.push({
                  pathname: "/screens/guardian/user/settings/[userId]",
                  params: {
                    userId: userId as string,
                  },
                });
              }}
              onViewReports={() => setIsReportModalActive(true)}
              screen="guardian"
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

            <View style={styles.categoriesGrid}>
              {mappedCategories && mappedCategories.length <= 0 ? (
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
                mappedCategories?.map((category, index) => (
                  <Board
                    categoryId={category.id}
                    key={category.id}
                    routerHandler={() => {
                      router.push({
                        pathname:
                          "/screens/guardian/user/category/[categoryId]",
                        params: {
                          categoryId: category.id,
                          userId: userId as string,
                          creatorId: category.created_by,
                        },
                      });
                    }}
                  />
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <AssignCategoryModal
        visible={activeModal === "assign_category"}
        learnerId={userId as string}
        onClose={() => setActiveModal(null)}
      />
      <PreviousReportsModal
        visible={isReportModalActive}
        onClose={() => setIsReportModalActive(false)}
        learnerId={userId as string}
        learnerName={`${userInfo?.first_name} ${userInfo?.last_name}`}
      />

      <FabMenu
        page="learnerProfile"
        actions={{
          assign_category: () => setActiveModal("assign_category"),
          remove_child: () => console.log("Removing child"),
        }}
      />
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
});

export default LearnerProfile;

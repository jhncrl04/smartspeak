import ActionLink from "@/components/ActionLink";
import Board from "@/components/Board";
import FabMenu from "@/components/FabMenu";
import LearnerProfileHeader from "@/components/LeanerProfileHeader";
import Sidebar from "@/components/Sidebar";
import SkeletonCard from "@/components/SkeletonCard";
import AssignCategoryModal from "@/components/ui/AssignCategoryModal";
import PreviousReportsModal from "@/components/ui/PreviousReportModal";
import COLORS from "@/constants/Colors";
import { calculateAge } from "@/helper/calculateAge";
import getCurrentUid from "@/helper/getCurrentUid";
import { useCategoriesStore } from "@/stores/categoriesStores";
import { useUsersStore } from "@/stores/userStore";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/Octicons";

const LearnerProfile = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const { users } = useUsersStore();
  const { categories } = useCategoriesStore();
  const { userId } = useLocalSearchParams();

  const [isLoading, setIsLoading] = useState(true);

  // Memoize user lookup to prevent unnecessary recalculations
  const userInfo = useMemo(() => {
    return users.find((user) => user.id === userId);
  }, [users, userId]);

  const uid = getCurrentUid();

  // Memoize category filtering
  const mappedCategories = useMemo(() => {
    return categories
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
  }, [categories, userId]);

  // Simulate data load completion (remove this when actual async loads finish)
  useEffect(() => {
    if (userInfo) {
      // Data is ready, hide loading
      setIsLoading(false);
    }
  }, [userInfo]);

  const [activeModal, setActiveModal] = useState<
    "assign_category" | "remove_learner" | null
  >(null);

  const [isReportModalActive, setIsReportModalActive] = useState(false);
  const [isPreviousReportsModalActive, setIsPreviousReportsModalActive] =
    useState(false);

  const age = useMemo(() => {
    return userInfo?.date_of_birth
      ? calculateAge(userInfo.date_of_birth)
      : null;
  }, [userInfo?.date_of_birth]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Sidebar userRole="guardian" onNavigate={handleNavigation} />
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.profileSection}>
            <SkeletonCard type="pecs" />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <Sidebar userRole="guardian" onNavigate={handleNavigation} />
        <ScrollView
          decelerationRate={"fast"}
          scrollEventThrottle={16}
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
                </View>
              ) : (
                mappedCategories?.map((category) => (
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
});

export default LearnerProfile;

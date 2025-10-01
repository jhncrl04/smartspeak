import ActionLink from "@/components/ActionLink";
import Board from "@/components/Board";
import FabMenu from "@/components/FabMenu";
import LearnerProfileHeader from "@/components/LeanerProfileHeader";
import Sidebar from "@/components/Sidebar";
import AssignCategoryModal from "@/components/ui/AssignCategoryModal";
import PreviousReportsModal from "@/components/ui/PreviousReportModal";
import ProgressReportModal from "@/components/ui/ProgressReportModal";
import COLORS from "@/constants/Colors";
import { calculateAge } from "@/helper/calculateAge";
import { listenAssignedCategories } from "@/services/categoryService";
import { removeStudentToSection } from "@/services/sectionService";
import { getStudentInfo, removeAsStudent } from "@/services/userService";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/Octicons";

const LearnerProfile = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const { userId, sectionId } = useLocalSearchParams();

  const [userInfo, setUserInfo] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>();
  const [activeModal, setActiveModal] = useState<
    "assign_category" | "remove_learner" | null
  >(null);
  const [isReportModalActive, setIsReportModalActive] = useState(false);
  const [isPreviousReportsModalActive, setIsPreviousReportsModalActive] =
    useState(false);

  useEffect(() => {
    if (!userId) return;
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

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = listenAssignedCategories(userId as string, (cats) => {
      setCategories(cats);
    });
    return () => unsubscribe();
  }, [userId]);

  const age = calculateAge(userInfo?.date_of_birth);

  const handleRemoveLearner = async (learnerId: string, sectionId: string) => {
    await removeAsStudent(learnerId);
    await removeStudentToSection(learnerId, sectionId);
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <Sidebar userRole="teacher" onNavigate={handleNavigation} />

        {/* Mobile Header
        
        <View style={styles.mobileHeader}>
          <TouchableOpacity style={styles.backButton} onPress={router.back}>
            <Icon name="arrow-left" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Student Profile</Text>
          <View />
        </View> */}

        <ScrollView
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
              profile={userInfo?.profile_pic}
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
                {categories?.length || 0} categories assigned
              </Text>
            </View>

            {/* Categories Grid */}
            <View style={styles.categoriesGrid}>
              {categories && categories.length <= 0 ? (
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
                categories?.map((category, index) => (
                  <Board
                    key={index}
                    boardName={category.category_name}
                    boardBackground={category.background_color}
                    categoryId={category.id}
                    image={category.image}
                    creatorId={category.created_by}
                    creatorName={category.creatorName}
                    actionHandler={() => {
                      router.push({
                        pathname: "/screens/teacher/user/category/[categoryId]",
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
          studentId={userId as string}
          studentName={`${userInfo?.first_name} ${userInfo?.last_name}`}
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
            remove_learner: () =>
              handleRemoveLearner(userId as string, sectionId as string),
          }}
        />
      </SafeAreaView>
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

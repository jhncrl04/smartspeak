import ActionLink from "@/components/ActionLink";
import Board from "@/components/Board";
import FabMenu from "@/components/FabMenu";
import LearnerProfileHeader from "@/components/LeanerProfileHeader";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import AssignCategoryModal from "@/components/ui/AssignCategoryModal";
import HorizontalLine from "@/components/ui/HorizontalLine";
import COLORS from "@/constants/Colors";
import { calculateAge } from "@/helper/calculateAge";
import { listenAssignedCategories } from "@/services/categoryService";
import { getStudentInfo } from "@/services/userService";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const LearnerProfile = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const { userId } = useLocalSearchParams();

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

  const [categories, setCategories] = useState<any[]>();

  // get assign categories on students
  useEffect(() => {
    if (!userId) return;

    // subscribe to changes
    const unsubscribe = listenAssignedCategories(userId as string, (cats) => {
      setCategories(cats);
    });

    // cleanup on unmount
    return () => unsubscribe();
  }, [userId]);
  const age = calculateAge(userInfo?.date_of_birth);

  const [activeModal, setActiveModal] = useState<
    "assign_category" | "remove_learner" | null
  >(null);

  return (
    <>
      <AssignCategoryModal
        visible={activeModal === "assign_category"}
        learnerId={userId as string}
        onClose={() => setActiveModal(null)}
      />
      <View style={styles.container}>
        <Sidebar userRole="guardian" onNavigate={handleNavigation} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.pageContainer}>
            <View style={styles.headerContainer}>
              <ActionLink text="Return" clickHandler={router.back} />
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
                pageTitle="Assign Category"
                onSearch={() => {}}
                collectionToSearch="pecsCategories"
                query="category"
                hasFilter={true}
                searchPlaceholder="Search Category"
              />
            </View>
            <View style={styles.boardContainer}>
              {categories && categories?.length <= 0 ? (
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
                    No assigned categories
                  </Text>
                </View>
              ) : (
                categories?.map((category, index) => (
                  <Board
                    boardName={category.category_name}
                    boardBackground={category.background_color}
                    categoryId={category.id}
                    image={category.image}
                    creatorId={category.created_by}
                    creatorName={category.creatorName}
                    actionHandler={() => {
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
                    key={index}
                  />
                ))
              )}
            </View>
          </View>
        </ScrollView>
        <FabMenu
          page="learnerProfile"
          actions={{
            assign_category: () => setActiveModal("assign_category"),
          }}
        />
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

    gap: 15,

    paddingVertical: 20,
  },
});

export default LearnerProfile;

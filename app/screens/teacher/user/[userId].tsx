import ActionLink from "@/components/ActionLink";
import AddCard from "@/components/AddCard";
import Board from "@/components/Board";
import LearnerProfileHeader from "@/components/LeanerProfileHeader";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import HorizontalLine from "@/components/ui/HorizontalLine";
import COLORS from "@/constants/Colors";
import { listenAssignedCategories } from "@/services/categoryService";
import { getStudentInfo } from "@/services/userService";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

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
                pageTitle="Assign Category"
                onSearch={() => {}}
                collectionToSearch="pecsCategories"
                query="category"
                hasFilter={true}
                searchPlaceholder="Search Category"
              />
              {/* <View style={styles.buttonContainer}>
            <PrimaryButton
              title="Remove Board"
              clickHandler={() => console.log("remove board")}
            />
            <PrimaryButton
              title="Add Board"
              clickHandler={() => console.log("add board")}
            />
          </View> */}
            </View>
            <View style={styles.boardContainer}>
              <AddCard
                cardType="board"
                action="assign"
                learnerId={userId as string}
              />
              {categories?.map((category, index) => (
                <Board
                  boardName={category.category_name}
                  boardBackground={category.background_color}
                  categoryId={category.id}
                  image={category.image}
                  actionHandler={() => {
                    router.push({
                      pathname: "/screens/teacher/user/category/[categoryId]",
                      params: {
                        categoryId: category.id,
                        userId: userId as string,
                      },
                    });
                  }}
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

export default LearnerProfile;

import LearnerProfileHeader from "@/components/LeanerProfileHeader";
import PageHeader from "@/components/PageHeader";
import PrimaryButton from "@/components/PrimaryButton";
import Sidebar from "@/components/Sidebar";
import HorizontalLine from "@/components/ui/HorizontalLine";
import COLORS from "@/constants/Colors";
import { getStudentInfo } from "@/services/userService";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

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

  return (
    <View style={styles.container}>
      <Sidebar userRole="teacher" onNavigate={handleNavigation} />
      <View style={styles.pageContainer}>
        <View style={styles.headerContainer}>
          <LearnerProfileHeader
            name={`${userInfo.fname} ${userInfo.lname}`}
            age={10}
            screen="teacher"
          />
          <View>
            <HorizontalLine />
          </View>
        </View>
        <View style={styles.pageHeaderContainer}>
          <PageHeader
            pageTitle="Assign Boards"
            onSearch={() => {}}
            collectionToSearch="cards"
            query="card"
            hasFilter={true}
            searchPlaceholder="Search Card"
          />
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title="Remove Board"
              clickHandler={() => console.log("remove board")}
            />
            <PrimaryButton
              title="Add Board"
              clickHandler={() => console.log("add board")}
            />
          </View>
        </View>
        <View style={styles.boardContainer}></View>
      </View>
    </View>
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

    gap: 15,

    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  headerContainer: {
    gap: 20,
  },
  pageHeaderContainer: {
    gap: 15,
  },
  buttonContainer: {
    width: "60%",

    flexDirection: "row",
    gap: 10,
  },
  boardContainer: {
    flexWrap: "wrap",
    flexGrow: 0,
    flexDirection: "row",

    alignItems: "center",

    rowGap: 20,
    columnGap: 30,

    backgroundColor: COLORS.white,

    paddingVertical: 20,
  },
});

export default LearnerProfile;

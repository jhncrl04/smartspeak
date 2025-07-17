import Board from "@/components/Board";
import LearnerProfileHeader from "@/components/LeanerProfileHeader";
import PageHeader from "@/components/PageHeader";
import PrimaryButton from "@/components/PrimaryButton";
import Sidebar from "@/components/Sidebar";
import HorizontalLine from "@/components/ui/HorizontalLine";
import COLORS from "@/constants/Colors";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

const LearnerProfile = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  return (
    <View style={styles.container}>
      <Sidebar onNavigate={handleNavigation} />
      <View style={styles.pageContainer}>
        <View style={styles.headerContainer}>
          <LearnerProfileHeader name="Johnny Cage" age={10} />
          <View>
            <HorizontalLine />
          </View>
        </View>
        <View style={styles.pageHeaderContainer}>
          <PageHeader
            pageTitle="Assign Boards"
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
        <View style={styles.boardContainer}>
          <Board boardName="Foods" boardBackground="#ff0102" />
          <Board boardName="Places" boardBackground="#005923" />
          <Board boardName="Drinks" boardBackground="#2e2e2e" />
          <Board boardName="Activities" boardBackground="#fefae0" />
        </View>
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

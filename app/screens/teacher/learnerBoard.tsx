import LearnerProfileHeader from "@/components/LeanerProfileHeader";
import PageHeader from "@/components/PageHeader";
import PecsCard from "@/components/PecsCard";
import PrimaryButton from "@/components/PrimaryButton";
import Sidebar from "@/components/Sidebar";
import HorizontalLine from "@/components/ui/HorizontalLine";
import COLORS from "@/constants/Colors";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

const LearnerBoardScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  return (
    <View style={styles.container}>
      <Sidebar userRole="teacher" onNavigate={handleNavigation} />
      <View style={styles.pageContainer}>
        <View style={styles.headerContainer}>
          <LearnerProfileHeader screen="teacher" name="Johnny Cage" age={10} />
          <View>
            <HorizontalLine />
          </View>
        </View>
        <View style={styles.pageHeaderContainer}>
          <PageHeader
            pageTitle="Assign Cards"
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
        <View style={styles.boardContainer}>
          <PecsCard
            cardName="Apple"
            cardCategory="Foods"
            categoryColor="#ff0102"
          />
          <PecsCard
            cardName="Biscuits"
            cardCategory="Foods"
            categoryColor="#ff0102"
          />
          <PecsCard
            cardName="Church"
            cardCategory="Places"
            categoryColor="#005923"
          />
          <PecsCard
            cardName="Water"
            cardCategory="Drinks"
            categoryColor="#2e2e2e"
          />
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

    gap: 20,

    backgroundColor: COLORS.white,

    paddingVertical: 20,
  },
});

export default LearnerBoardScreen;

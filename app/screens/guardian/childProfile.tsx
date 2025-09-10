import LearnerProfileHeader from "@/components/LeanerProfileHeader";
import Sidebar from "@/components/Sidebar";
import HorizontalLine from "@/components/ui/HorizontalLine";
import COLORS from "@/constants/Colors";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const ChildProfileScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const dropdownItems = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Yearly", value: "yearly" },
  ];

  return (
    <View style={styles.container}>
      <Sidebar userRole="guardian" onNavigate={handleNavigation} />

      <View style={styles.pageContainer}>
        <View style={styles.headerContainer}>
          <LearnerProfileHeader name="Johnny Cage" age={10} screen="guardian" />
          <View>
            <HorizontalLine />
          </View>
        </View>
        <View style={styles.mainContentContainer}>
          <View style={styles.subContainer}>
            <View style={styles.subContainer}>
              <View style={styles.subContainerHeader}>
                <Text style={styles.cardsLearnedLabel}>Cards learned</Text>
              </View>
              <View style={styles.graphContainer}></View>
            </View>
            <View style={styles.subContainer}>
              <View style={styles.subContainerHeader}>
                <Text style={styles.cardsLearnedLabel}>Most Used Cards</Text>
              </View>
              <View style={styles.mostUsedCardsContainer}></View>
            </View>
          </View>

          <View style={styles.subContainer}>
            <View style={styles.subContainerHeader}>
              <Text style={styles.cardsLearnedLabel}>Progress Reports</Text>
            </View>
            <View style={styles.progressReportContainer}></View>
          </View>
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

    paddingVertical: 20,
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
  mainContentContainer: {
    flex: 1,
    flexDirection: "row",

    gap: 30,
  },
  subContainer: {
    flex: 1,
    gap: 10,
  },
  subContainerHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",

    minHeight: 35,
  },
  cardsLearnedLabel: {
    lineHeight: 25,
    fontSize: 20,
    fontFamily: "Poppins",
  },
  dropdown: {
    paddingHorizontal: 10,
    paddingVertical: 5,

    minWidth: 100,

    borderColor: COLORS.gray,
    borderWidth: 0.5,
    borderRadius: 5,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  graphContainer: {
    flex: 1,
    backgroundColor: COLORS.successBg,
  },
  progressReportContainer: {
    flex: 1,
    backgroundColor: COLORS.errorBg,
  },
  mostUsedCardsContainer: {
    flex: 1,
    flexWrap: "wrap",
    flexDirection: "row",

    gap: 10,
  },
});

export default ChildProfileScreen;

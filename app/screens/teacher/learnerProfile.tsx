import LearnerProfileHeader from "@/components/LeanerProfileHeader";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import HorizontalLine from "@/components/ui/HorizontalLine";
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
        <PageHeader pageTitle="Assign Boards" />
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
    gap: 15,
  },
});

export default LearnerProfile;

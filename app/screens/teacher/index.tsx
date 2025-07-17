import CardContainer from "@/components/CardContainer";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

const ManageLearnersScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  return (
    <View style={styles.container}>
      <Sidebar onNavigate={handleNavigation} />
      <View style={styles.pageContainer}>
        <PageHeader
          pageTitle="Manage Learners"
          hasFilter={false}
          searchPlaceholder="Search Learner"
        />
        <CardContainer />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    flexDirection: "row",
  },
  pageContainer: { flex: 1, paddingHorizontal: 30, paddingVertical: 20 },
  sidebar: {
    flex: 1,
    backgroundColor: "#eee",
  },
});

export default ManageLearnersScreen;

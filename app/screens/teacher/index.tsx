import CardContainer from "@/components/CardContainer";
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
      <CardContainer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    flexDirection: "row",

    gap: 10,
  },
  sidebar: {
    flex: 1,
    backgroundColor: "#eee",
  },
});

export default ManageLearnersScreen;

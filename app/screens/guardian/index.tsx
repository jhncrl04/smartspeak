import AddLearnerCard from "@/components/AddLearnerCard";
import LearnerCard from "@/components/LearnerCard";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import COLORS from "@/constants/Colors";
import { getChild } from "@/services/userService";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

const ChildManagementScreen = () => {
  const [children, setChildren] = useState({});

  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  useEffect(() => {
    const fetchChildren = async () => {
      const data = await getChild();
      console.log("Children fetched:", data);
      setChildren(data);
    };

    fetchChildren();
  }, []);

  return (
    <View style={styles.container}>
      <Sidebar userRole="guardian" onNavigate={handleNavigation} />
      <View style={styles.pageContainer}>
        <PageHeader
          pageTitle="Manage Child"
          hasFilter={false}
          searchPlaceholder="Search Child"
        />
        <View style={styles.cardContainer}>
          <AddLearnerCard />
          <LearnerCard
            cardType="profile"
            name="Jayvee"
            age={12}
            gender="Male"
          />
          {/* <LearnerCard cardType="profile" name="Steve" age={12} gender="Male" />
          <LearnerCard cardType="profile" name="Azule" age={12} gender="Male" /> */}
        </View>
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
  cardContainer: {
    flex: 1,
    flexWrap: "wrap",
    flexDirection: "row",

    alignItems: "center",

    gap: 20,

    backgroundColor: COLORS.white,

    paddingVertical: 20,
  },
});

export default ChildManagementScreen;

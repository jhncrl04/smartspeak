import AddCard from "@/components/AddCard";
import PecsCard from "@/components/PecsCard";
import Sidebar from "@/components/Sidebar";
import COLORS from "@/constants/Colors";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

const ManageCardsScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  return (
    <View style={styles.container}>
      <Sidebar onNavigate={handleNavigation} />
      <View style={styles.boardContainer}>
        <AddCard cardType="card" />
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
  boardContainer: {
    flex: 1,
    flexWrap: "wrap",
    flexDirection: "row",

    alignItems: "center",

    rowGap: 20,
    columnGap: 30,

    backgroundColor: COLORS.white,

    paddingHorizontal: 30,
    paddingVertical: 20,
  },
});

export default ManageCardsScreen;

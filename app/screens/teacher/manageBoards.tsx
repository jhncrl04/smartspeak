import AddCard from "@/components/AddCard";
import Board from "@/components/Board";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import COLORS from "@/constants/Colors";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

const ManageBoardsScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  return (
    <View style={styles.container}>
      <Sidebar onNavigate={handleNavigation} />
      <View style={styles.mainContentContainer}>
        <PageHeader
          pageTitle="Manage Boards"
          searchPlaceholder="Search Board"
        />
        <View style={styles.boardContainer}>
          <AddCard cardType="board" />
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
  sidebar: {
    flex: 1,
    backgroundColor: "#eee",
  },
  mainContentContainer: {
    flex: 1,

    gap: 20,

    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  boardContainer: {
    flex: 1,
    flexWrap: "wrap",
    flexDirection: "row",

    alignItems: "center",

    rowGap: 20,
    columnGap: 30,

    backgroundColor: COLORS.white,
  },
});

export default ManageBoardsScreen;

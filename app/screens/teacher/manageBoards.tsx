import AddCard from "@/components/AddCard";
import Board from "@/components/Board";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import COLORS from "@/constants/Colors";
import { listenCategories } from "@/services/categoryService";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

const ManageBoardsScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = listenCategories((categories) => {
      setCategories(categories);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Sidebar userRole="teacher" onNavigate={handleNavigation} />
      <View style={styles.mainContentContainer}>
        <PageHeader
          pageTitle="Manage Categories"
          hasFilter={true}
          searchPlaceholder="Search Category"
          collectionToSearch="pecsCategories"
          onSearch={() => {}}
          query="category"
        />
        <View style={styles.boardContainer}>
          <AddCard cardType="board" action="add" />

          {categories.map((category, index) => (
            <Board
              key={index}
              categoryId={category.id}
              image={category.image}
              boardName={category.category_name}
              boardBackground={category.background_color}
              actionHandler={() => {
                router.push(`/screens/teacher/category/${category.id}` as any);
              }}
            />
          ))}
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

    gap: 20,

    backgroundColor: COLORS.white,
  },
});

export default ManageBoardsScreen;

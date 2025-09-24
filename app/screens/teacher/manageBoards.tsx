import Board from "@/components/Board";
import FabMenu from "@/components/FabMenu";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import AddCategoryModal from "@/components/ui/AddCategoryModal";
import { listenCategories } from "@/services/categoryService";
import { router } from "expo-router";
import { ScrollView } from "moti";
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

  const [activeModal, setActiveModal] = useState<"add" | null>(null);

  return (
    <>
      <AddCategoryModal
        visible={activeModal === "add"}
        onClose={() => setActiveModal(null)}
      />
      <View style={styles.container}>
        <Sidebar userRole="teacher" onNavigate={handleNavigation} />
        <ScrollView showsVerticalScrollIndicator={false}>
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
              {categories.map((category, index) => (
                <Board
                  key={index}
                  categoryId={category.id}
                  image={category.image}
                  boardName={category.category_name}
                  boardBackground={category.background_color}
                  creatorName={category.creatorName}
                  creatorId={category.created_by}
                  actionHandler={() => {
                    router.push({
                      pathname: "/screens/teacher/category/[categoryId]",
                      params: {
                        categoryId: category.id,
                        creatorId: category.created_by,
                      },
                    });
                  }}
                />
              ))}
            </View>
          </View>
        </ScrollView>
        <FabMenu
          page="manageBoards"
          actions={{ add: () => setActiveModal("add") }}
        />
      </View>
    </>
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

    gap: 15,
  },
});

export default ManageBoardsScreen;

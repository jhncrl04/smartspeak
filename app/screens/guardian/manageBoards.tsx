import Board from "@/components/Board";
import FabMenu from "@/components/FabMenu";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import AddCategoryModal from "@/components/ui/AddCategoryModal";
import getCurrentUid from "@/helper/getCurrentUid";
import { useCategoriesStore } from "@/stores/categoriesStores";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

const ManageBoardsScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const { categories } = useCategoriesStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<"add" | null>(null);

  const uid = getCurrentUid();

  const mappedCateories = categories.filter((category) => {
    return category.created_by === uid || category.created_by_role === "ADMIN";
  });

  const filteredCategories = mappedCateories.filter((category) => {
    if (!searchQuery.trim()) return true;

    // Filter by search query (case-insensitive)
    const query = searchQuery.toLowerCase().trim();
    const categoryName = category.category_name.toLowerCase();

    return categoryName.includes(query);
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <>
      <AddCategoryModal
        visible={activeModal === "add"}
        onClose={() => setActiveModal(null)}
      />
      <View style={styles.container}>
        <Sidebar userRole="teacher" onNavigate={handleNavigation} />
        <View style={styles.mainContentContainer}>
          <PageHeader
            collectionToSearch="pecsCategories"
            query="local"
            onSearch={(query) => {
              handleSearch(query as string);
            }}
            pageTitle="Manage Categories"
            hasFilter={true}
            searchPlaceholder="Search Category"
          />
          <View style={styles.boardContainer}>
            {filteredCategories.map((category, index) => (
              <Board
                categoryId={category.id}
                key={category.id}
                routerHandler={() => {
                  router.push({
                    pathname: "/screens/guardian/category/[categoryId]",
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

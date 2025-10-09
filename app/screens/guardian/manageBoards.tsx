import Board from "@/components/Board";
import FabMenu from "@/components/FabMenu";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import AddCategoryModal from "@/components/ui/AddCategoryModal";
import COLORS from "@/constants/Colors";
import getCurrentUid from "@/helper/getCurrentUid";
import { useCategoriesStore } from "@/stores/categoriesStores";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

const ManageBoardsScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const { categories } = useCategoriesStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<"add" | null>(null);
  const [loading, setLoading] = useState(false);
  const [navigatingCategoryId, setNavigatingCategoryId] = useState<
    string | null
  >(null);

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

  const handleBoardPress = (categoryId: string, createdBy: string) => {
    // Prevent navigation if already navigating
    if (navigatingCategoryId) return;

    // Set the navigating state
    setNavigatingCategoryId(categoryId);
    setLoading(true);

    // Navigate to the category
    router.push({
      pathname: "/screens/guardian/category/[categoryId]",
      params: {
        categoryId: categoryId,
        creatorId: createdBy,
      },
    });

    // Reset navigating state after a delay (fallback in case navigation doesn't complete)
    setTimeout(() => {
      setNavigatingCategoryId(null);
      setLoading(false);
    }, 2000);
  };

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
        <ScrollView showsVerticalScrollIndicator={false}>
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
                    handleBoardPress(category.id, category.created_by);
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
      {navigatingCategoryId && (
        <View style={styles.boardLoadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      )}
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
  boardWrapper: {
    position: "relative",
  },
  boardLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 200,
  },
  loadingText: {
    fontFamily: "Poppins",
    fontSize: 16,
    marginTop: 10,
    color: COLORS.black,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 200,
  },
  emptyText: {
    fontFamily: "Poppins",
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gray,
    textAlign: "center",
  },
});

export default ManageBoardsScreen;

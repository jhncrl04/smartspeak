import Board from "@/components/Board";
import FabMenu from "@/components/FabMenu";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import SkeletonCard from "@/components/SkeletonCard";
import AddCategoryModal from "@/components/ui/AddCategoryModal";
import COLORS from "@/constants/Colors";
import getCurrentUid from "@/helper/getCurrentUid";
import { useCategoriesStore } from "@/stores/categoriesStores";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";

const ManageBoardsScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const { categories } = useCategoriesStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<"add" | null>(null);

  const [isScreenLoading, setIsScreenLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "my-categories" | "system"
  >("all");
  const [navigatingCategoryId, setNavigatingCategoryId] = useState<
    string | null
  >(null);

  const uid = getCurrentUid();

  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isScreenLoading ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isScreenLoading, isFiltering]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsScreenLoading(false);
      setIsFiltering(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isFiltering]);

  const mappedCateories = categories.filter((category) => {
    return category.created_by === uid || category.created_by_role === "ADMIN";
  });

  const filteredCategories = mappedCateories
    .filter((category) => {
      if (searchQuery.trim()) {
        // Filter by search query (case-insensitive)
        const query = searchQuery.toLowerCase().trim();
        const categoryName = category.category_name.toLowerCase();
        if (!categoryName.includes(query)) return false;
      }

      // Category filter
      if (activeFilter === "my-categories") {
        return category.created_by === uid;
      } else if (activeFilter === "system") {
        return category.created_by_role === "ADMIN";
      }

      return true;
    })
    .sort((a, b) => {
      const aIsUserCreated = a.created_by === uid;
      const bIsUserCreated = b.created_by === uid;

      if (aIsUserCreated && !bIsUserCreated) return -1;
      if (!aIsUserCreated && bIsUserCreated) return 1;

      const categoryA = (a.category_name || "").toLowerCase();
      const categoryB = (b.category_name || "").toLowerCase();

      if (categoryA !== categoryB) {
        return categoryA.localeCompare(categoryB);
      }

      return a.category_name
        .toLowerCase()
        .localeCompare(b.category_name.toLowerCase());
    });

  const handleBoardPress = (categoryId: string, createdBy: string) => {
    // Prevent navigation if already navigating
    if (navigatingCategoryId) return;

    // Set the navigating state
    setNavigatingCategoryId(categoryId);

    // Navigate to the category
    router.push({
      pathname: "/screens/teacher/category/[categoryId]",
      params: {
        categoryId: categoryId,
        creatorId: createdBy,
      },
    });

    // Reset navigating state after a delay (fallback in case navigation doesn't complete)
    setTimeout(() => {
      setNavigatingCategoryId(null);
    }, 2000);
  };

  const handleSearch = (query: string) => {
    setSearching(true);
    setSearchQuery(query);

    setTimeout(() => {
      setSearching(false);
    }, 1000);
  };

  return (
    <>
      <AddCategoryModal
        visible={activeModal === "add"}
        onClose={() => setActiveModal(null)}
      />
      <View style={styles.container}>
        <Sidebar userRole="teacher" onNavigate={handleNavigation} />
        <ScrollView
          decelerationRate="fast" // slows down the momentum
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mainContentContainer}>
            <PageHeader
              pageTitle="Manage Categories"
              hasFilter={false}
              searchPlaceholder="Search Category"
              collectionToSearch="pecsCategories"
              onSearch={(val) => {
                handleSearch(val as string);
              }}
              query="local"
            />
            <View style={styles.filterContainer}>
              {[
                { id: "all", label: "All" },
                { id: "my-categories", label: "My Categories" },
                { id: "system", label: "System Default" },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterButton,
                    activeFilter === filter.id && styles.filterButtonActive,
                  ]}
                  onPress={() => {
                    setIsFiltering(true);
                    setActiveFilter(
                      filter.id as "all" | "my-categories" | "system"
                    );
                  }}
                >
                  <Text
                    style={[
                      styles.filterText,
                      activeFilter === filter.id && styles.filterTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {isScreenLoading || isFiltering || searching ? (
              <SkeletonCard type="board" />
            ) : (
              <Animated.View
                style={[styles.boardContainer, { opacity: fadeAnim }]}
              >
                {filteredCategories.length === 0 ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins",
                        fontSize: 16,
                        fontWeight: 600,
                        color: COLORS.gray,
                      }}
                    >
                      No Categories found.
                    </Text>
                  </View>
                ) : (
                  filteredCategories.map((category, index) => (
                    <Board
                      categoryId={category.id}
                      key={category.id}
                      routerHandler={() => {
                        handleBoardPress(category.id, category.created_by);
                      }}
                    />
                  ))
                )}
              </Animated.View>
            )}
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
  filterContainer: {
    flexDirection: "row",
    gap: 10,
  },
  filterButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  filterButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  filterText: {
    fontWeight: "600",
    color: COLORS.black,
    fontSize: 14,
  },
  filterTextActive: {
    color: COLORS.white,
  },
});

export default ManageBoardsScreen;

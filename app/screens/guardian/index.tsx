import FabMenu from "@/components/FabMenu";
import LearnerCard from "@/components/LearnerCard";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import SkeletonCard from "@/components/SkeletonCard";
import AddChildModal from "@/components/ui/AddChildModal";
import LoadingScreen from "@/components/ui/LoadingScreen";
import COLORS from "@/constants/Colors";
import { useAuthStore } from "@/stores/userAuthStore";
import { useUsersStore } from "@/stores/userStore";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, View } from "react-native";

const ChildManagementScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const user = useAuthStore((state) => state.user);

  const handledChild = useAuthStore.getState().user?.handledChildren;

  const users = useUsersStore((state) => state.users);
  const children = users.filter((user) => handledChild?.includes(user.id));

  const [searchQuery, setSearchQuery] = useState<string>("");

  const [activeModal, setActiveModal] = useState<"add-child" | null>(null);

  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Filter children and search query
  const mappedChildren = children.filter((child) => {
    // If no search query, show all students in section
    if (!searchQuery.trim()) return true;

    // Filter by search query (case-insensitive)
    const query = searchQuery.toLowerCase().trim();
    const firstName = child.first_name.toLowerCase();
    const lastName = child.last_name.toLowerCase();
    const fullName = `${firstName} ${lastName}`;

    return (
      firstName.includes(query) ||
      lastName.includes(query) ||
      fullName.includes(query)
    );
  });

  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Add fade animation when loading changes
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: searching ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [searching]);

  const handleProfilePress = (learnerId: string) => {
    try {
      router.push({
        pathname:
          user?.role.toLowerCase() === "guardian"
            ? `/screens/guardian/user/[userId]`
            : "/screens/teacher/user/[userId]",
        params: {
          userId: learnerId,
        },
      });
    } catch (error) {
      console.error("Error loading learner data:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
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
      <AddChildModal
        visible={activeModal === "add-child"}
        onClose={() => setActiveModal(null)}
      />
      <View style={styles.container}>
        <Sidebar userRole="guardian" onNavigate={handleNavigation} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.pageContainer}>
            <PageHeader
              collectionToSearch="users"
              onSearch={(query) => {
                handleSearch(query as string);
              }}
              query="local"
              pageTitle="Manage Child"
              hasFilter={false}
              searchPlaceholder="Search Child"
            />
            <View
              style={{
                paddingVertical: 20,
              }}
            >
              {loading || searching ? (
                <SkeletonCard type="learner" />
              ) : (
                <Animated.View
                  style={[styles.cardContainer, { opacity: fadeAnim }]}
                >
                  {mappedChildren.length > 0 ? (
                    mappedChildren.map((child) => (
                      <LearnerCard
                        key={child.id}
                        learnerId={child.id}
                        cardType="profile"
                        handleProfilePress={() => handleProfilePress(child.id)}
                      />
                    ))
                  ) : (
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
                          fontWeight: "600",
                          color: COLORS.gray,
                        }}
                      >
                        No child found.
                      </Text>
                    </View>
                  )}
                </Animated.View>
              )}
            </View>
          </View>
        </ScrollView>
        <FabMenu
          page="children"
          actions={{ add_child: () => setActiveModal("add-child") }}
        />
      </View>
      <LoadingScreen visible={loading} />
    </>
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
    gap: 15,
  },
});

export default ChildManagementScreen;

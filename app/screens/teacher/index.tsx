import LearnerCard from "@/components/LearnerCard";
import PageHeader from "@/components/PageHeader";
import SectionTabs from "@/components/SectionTabs";
import Sidebar from "@/components/Sidebar";
import SkeletonCard from "@/components/SkeletonCard";
import LoadingScreen from "@/components/ui/LoadingScreen";
import COLORS from "@/constants/Colors";
import {
  useGradeLevelsStore,
  useSectionsStore,
} from "@/stores/gradeSectionsStore";
import { useAuthStore } from "@/stores/userAuthStore";
import { useUsersStore } from "@/stores/userStore";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ManageLearnersScreen = () => {
  const handleNavigation = useCallback((screen: string) => {
    router.push(screen as any);
  }, []);

  const {
    sections,
    isLoading: sectionLoading,
    error: sectionError,
  } = useSectionsStore();
  const {
    gradeLevels,
    isLoading: gradeLevelLoading,
    error: gradeLevelError,
  } = useGradeLevelsStore();
  const { users: learners, isLoading: learnersLoading } = useUsersStore();
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [activeSection, setActiveSection] = useState<string | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Map sections with grade levels
  const mappedSection = useMemo(() => {
    return sections
      .map((section) => {
        const gradeLevel = gradeLevels.find((gl) => gl.id === section.grade_id);
        return { gradeLevelInfo: gradeLevel, sectionInfo: section };
      })
      .filter((item) => item.gradeLevelInfo);
  }, [sections, gradeLevels]);

  // Set initial active section
  useEffect(() => {
    if (mappedSection.length > 0 && !activeSection) {
      setActiveSection(mappedSection[0].sectionInfo.id);
    }
  }, [mappedSection.length, activeSection]);

  // Get filtered students
  const filteredStudents = useMemo(() => {
    const section = sections.find((s) => s.id === activeSection);
    return section?.students || [];
  }, [sections, activeSection]);

  // Map and filter students by search
  const mappedStudents = useMemo(() => {
    return learners
      .filter((learner) => {
        if (!filteredStudents.includes(learner.id as never)) return false;
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase().trim();
        const firstName = learner.first_name.toLowerCase();
        const lastName = learner.last_name.toLowerCase();
        const fullName = `${firstName} ${lastName}`;

        return (
          firstName.includes(query) ||
          lastName.includes(query) ||
          fullName.includes(query)
        );
      })
      .sort((a, b) => a.first_name.localeCompare(b.first_name));
  }, [learners, filteredStudents, searchQuery]);

  // Fade animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: searching ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [searching, fadeAnim, loading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [loading]);

  const handleSearch = useCallback((query: string) => {
    setSearching(true);
    setSearchQuery(query);
    setTimeout(() => {
      setSearching(false);
    }, 1000);
  }, []);

  const handleProfilePress = useCallback(
    (learnerId: string, onSection: string) => {
      if (loading) return;

      setLoading(true);
      router.push({
        pathname:
          user?.role.toLowerCase() === "guardian"
            ? `/screens/guardian/user/[userId]`
            : "/screens/teacher/user/[userId]",
        params: {
          userId: learnerId,
          sectionId: onSection,
        },
      });

      setTimeout(() => {
        setLoading(false);
      }, 500);
    },
    [user?.role, loading]
  );

  const handleSectionPress = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
  }, []);

  // Loading state
  if (sectionLoading || gradeLevelLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Error state
  if (sectionError || gradeLevelError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>
          Error loading data: {sectionError || gradeLevelError}
        </Text>
      </View>
    );
  }

  console.log(user?.handledChildren);

  return (
    <>
      <View style={styles.container}>
        <Sidebar userRole="teacher" onNavigate={handleNavigation} />
        <ScrollView
          decelerationRate="fast"
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          <View style={styles.pageContainer}>
            <PageHeader
              pageTitle="Manage Learners"
              hasFilter={false}
              searchPlaceholder="Search Learner"
              onSearch={(query) => handleSearch(query as string)}
              collectionToSearch="cards"
              query="local"
            />

            {/* Tabs */}
            <View
              style={{
                flexDirection: "row",
                gap: 20,
                marginVertical: 15,
              }}
            >
              <ScrollView
                style={styles.sectionScrollview}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                <View style={styles.tabsContainer}>
                  {mappedSection.length > 0 ? (
                    mappedSection.map((s) => (
                      <SectionTabs
                        key={s.sectionInfo.id}
                        active={s.sectionInfo.id === activeSection}
                        label={`${s.gradeLevelInfo?.name} - ${s.sectionInfo.name}`}
                        onPress={() => handleSectionPress(s.sectionInfo.id)}
                      />
                    ))
                  ) : (
                    <SectionTabs
                      active={true}
                      label="No Section Found"
                      onPress={() => {}}
                    />
                  )}
                </View>
              </ScrollView>
            </View>

            {/* Students */}
            <View>
              {loading || searching ? (
                <SkeletonCard type="learner" />
              ) : (
                <Animated.View
                  style={[styles.cardContainer, { opacity: fadeAnim }]}
                >
                  {mappedStudents.length > 0 ? (
                    mappedStudents.map((student) => (
                      <LearnerCard
                        key={student.id}
                        cardType="profile"
                        learnerId={student.id}
                        onSection={activeSection}
                        handleProfilePress={() =>
                          handleProfilePress(student.id, activeSection!)
                        }
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
                          fontWeight: 600,
                          color: COLORS.gray,
                        }}
                      >
                        No students found.
                      </Text>
                    </View>
                  )}
                </Animated.View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
      <LoadingScreen visible={loading} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    position: "relative",
  },
  pageContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: "row",
    gap: 5,
  },
  sectionScrollview: {},
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

export default ManageLearnersScreen;

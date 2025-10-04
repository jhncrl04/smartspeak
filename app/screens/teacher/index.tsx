import LearnerCard from "@/components/LearnerCard";
import PageHeader from "@/components/PageHeader";
import SectionTabs from "@/components/SectionTabs";
import Sidebar from "@/components/Sidebar";
import COLORS from "@/constants/Colors";
import { calculateAge } from "@/helper/calculateAge";
import {
  useGradeLevelsStore,
  useSectionsStore,
} from "@/stores/gradeSectionsStore";
import { useUsersStore } from "@/stores/userStore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ManageLearnersScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const [loading, setLoading] = useState(true);
  // const [sections, setSections] = useState<GradeAndSection[]>([]);
  const [activeSection, setActiveSection] = useState<string | undefined>(
    undefined
  );
  const [activeModal, setActiveModal] = useState<
    "add" | "edit" | "move" | null
  >(null);

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

  const {
    users: learners,
    isLoading: learnersLoading,
    error: learnersError,
  } = useUsersStore();

  const mappedSection = sections
    .map((section) => {
      const gradeLevel = gradeLevels.find((gl) => gl.id === section.grade_id);

      return {
        gradeLevelInfo: gradeLevel,
        sectionInfo: section,
      };
    })
    .filter((item) => item.gradeLevelInfo);

  useEffect(() => {
    if (mappedSection.length > 0 && !activeSection) {
      setActiveSection(mappedSection[0].sectionInfo.id);
    }
  }, [mappedSection, activeSection]);

  if (sectionLoading || gradeLevelLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (sectionError || gradeLevelError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>
          Error loading data: {sectionError || gradeLevelError}
        </Text>
      </View>
    );
  }

  const filteredStudents: string[] =
    sections.find((s) => s.id === activeSection)?.students || [];

  const mappedStudents = learners.filter((learner) => {
    if (filteredStudents.includes(learner.id)) return learner;
  });

  return (
    <>
      {/* <AddLearnerModal
        onClose={() => setActiveModal(null)}
        visible={activeModal === "add"}
      /> */}
      <View style={styles.container}>
        <Sidebar userRole="teacher" onNavigate={handleNavigation} />
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={styles.pageContainer}>
            <PageHeader
              pageTitle="Manage Learners"
              hasFilter={false}
              searchPlaceholder="Search Learner"
              onSearch={(results) => {}}
              collectionToSearch="users"
              query="myStudent"
            />
            {/* Tabs */}
            <View
              style={{
                flexDirection: "row",
                gap: 20,
                marginVertical: 15,
                borderBottomColor: COLORS.gray,
                borderBottomWidth: 1,
              }}
            >
              <ScrollView
                style={styles.sectionScrollview}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                <View style={styles.tabsContainer}>
                  {mappedSection.map((s) => (
                    <SectionTabs
                      key={s.sectionInfo.id}
                      active={s.sectionInfo.id === activeSection}
                      label={`${s.gradeLevelInfo?.name} - ${s.sectionInfo.name}`}
                      onPress={() => setActiveSection(s.sectionInfo.id)}
                    />
                  ))}

                  {sections.length <= 0 && (
                    <SectionTabs
                      active={true}
                      label={`No Section Found`}
                      onPress={() => {}}
                    />
                  )}
                </View>
              </ScrollView>
            </View>

            {/* Students */}
            <View style={styles.cardContainer}>
              {mappedStudents.length > 0 ? (
                mappedStudents.map((student) => (
                  <LearnerCard
                    key={student.id}
                    cardType="profile"
                    gender={student.gender}
                    image={student.profile_pic}
                    learnerId={student.id}
                    onSection={activeSection}
                    name={`${student.first_name} ${student.last_name}`}
                    age={calculateAge(student.date_of_birth)}
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
                    No students in this section.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
        {/* hide adding of learner on teacher side for now */}
        {/* <FabMenu
          page="learners"
          actions={{
            add: () => setActiveModal("add"),
            edit: () => setActiveModal("edit"),
          }}
        /> */}
      </View>
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

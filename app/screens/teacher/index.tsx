import FabMenu from "@/components/FabMenu";
import LearnerCard from "@/components/LearnerCard";
import PageHeader from "@/components/PageHeader";
import SectionTabs from "@/components/SectionTabs";
import Sidebar from "@/components/Sidebar";
import AddLearnerModal from "@/components/ui/AddLearnerModal";
import COLORS from "@/constants/Colors";
import { calculateAge } from "@/helper/calculateAge";
import { getSectionsWithStudents } from "@/services/sectionService";
import { GradeAndSection } from "@/types/gradeSection";
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
  const [sections, setSections] = useState<GradeAndSection[]>([]);
  const [activeSection, setActiveSection] = useState<string | undefined>(
    undefined
  );
  const [activeModal, setActiveModal] = useState<
    "add" | "edit" | "move" | null
  >(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getSectionsWithStudents();
        setSections(data);
        if (data.length > 0) setActiveSection(data[0].sectionId);
      } catch (err) {
        console.error("Error fetching sections:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const filteredStudents =
    sections.find((s) => s.sectionId === activeSection)?.learners || [];

  return (
    <>
      <AddLearnerModal
        onClose={() => setActiveModal(null)}
        visible={activeModal === "add"}
      />
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
                  {sections.map((s) => (
                    <SectionTabs
                      key={s.sectionId}
                      active={s.sectionId === activeSection}
                      label={`${s.gradeName} - ${s.sectionName}`}
                      onPress={() => setActiveSection(s.sectionId)}
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
            <View>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <LearnerCard
                    key={student.id}
                    cardType="profile"
                    gender={student.gender}
                    image={student.profile_pic}
                    learnerId={student.id}
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
        <FabMenu
          page="learners"
          actions={{
            add: () => setActiveModal("add"),
            edit: () => setActiveModal("edit"),
          }}
        />
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
});

export default ManageLearnersScreen;

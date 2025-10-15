import COLORS from "@/constants/Colors";
import { getSectionList } from "@/services/sectionService";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Octicons";
import MySearchBar from "../mySearchBar";
import AddChildPreview from "./AddChildPreview";
import { showToast } from "./MyToast";

type Section = { label: string | null; value: string | null };

type Props = {
  visible: boolean;
  onClose: () => void;
};

const AddLearnerModal = ({ visible, onClose }: Props) => {
  const [step, setStep] = useState<"select-section" | "add-learners">(
    "select-section"
  );
  const [selectedSection, setSelectedSection] = useState<Section>({
    label: "",
    value: "",
  });

  const [results, setResults] = useState<any[]>([]);

  const [sections, setSections] = useState<Section[]>([
    { label: null, value: null },
  ]);

  useEffect(() => {
    const fetchSection = async () => {
      const results = await getSectionList();

      const mappedSections: Section[] = results.map((result) => ({
        label: `${result.gradeName} - ${result.sectionName}`,
        value: result.sectionId,
      }));

      setSections(mappedSections);
    };

    fetchSection();
  }, []);

  // console.log(sections);

  const handleClose = () => {
    setResults([]);
    setStep("select-section");
    setSelectedSection({ label: null, value: null });
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        showToast("success", "Modal has been closed.", "");
        handleClose();
      }}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContainer}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Icon name="x" size={22} color={COLORS.gray} />
          </TouchableOpacity>

          {/* Scrollable content */}
          <ScrollView
            style={styles.mainContainer}
            showsVerticalScrollIndicator={false}
          >
            {step === "select-section" && (
              <View>
                {/* Header */}
                <View style={styles.headerContainer}>
                  <Text style={styles.title}>Add Learners</Text>
                  <Text style={styles.subtitle}>
                    Select a section to add learners to
                  </Text>
                </View>

                {/* Sections List */}
                <View style={styles.sectionsContainer}>
                  {sections.map((s) => (
                    <TouchableOpacity
                      key={s.value}
                      style={styles.sectionCard}
                      onPress={() => {
                        setSelectedSection({ label: s.label, value: s.value });
                        setStep("add-learners");
                      }}
                    >
                      <Text style={styles.sectionLabel}>{s.label}</Text>
                      <Icon
                        name="chevron-right"
                        size={20}
                        color={COLORS.gray}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {step === "add-learners" && (
              <View style={styles.addLearnersContainer}>
                {/* Header with back button */}
                <View style={styles.headerContainer}>
                  <View style={styles.headerWithBack}>
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={() => setStep("select-section")}
                    >
                      <Icon name="arrow-left" color={COLORS.accent} size={20} />
                      <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                      gap: 10,
                    }}
                  >
                    <Text style={styles.title}>Add Learners</Text>
                    <Text style={styles.subtitle}>
                      to {selectedSection.label}
                    </Text>
                  </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                  <MySearchBar
                    collectionToSearch="users"
                    onSearch={(results) => {
                      setResults(results);
                    }}
                    placeholder="Search Learner ID or Email"
                    query="newLearner"
                  />
                </View>

                {/* Results */}
                <View style={styles.resultsContainer}>
                  {results.map((result, i) => (
                    <AddChildPreview
                      key={i}
                      learnerName={`${result.first_name} ${result.last_name}`}
                      learnerProfile={result?.profile_pic}
                      learnerId={result.id}
                      sectionId={selectedSection.value as string}
                    />
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.shadow,
    flexDirection: "row",
    justifyContent: "flex-end", // pushes modal to right side
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: "50%", // side sheet style
    height: "100%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 16,
    padding: 6,
    zIndex: 10,
  },
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.black,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
  },
  sectionsContainer: {
    gap: 12,
  },
  sectionCard: {
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.black,
    flex: 1,
  },
  addLearnersContainer: {
    flex: 1,
  },
  headerWithBack: {},
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  backText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: "500",
  },
  searchContainer: {
    marginBottom: 20,
  },
  resultsContainer: {
    gap: 10,
    paddingBottom: 20,
  },
});

export default AddLearnerModal;

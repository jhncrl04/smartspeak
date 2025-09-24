import COLORS from "@/constants/Colors";
import { getSectionList } from "@/services/sectionService";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Octicons";
import ActionLink from "../ActionLink";
import MySearchBar from "../mySearchBar";
import AddChildPreview from "./AddChildPreview";
import HorizontalLine from "./HorizontalLine";

type Section = { label: string | null; value: string | null };

type Props = {
  visible: boolean;
  onClose: () => void;
};

const sections = [
  { label: "Section 1", value: "section-1" },
  { label: "Section 2", value: "section-2" },
  { label: "Section 3", value: "section-3" },
  { label: "Section 4", value: "section-4" },
];

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

      console.log("Mapped:", mappedSections);
      setSections(mappedSections);
    };

    fetchSection();
  }, []);

  console.log(sections);

  const handleClose = () => {
    setResults([]);
    setStep("select-section");
    setSelectedSection({ label: null, value: null });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {step === "select-section" && (
            <View>
              <Text style={styles.header}>Select Section</Text>
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
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step === "add-learners" && (
            <View style={{ flex: 1 }}>
              <View
                style={{
                  justifyContent: "space-between",
                  flexDirection: "row",
                }}
              >
                <View>
                  <ActionLink
                    text="Back"
                    clickHandler={() => setStep("select-section")}
                    icon={
                      <Icon name="arrow-left" color={COLORS.accent} size={20} />
                    }
                  />
                </View>

                <Text style={styles.header}>
                  Add Learners to {selectedSection.label}
                </Text>

                <View>
                  <ActionLink text="Close" clickHandler={handleClose} />
                </View>
              </View>

              <View style={{ marginVertical: 5 }}>
                <HorizontalLine />
              </View>

              <View>
                <MySearchBar
                  collectionToSearch="users"
                  onSearch={(results) => {
                    setResults(results);
                  }}
                  placeholder="Search Learner ID or Email"
                  query="newLearner"
                />
              </View>

              <ScrollView style={styles.scroll}>
                {results.map((result, i) => (
                  <AddChildPreview
                    key={i}
                    learnerName={`${result.first_name} ${result.last_name}`}
                    learnerProfile={result?.profile_pic}
                    learnerId={result.id}
                    sectionId={selectedSection.value as string}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default AddLearnerModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.shadow,
  },
  modalContent: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 16,
    maxHeight: "90%",
    width: "85%",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 0,
  },
  sectionCard: {
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  back: {
    color: COLORS.accent,
    fontSize: 16,
    marginBottom: 10,
  },
  scroll: {
    marginTop: 10,
  },
});

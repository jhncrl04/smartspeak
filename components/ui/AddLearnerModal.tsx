import COLORS from "@/constants/Colors";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Octicons";
import MySearchBar from "../mySearchBar";
import AddChildPreview from "./AddChildPreview";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const AddLearnerModal = ({ visible, onClose }: Props) => {
  const [results, setResults] = useState<any[]>([]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={() => {
        setResults([]);
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="x" size={22} color={COLORS.gray} />
          </TouchableOpacity>

          <View style={{ flex: 1, gap: 10 }}>
            <View>
              <MySearchBar
                collectionToSearch="users"
                onSearch={(results) => {
                  setResults(results);
                }}
                placeholder="Search Learner ID"
                query="newLearner"
              />
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: "75%" }}
            >
              <View style={styles.profileContainer}>
                {results?.map((result, index) => (
                  <AddChildPreview
                    learnerName={`${result.firstname} ${result.last_name}`}
                    learnerProfile={result?.profile}
                    learnerId={result.id}
                    key={index}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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

    position: "relative",
    borderRadius: 16,
    maxHeight: "90%",
    width: "85%",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButton: { position: "absolute", top: 15, right: 20 },
  profileContainer: {
    gap: 10,
  },
});

export default AddLearnerModal;

import COLORS from "@/constants/Colors";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Octicons";

import { submitStudentProgressReport } from "@/services/reportService";
import { useAuthStore } from "@/stores/userAuthStore";
import { Progress } from "@/types/progressReport";
import firestore from "@react-native-firebase/firestore";
import DatePicker from "react-native-date-picker";

type ProgressReportModalProps = {
  visible: boolean;
  onClose: () => void;
  studentName: string;
  studentId: string;
  onSubmit: () => void;
};

const ProgressReportModal = ({
  visible,
  onClose,
  studentName,
  studentId,
  onSubmit,
}: ProgressReportModalProps) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [reportTitle, setReportTitle] = useState("");

  const user = useAuthStore().user;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDateRangeText = () => {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const handleSubmit = () => {
    if (!remarks.trim()) {
      // Could add Alert here for validation
      return;
    }
    // onSubmit();

    const progress: Progress = {
      progress_of_learner_id: studentId,
      report_title: reportTitle,
      teachers_remarks: remarks,
      start_date: firestore.Timestamp.fromDate(startDate),
      end_date: firestore.Timestamp.fromDate(endDate),
      teacher_id: user?.uid,
      teacher_first_name: user?.fname,
      teacher_last_name: user?.lname,
    };

    submitStudentProgressReport(progress);

    onClose();
  };

  const canSubmit = remarks.trim() !== "";

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setStartDate(new Date());
      setEndDate(new Date());
      setRemarks("");
      setReportTitle("");
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContainer}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="x" size={22} color={COLORS.gray} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Icon name="graph" size={24} color={COLORS.accent} />
            <Text style={styles.title}>Progress Report</Text>
            <Text style={styles.subtitle}>for {studentName}</Text>
          </View>

          {/* Scrollable content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Date Range */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Date Range</Text>

              {/* Date Range Display */}
              <View style={styles.dateRangeContainer}>
                <Text style={styles.dateRangeText}>{getDateRangeText()}</Text>
              </View>

              {/* Date Selection Buttons */}
              <View style={styles.dateButtonsContainer}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Icon name="calendar" size={16} color={COLORS.accent} />
                  <Text style={styles.dateButtonText}>Start Date</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Icon name="calendar" size={16} color={COLORS.accent} />
                  <Text style={styles.dateButtonText}>End Date</Text>
                </TouchableOpacity>
              </View>

              {/* Start Date Picker */}
              <DatePicker
                modal
                open={showStartDatePicker}
                date={startDate}
                mode="date"
                onConfirm={(date) => {
                  setShowStartDatePicker(false);
                  setStartDate(date);
                  // If start date is after end date, update end date
                  if (date > endDate) {
                    setEndDate(date);
                  }
                }}
                onCancel={() => {
                  setShowStartDatePicker(false);
                }}
                title="Select Start Date"
              />

              {/* End Date Picker */}
              <DatePicker
                modal
                open={showEndDatePicker}
                date={endDate}
                mode="date"
                minimumDate={startDate} // End date cannot be before start date
                onConfirm={(date) => {
                  setShowEndDatePicker(false);
                  setEndDate(date);
                }}
                onCancel={() => {
                  setShowEndDatePicker(false);
                }}
                title="Select End Date"
              />
            </View>

            {/* Report Title */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Report Title *</Text>
              <TextInput
                placeholder="Set report title"
                value={reportTitle}
                onChangeText={setReportTitle}
                style={[styles.input]}
                multiline
                textAlignVertical="top"
                placeholderTextColor={COLORS.gray}
              />
            </View>

            {/* Teacher's Remarks */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Teacher's Remarks *</Text>
              <TextInput
                placeholder="Write detailed observations about the student's progress, achievements, and areas of improvement..."
                value={remarks}
                onChangeText={setRemarks}
                style={[styles.input, styles.textArea]}
                multiline
                textAlignVertical="top"
                placeholderTextColor={COLORS.gray}
              />
            </View>

            {/* Required fields note */}
            <Text style={styles.requiredNote}>* Required fields</Text>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.submitButton,
                !canSubmit && styles.submitButtonDisabled,
              ]}
              disabled={!canSubmit}
            >
              <Icon name="paper-airplane" size={16} color={COLORS.white} />
              <Text
                style={[
                  styles.submitText,
                  !canSubmit && styles.submitTextDisabled,
                ]}
              >
                Send Report
              </Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: "50%",
    height: "100%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || "#f0f0f0",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.black,
    minHeight: 44,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  dateRangeContainer: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  dateRangeText: {
    fontSize: 16,
    color: COLORS.black,
    textAlign: "center",
  },
  dateButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  dateButtonText: {
    color: COLORS.accent,
    fontWeight: "500",
    fontSize: 14,
  },
  requiredNote: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: "italic",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray || "#f0f0f0",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
    backgroundColor: COLORS.white,
    alignItems: "center",
  },
  cancelText: {
    color: COLORS.gray,
    fontWeight: "600",
    fontSize: 14,
  },
  submitButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.accent,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.lightGray || "#e0e0e0",
  },
  submitText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
  },
  submitTextDisabled: {
    color: COLORS.gray,
  },
});

export default ProgressReportModal;

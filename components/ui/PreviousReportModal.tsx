import COLORS from "@/constants/Colors";
import { formatDate, toDate } from "@/helper/formatDate";
import getCurrentUid from "@/helper/getCurrentUid";
import { fetchReportsForStudent } from "@/services/reportService";
import { Progress } from "@/types/progressReport";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Octicons";

type Report = {
  id: string;
  title: string;
  date: string;
  content: string;
  teacherName: string;
  status: "sent" | "draft" | "read";
};

type PreviousReportsModalProps = {
  visible: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
};

const PreviousReportsModal = ({
  visible,
  onClose,
  studentId,
  studentName,
}: PreviousReportsModalProps) => {
  const [reports, setReports] = useState<Progress[] | undefined>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Progress | null>(null);

  useEffect(() => {
    if (visible) {
      fetchReports();
    }
  }, [visible, studentId]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const data = await fetchReportsForStudent(studentId);
      setReports(data);
      // Simulate API delay
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      // setReports(mockReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "read":
        return COLORS.successBg || "#4CAF50";
      case "sent":
        return COLORS.accent;
      case "draft":
        return COLORS.warningBg || "#FF9800";
      default:
        return COLORS.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "read":
        return "Read";
      case "sent":
        return "Sent";
      case "draft":
        return "Draft";
      default:
        return "Unknown";
    }
  };

  const renderReportItem = ({ item }: { item: Progress }) => (
    <TouchableOpacity
      style={styles.reportItem}
      onPress={() => setSelectedReport(item)}
      activeOpacity={0.7}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportTitleContainer}>
          <Text style={styles.reportTitle} numberOfLines={2}>
            {item.report_title}
          </Text>
          {/* <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View> */}
        </View>
        <Icon name="chevron-right" size={16} color={COLORS.gray} />
      </View>
      <View style={styles.reportMeta}>
        <Text style={styles.reportDate}>
          {formatDate(toDate(item.start_date))} -{" "}
          {formatDate(toDate(item.end_date))}
        </Text>
        <Text style={styles.teacherName}>
          by{" "}
          {item.teacher_id === getCurrentUid()
            ? "You"
            : `Teacher ${item.teacher_last_name}`}
        </Text>
      </View>
      <Text style={styles.reportPreview} numberOfLines={2}>
        {item.teachers_remarks}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="file-text" size={64} color={COLORS.gray} />
      <Text style={styles.emptyStateTitle}>No Reports Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Progress reports will appear here once they are sent.
      </Text>
    </View>
  );

  const renderReportDetail = () => {
    if (!selectedReport) return null;

    return (
      <Modal
        visible={!!selectedReport}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.detailContainer}>
          <View style={styles.detailHeader}>
            <TouchableOpacity
              onPress={() => setSelectedReport(null)}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.detailHeaderTitle}>Progress Report</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.detailContent}>
            <View style={styles.detailTitleSection}>
              <Text style={styles.detailTitle}>
                {selectedReport.report_title}
              </Text>
              <View style={styles.detailMeta}>
                <Text style={styles.detailDate}>
                  {formatDate(toDate(selectedReport.start_date))} -{" "}
                  {formatDate(toDate(selectedReport.end_date))}
                </Text>
                <Text style={styles.detailTeacher}>
                  by{" "}
                  {selectedReport.teacher_id === getCurrentUid()
                    ? "You"
                    : `Teacher ${selectedReport.teacher_last_name}`}
                </Text>
                {/* <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(selectedReport.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(selectedReport.status)}
                  </Text>
                </View> */}
              </View>
            </View>

            <View style={styles.detailBody}>
              <Text style={styles.detailContentText}>
                {selectedReport.teachers_remarks}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="x" size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Previous Reports</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{studentName}</Text>
            <Text style={styles.reportCount}>
              {reports && reports.length} report
              {reports && reports.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.accent} />
              <Text style={styles.loadingText}>Loading reports...</Text>
            </View>
          ) : (
            <FlatList
              data={reports}
              keyExtractor={(item) => item.id as string}
              renderItem={renderReportItem}
              ListEmptyComponent={renderEmptyState}
              contentContainerStyle={[
                styles.listContainer,
                reports && reports.length === 0 && styles.emptyListContainer,
              ]}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </SafeAreaView>
      </Modal>

      {renderReportDetail()}
    </>
  );
};

export default PreviousReportsModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || "#f0f0f0",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    fontFamily: "Poppins",
  },
  placeholder: {
    width: 40,
  },
  studentInfo: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.lightGray || "#f8f8f8",
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    fontFamily: "Poppins",
    marginBottom: 4,
  },
  reportCount: {
    fontSize: 14,
    color: COLORS.gray,
    fontFamily: "Poppins",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.gray,
    fontFamily: "Poppins",
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
  },
  reportItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray || "#f0f0f0",
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  reportTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginRight: 8,
  },
  reportTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    fontFamily: "Poppins",
    lineHeight: 22,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: "Poppins",
  },
  reportMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reportDate: {
    fontSize: 12,
    color: COLORS.gray,
    fontFamily: "Poppins",
  },
  teacherName: {
    fontSize: 12,
    color: COLORS.gray,
    fontFamily: "Poppins",
  },
  reportPreview: {
    fontSize: 14,
    color: COLORS.black,
    fontFamily: "Poppins",
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.black,
    fontFamily: "Poppins",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    fontFamily: "Poppins",
    textAlign: "center",
    lineHeight: 20,
  },
  // Detail Modal Styles
  detailContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || "#f0f0f0",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  detailHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    fontFamily: "Poppins",
  },
  detailContent: {
    flex: 1,
    padding: 16,
  },
  detailTitleSection: {
    marginBottom: 24,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.black,
    fontFamily: "Poppins",
    lineHeight: 32,
    marginBottom: 12,
  },
  detailMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  detailDate: {
    fontSize: 14,
    color: COLORS.gray,
    fontFamily: "Poppins",
  },
  detailTeacher: {
    fontSize: 14,
    color: COLORS.gray,
    fontFamily: "Poppins",
  },
  detailBody: {
    flex: 1,
  },
  detailContentText: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: "Poppins",
    lineHeight: 24,
  },
});

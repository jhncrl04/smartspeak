import COLORS from "@/constants/Colors";
import { formatDate, toDate } from "@/helper/formatDate";
import getCurrentUid from "@/helper/getCurrentUid";
import { subscribeToStudentReports } from "@/services/reportService";
import { useLearnerSentencesStore } from "@/stores/learnerSentencesStore";
import { Progress } from "@/types/progressReport";
import { ScrollView } from "moti";
import React, { useEffect, useState } from "react";
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

type LearnerHistoryModalProps = {
  visible: boolean;
  onClose: () => void;
  learnerId: string;
  learnerName: string;
};

type TabType = "reports" | "sentences";

const LearnerHistoryModal = ({
  visible,
  onClose,
  learnerId,
  learnerName,
}: LearnerHistoryModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("reports");

  // Reports state
  const [reports, setReports] = useState<Progress[] | undefined>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsRefreshing, setReportsRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Progress | null>(null);

  // Sentences state
  const {
    sentences,
    isLoading: sentencesLoading,
    hasMore,
    fetchSentences,
    loadMore,
    clearSentences,
  } = useLearnerSentencesStore();
  const [sentencesRefreshing, setSentencesRefreshing] = useState(false);
  const [selectedSentence, setSelectedSentence] = useState<any>(null);

  useEffect(() => {
    if (!visible || !learnerId) return;

    // Set loading state
    setReportsLoading(true);

    // Subscribe to reports (loads from cache first, then updates)
    const unsubscribeReports = subscribeToStudentReports(
      learnerId,
      (data) => {
        setReports(data);
        setReportsLoading(false);
      },
      (error) => {
        console.error("Error fetching reports:", error);
        setReportsLoading(false);
      }
    );

    // Fetch  sentences
    fetchSentences(learnerId);

    // Cleanup
    return () => {
      unsubscribeReports();
      if (!visible) {
        clearSentences();
      }
    };
  }, [visible, learnerId]);

  const onReportsRefresh = async () => {
    setReportsRefreshing(true);
    setTimeout(() => setReportsRefreshing(false), 500);
  };
  const onSentencesRefresh = async () => {
    setSentencesRefreshing(true);
    await fetchSentences(learnerId);
    setSentencesRefreshing(false);
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "Unknown date";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatFullDate = (timestamp: any) => {
    if (!timestamp) return "Unknown date";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // REPORTS RENDERING
  const renderReportItem = ({ item }: { item: Progress }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => setSelectedReport(item)}
      activeOpacity={0.7}
    >
      <View style={styles.itemHeader}>
        <View style={styles.itemTitleContainer}>
          <Icon name="file" size={16} color={COLORS.accent} />
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.report_title}
          </Text>
        </View>
        <Icon name="chevron-right" size={16} color={COLORS.gray} />
      </View>
      <View style={styles.itemMeta}>
        <Text style={styles.itemDate}>
          {formatDate(toDate(item.start_date))} -{" "}
          {formatDate(toDate(item.end_date))}
        </Text>
        <Text style={styles.itemSubtext}>
          by{" "}
          {item.teacher_id === getCurrentUid()
            ? "You"
            : `Teacher ${item.teacher_last_name}`}
        </Text>
      </View>
      <Text style={styles.itemPreview} numberOfLines={2}>
        {item.teachers_remarks}
      </Text>
    </TouchableOpacity>
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

  // SENTENCES RENDERING
  const renderSentenceItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => setSelectedSentence(item)}
      activeOpacity={0.7}
    >
      <View style={styles.itemHeader}>
        <View style={styles.itemTitleContainer}>
          <Icon name="comment" size={16} color={COLORS.accent} />
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.sentence_text}
          </Text>
        </View>
        <Icon name="chevron-right" size={16} color={COLORS.gray} />
      </View>
      <View style={styles.itemMeta}>
        <Text style={styles.itemDate}>{formatTimestamp(item.timestamp)}</Text>
        {item.cards_in_sentence && item.cards_in_sentence.length > 0 && (
          <View style={styles.cardsBadge}>
            <Icon name="stack" size={12} color={COLORS.gray} />
            <Text style={styles.badgeText}>
              {item.cards_in_sentence.length} cards
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const handleLoadMore = () => {
    if (!sentencesLoading && hasMore && activeTab === "sentences") {
      loadMore(learnerId);
    }
  };

  const renderSentenceDetail = () => {
    if (!selectedSentence) return null;

    const categories = selectedSentence.cards_in_sentence
      ? [
          ...new Set(
            selectedSentence.cards_in_sentence.map((card: any) => card.category)
          ),
        ]
      : [];

    return (
      <Modal
        visible={!!selectedSentence}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.detailContainer}>
          <View style={styles.detailHeader}>
            <TouchableOpacity
              onPress={() => setSelectedSentence(null)}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.detailHeaderTitle}>Sentence Details</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView>
            <View style={styles.detailContent}>
              <View style={styles.detailTitleSection}>
                <View style={styles.sentenceIconContainer}>
                  <Icon name="quote" size={24} color={COLORS.accent} />
                </View>
                <Text style={styles.detailSentence}>
                  "{selectedSentence.sentence_text}"
                </Text>
                <View style={styles.detailMeta}>
                  <Text style={styles.detailDate}>
                    {formatFullDate(selectedSentence.timestamp)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailBody}>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Icon name="stack" size={20} color={COLORS.gray} />
                    <Text style={styles.infoLabel}>Cards Used</Text>
                  </View>
                  <Text style={styles.infoValue}>
                    {selectedSentence.cards_in_sentence?.length || 0} card(s)
                  </Text>
                </View>

                {categories.length > 0 && (
                  <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <Icon name="tag" size={20} color={COLORS.gray} />
                      <Text style={styles.infoLabel}>Categories Used</Text>
                    </View>
                    <View style={styles.categoryTags}>
                      {categories.map((cat, index) => (
                        <View key={index} style={styles.categoryTag}>
                          <Text style={styles.categoryTagText}>{`${cat}`}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  // EMPTY STATES
  const renderReportsEmpty = () => (
    <View style={styles.emptyState}>
      <Icon name="file" size={64} color={COLORS.gray} />
      <Text style={styles.emptyStateTitle}>No Reports Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Progress reports will appear here once they are sent.
      </Text>
    </View>
  );

  const renderSentencesEmpty = () => (
    <View style={styles.emptyState}>
      <Icon name="comment-discussion" size={64} color={COLORS.gray} />
      <Text style={styles.emptyStateTitle}>No Sentences Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        {learnerName} hasn't created any sentences yet.
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!sentencesLoading || activeTab !== "sentences") return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.accent} />
      </View>
    );
  };

  // MAIN CONTENT
  const isLoading = activeTab === "reports" ? reportsLoading : sentencesLoading;
  const isRefreshing =
    activeTab === "reports" ? reportsRefreshing : sentencesRefreshing;
  const onRefresh =
    activeTab === "reports" ? onReportsRefresh : onSentencesRefresh;

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
            <Text style={styles.headerTitle}>{learnerName} History</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "reports" && styles.tabActive]}
              onPress={() => setActiveTab("reports")}
            >
              <Icon
                name="file"
                size={18}
                color={activeTab === "reports" ? COLORS.accent : COLORS.gray}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "reports" && styles.tabTextActive,
                ]}
              >
                Reports
              </Text>
              {reports && reports.length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{reports.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "sentences" && styles.tabActive,
              ]}
              onPress={() => setActiveTab("sentences")}
            >
              <Icon
                name="comment"
                size={18}
                color={activeTab === "sentences" ? COLORS.accent : COLORS.gray}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "sentences" && styles.tabTextActive,
                ]}
              >
                Sentences
              </Text>
              {sentences.length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{sentences.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {isLoading &&
          (activeTab === "reports" ? !reports?.length : !sentences.length) ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.accent} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : activeTab === "reports" ? (
            <FlatList
              data={reports}
              keyExtractor={(item) => item.id as string}
              renderItem={renderReportItem}
              ListEmptyComponent={renderReportsEmpty}
              contentContainerStyle={[
                styles.listContainer,
                !reports?.length && styles.emptyListContainer,
              ]}
              refreshControl={
                <RefreshControl
                  refreshing={reportsRefreshing}
                  onRefresh={onReportsRefresh}
                />
              }
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <FlatList
              data={sentences}
              keyExtractor={(item) => item.id}
              renderItem={renderSentenceItem}
              ListEmptyComponent={renderSentencesEmpty}
              contentContainerStyle={[
                styles.listContainer,
                !sentences.length && styles.emptyListContainer,
              ]}
              refreshControl={
                <RefreshControl
                  refreshing={sentencesRefreshing}
                  onRefresh={onSentencesRefresh}
                />
              }
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              showsVerticalScrollIndicator={false}
            />
          )}
        </SafeAreaView>
      </Modal>

      {renderReportDetail()}
      {renderSentenceDetail()}
    </>
  );
};

export default LearnerHistoryModal;

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
  countText: {
    fontSize: 14,
    color: COLORS.gray,
    fontFamily: "Poppins",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray || "#f8f8f8",
  },
  tabActive: {
    backgroundColor: COLORS.accent + "15",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.gray,
    fontFamily: "Poppins",
  },
  tabTextActive: {
    color: COLORS.accent,
    fontWeight: "600",
  },
  tabBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
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
  listItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray || "#f0f0f0",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  itemTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginRight: 8,
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.black,
    fontFamily: "Poppins",
    lineHeight: 22,
  },
  itemMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemDate: {
    fontSize: 12,
    color: COLORS.gray,
    fontFamily: "Poppins",
  },
  itemSubtext: {
    fontSize: 12,
    color: COLORS.gray,
    fontFamily: "Poppins",
  },
  itemPreview: {
    fontSize: 14,
    color: COLORS.black,
    fontFamily: "Poppins",
    lineHeight: 20,
  },
  cardsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.lightGray || "#f8f8f8",
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: COLORS.gray,
    fontFamily: "Poppins",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
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
  sentenceIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 45,
    backgroundColor: COLORS.lightGray || "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    alignSelf: "center",
  },
  detailSentence: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    fontFamily: "Poppins",
    lineHeight: 32,
    marginBottom: 12,
    textAlign: "center",
    fontStyle: "italic",
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
    gap: 12,
  },
  detailContentText: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: "Poppins",
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: COLORS.lightGray || "#f8f8f8",
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray,
    fontFamily: "Poppins",
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: "Poppins",
    lineHeight: 22,
  },
  categoryTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryTag: {
    backgroundColor: COLORS.accent + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.accent + "40",
  },
  categoryTagText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.accent,
    fontFamily: "Poppins",
  },
  cardsList: {
    gap: 8,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray || "#e0e0e0",
  },
  cardPosition: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  cardPositionText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: "Poppins",
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.black,
    fontFamily: "Poppins",
    marginBottom: 2,
  },
  cardCategory: {
    fontSize: 12,
    color: COLORS.gray,
    fontFamily: "Poppins",
  },
});

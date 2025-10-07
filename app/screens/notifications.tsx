import Sidebar from "@/components/Sidebar";
import { formatDate, toDate } from "@/helper/formatDate";
import { markAsRead } from "@/services/notificationService";
import { respondToGuardianChangeRequest } from "@/services/userService";
import { useNotifsStore } from "@/stores/notificationsStore";
import { useAuthStore } from "@/stores/userAuthStore";
import { useUsersStore } from "@/stores/userStore";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Octicons";

const COLORS = {
  primary: "#6366f1",
  accent: "#8b5cf6",
  white: "#ffffff",
  black: "#000000",
  gray: "#6b7280",
  lightGray: "#e5e7eb",
  cardBg: "#f9fafb",
  shadow: "rgba(0,0,0,0.1)",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
};

const NotificationsScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const [filter, setFilter] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const notifications = useNotifsStore((state) => state.notifications);
  const users = useUsersStore((state) => state.users);
  const senderProfiles = useNotifsStore((state) => state.senderProfiles);
  const user = useAuthStore((state) => state.user);

  const getNotificationIcon = (type?: string) => {
    const icons = {
      assignment: "📝",
      message: "💬",
      reminder: "⏰",
      achievement: "🏆",
      system: "⚙️",
      "Create Card": "🎴",
      "Delete Card": "🗑️",
      "Create Category": "📁",
      "Delete Category": "🗂️",
    };
    return icons[type as keyof typeof icons] || "🔔";
  };

  const getNotificationColor = (type?: string) => {
    const colors = {
      assignment: COLORS.info,
      message: COLORS.success,
      reminder: COLORS.warning,
      achievement: COLORS.accent,
      system: COLORS.gray,
      "Create Card": COLORS.success,
      "Delete Card": COLORS.error,
      "Create Category": COLORS.info,
      "Delete Category": COLORS.warning,
    };
    return colors[type as keyof typeof colors] || COLORS.primary;
  };

  const markAllAsRead = () => {
    filteredNotifications.forEach((notif) => {
      markAsRead(notif.id);
    });
  };

  const deleteNotification = (id: string) => {
    // Implement delete functionality
  };

  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Open detail modal
    setSelectedNotification(notification);
    setIsDetailModalVisible(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedNotification(null);
  };

  const getDetailedNotificationContent = (notification: any) => {
    const actions: Record<string, any> = {
      "Create Card": {
        icon: "🎴",
        color: COLORS.success,
        description: `A new flashcard "${notification.itemName}" has been created for ${notification.receiverInfo?.fname} ${notification.receiverInfo?.lname}. This card is now available in their learning materials.`,
      },
      "Delete Card": {
        icon: "🗑️",
        color: COLORS.error,
        description: `The flashcard "${notification.itemName}" has been removed from ${notification.receiverInfo?.fname} ${notification.receiverInfo?.lname}'s learning materials.`,
      },
      "Create Category": {
        icon: "📁",
        color: COLORS.info,
        description: `A new category "${notification.itemName}" has been created to organize ${notification.receiverInfo?.fname} ${notification.receiverInfo?.lname}'s learning materials.`,
      },
      "Delete Category": {
        icon: "🗂️",
        color: COLORS.warning,
        description: `The category "${notification.itemName}" has been removed from ${notification.receiverInfo?.fname} ${notification.receiverInfo?.lname}'s learning materials.`,
      },
    };

    return (
      actions[notification.action] || {
        icon: "🔔",
        color: COLORS.primary,
        description: notification.notifMessage,
      }
    );
  };

  const filteredNotifications = notifications
    .map((notif) => {
      const senderInfo = notif.senderId ? senderProfiles[notif.senderId] : null;
      const receiverInfo = user;

      const notifTitle = `${senderInfo.first_name} ${
        senderInfo.last_name
      } (${senderInfo.role.toUpperCase()}) ${notif.action}`;

      let notifMessage: string = "";

      switch (notif.action) {
        case "Create Card":
          notifMessage = `${senderInfo.first_name} ${
            senderInfo.last_name
          } (${senderInfo.role.toUpperCase()}) created "${
            notif.itemName
          }" card for ${receiverInfo?.fname} ${receiverInfo?.lname}`;
          break;
        case "Delete Card":
          notifMessage = `${senderInfo.first_name} ${
            senderInfo.last_name
          } (${senderInfo.role.toUpperCase()}) deleted "${
            notif.itemName
          }" card for ${receiverInfo?.fname} ${receiverInfo?.lname}`;
          break;
        case "Create Category":
          notifMessage = `${senderInfo.first_name} ${
            senderInfo.last_name
          } (${senderInfo.role.toUpperCase()}) created "${
            notif.itemName
          }" category for ${receiverInfo?.fname} ${receiverInfo?.lname}`;
          break;
        case "Delete Category":
          notifMessage = `${senderInfo.first_name} ${
            senderInfo.last_name
          } (${senderInfo.role.toUpperCase()}) deleted "${
            notif.itemName
          }" category for ${receiverInfo?.fname} ${receiverInfo?.lname}`;
          break;
        default:
          notifMessage = notif.message;
          break;
      }

      return {
        ...notif,
        notificationTitle: notifTitle,
        notifMessage: notifMessage,
        senderProfile:
          senderInfo?.profile_picture || senderInfo?.profile_pic || null,
        senderName: `${senderInfo?.first_name || "Unknown"} ${
          senderInfo?.last_name || ""
        }`.trim(),
        senderRole: senderInfo?.role || "User",
        senderInfo: {
          firstName: senderInfo?.first_name,
          lastName: senderInfo?.last_name,
          id: notif.senderId,
        },
        learnerId: notif.learnerId!,
        receiverInfo,
      };
    })
    .filter((notif) => {
      if (filter === "unread") return !notif.read;
      if (filter === "read") return notif.read;
      return true;
    });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <Sidebar
        userRole={user?.role.toLowerCase()!}
        onNavigate={handleNavigation}
      />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={markAllAsRead}
            >
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView
          style={styles.notificationsList}
          showsVerticalScrollIndicator={false}
        >
          {/* Filter Tabs */}
          <View style={styles.filterContainer}>
            {["all", "unread", "read"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.filterTab,
                  filter === tab && styles.filterTabActive,
                ]}
                onPress={() => setFilter(tab)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === tab && styles.filterTextActive,
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyText}>No notifications</Text>
              <Text style={styles.emptySubtext}>
                {filter === "unread"
                  ? "You're all caught up!"
                  : "Check back later for updates"}
              </Text>
            </View>
          ) : (
            filteredNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.read && styles.notificationCardUnread,
                ]}
                onPress={() => handleNotificationClick(notification)}
              >
                <View style={styles.notificationContent}>
                  {/* Avatar or Icon */}
                  <View
                    style={[
                      styles.avatarContainer,
                      {
                        backgroundColor:
                          getNotificationColor(notification.action) + "20",
                      },
                    ]}
                  >
                    {notification.senderProfile ? (
                      <Image
                        source={{ uri: notification.senderProfile }}
                        style={styles.avatar}
                      />
                    ) : (
                      <Text style={styles.iconEmoji}>
                        {getNotificationIcon(notification.action)}
                      </Text>
                    )}
                  </View>

                  {/* Content */}
                  <View style={styles.textContent}>
                    <View style={styles.titleRow}>
                      <Text style={styles.notificationTitle}>
                        {notification.notificationTitle}
                      </Text>
                      {!notification.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                      {notification.notifMessage}
                    </Text>
                    <Text style={styles.timestamp}>
                      {formatDate(toDate(notification.notificationDate))}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                >
                  <Text style={styles.deleteIcon}>×</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Notification Detail Modal */}
        <Modal
          visible={isDetailModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeDetailModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedNotification && (
                <>
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Notification Details</Text>
                    <TouchableOpacity
                      onPress={closeDetailModal}
                      style={styles.closeButton}
                    >
                      <Icon name="x" size={24} color={COLORS.gray} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    style={styles.modalBody}
                    showsVerticalScrollIndicator={false}
                  >
                    {/* Sender Info */}
                    <View style={styles.senderSection}>
                      <View style={styles.senderHeader}>
                        <View
                          style={[
                            styles.modalAvatarContainer,
                            {
                              backgroundColor:
                                getNotificationColor(
                                  selectedNotification.action
                                ) + "20",
                            },
                          ]}
                        >
                          {selectedNotification.senderProfile ? (
                            <Image
                              source={{
                                uri: selectedNotification.senderProfile,
                              }}
                              style={styles.modalAvatar}
                            />
                          ) : (
                            <Text style={styles.modalIconEmoji}>
                              {getNotificationIcon(selectedNotification.action)}
                            </Text>
                          )}
                        </View>
                        <View style={styles.senderInfo}>
                          <Text style={styles.senderName}>
                            {selectedNotification.senderName}
                          </Text>
                          <Text style={styles.senderRole}>
                            {selectedNotification.senderRole.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Action Badge */}
                    <View style={styles.actionBadgeContainer}>
                      <View
                        style={[
                          styles.actionBadge,
                          {
                            backgroundColor:
                              getNotificationColor(
                                selectedNotification.action
                              ) + "15",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.actionBadgeText,
                            {
                              color: getNotificationColor(
                                selectedNotification.action
                              ),
                            },
                          ]}
                        >
                          {selectedNotification.action}
                        </Text>
                      </View>
                    </View>

                    {/* Main Message */}
                    {/* <View style={styles.messageSection}>
                      <Text style={styles.messageLabel}>Message</Text>
                      <Text style={styles.messageText}>
                        {selectedNotification.notifMessage}
                      </Text>
                    </View> */}

                    {/* Detailed Description */}
                    {selectedNotification.action && (
                      <View style={styles.descriptionSection}>
                        <Text style={styles.descriptionLabel}>Details</Text>
                        <Text style={styles.descriptionText}>
                          {
                            getDetailedNotificationContent(selectedNotification)
                              .description
                          }
                        </Text>
                      </View>
                    )}

                    {/* Item Name */}
                    {selectedNotification.itemName && (
                      <View style={styles.itemSection}>
                        <Text style={styles.itemLabel}>Item Name</Text>
                        <View style={styles.itemCard}>
                          <Text style={styles.itemName}>
                            {selectedNotification.itemName}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Timestamp */}
                    <View style={styles.timestampSection}>
                      <Icon
                        name="clock"
                        size={16}
                        color={COLORS.gray}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.timestampText}>
                        {formatDate(
                          toDate(selectedNotification.notificationDate)
                        )}
                      </Text>
                    </View>

                    {/* Action Buttons */}
                    {selectedNotification.action ===
                    "Child Guardian Request" ? (
                      <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity
                          style={styles.primaryActionButton}
                          onPress={() => {
                            respondToGuardianChangeRequest(
                              "accept",
                              selectedNotification
                            );
                          }}
                        >
                          <Text style={styles.primaryActionText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.secondaryActionButton}
                          onPress={(e) => {
                            e.stopPropagation();

                            respondToGuardianChangeRequest(
                              "decline",
                              selectedNotification
                            );
                          }}
                        >
                          <Text style={styles.secondaryActionText}>
                            Decline
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity
                          style={styles.primaryActionButton}
                          onPress={closeDetailModal}
                        >
                          <Text style={styles.primaryActionText}>Close</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.secondaryActionButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            deleteNotification(selectedNotification.id);
                            closeDetailModal();
                          }}
                        >
                          <Icon name="trash" size={16} color={COLORS.error} />
                          <Text style={styles.secondaryActionText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </ScrollView>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.black,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  markAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
  },
  markAllText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  filterContainer: {
    flexDirection: "row",
    paddingVertical: 5,
    marginBottom: 5,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
  },
  filterTabActive: {
    backgroundColor: COLORS.accent,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.gray,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 30,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  notificationCardUnread: {
    backgroundColor: COLORS.primary + "08",
    borderColor: COLORS.primary + "30",
  },
  notificationContent: {
    flexDirection: "row",
    flex: 1,
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  iconEmoji: {
    fontSize: 24,
  },
  textContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.gray,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  deleteIcon: {
    fontSize: 20,
    color: COLORS.gray,
    fontWeight: "300",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: "100%",
    maxWidth: 600,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.black,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    height: "auto",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  senderSection: {
    marginBottom: 10,
  },
  senderHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  modalAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  modalIconEmoji: {
    fontSize: 30,
  },
  senderInfo: {
    flex: 1,
  },
  senderName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 2,
  },
  senderRole: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.accent,
    letterSpacing: 0.5,
  },
  actionBadgeContainer: {
    marginBottom: 20,
  },
  actionBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionBadgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  messageSection: {
    marginBottom: 20,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.gray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    color: COLORS.black,
    lineHeight: 24,
  },
  descriptionSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.gray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 22,
  },
  itemSection: {
    marginBottom: 20,
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.gray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  itemCard: {
    padding: 12,
    backgroundColor: COLORS.accent + "10",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
  },
  timestampSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  timestampText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  primaryActionButton: {
    flex: 1,
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryActionText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  secondaryActionText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default NotificationsScreen;

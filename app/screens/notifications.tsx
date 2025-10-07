import Sidebar from "@/components/Sidebar";
import { formatDate, toDate } from "@/helper/formatDate";
import { markAsRead } from "@/services/notificationService";
import { useNotifsStore } from "@/stores/notificationsStore";
import { useAuthStore } from "@/stores/userAuthStore";
import { useUsersStore } from "@/stores/userStore";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

  const notifications = useNotifsStore((state) => state.notifications);
  const users = useUsersStore((state) => state.users);
  const senderProfiles = useNotifsStore((state) => state.senderProfiles);
  const user = useAuthStore((state) => state.user);

  const getNotificationIcon = () => {
    const icons = {
      assignment: "📝",
      message: "💬",
      reminder: "⏰",
      achievement: "🏆",
      system: "⚙️",
    };
    return "🔔";
  };

  const getNotificationColor = () => {
    const colors = {
      assignment: COLORS.info,
      message: COLORS.success,
      reminder: COLORS.warning,
      achievement: COLORS.accent,
      system: COLORS.gray,
    };
    return COLORS.primary;
  };

  const markAllAsRead = () => {
    // setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    filteredNotifications.forEach((notif) => {
      markAsRead(notif.id);
    });
  };

  const deleteNotification = (id: string) => {
    // setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const filteredNotifications = notifications
    .map((notif) => {
      // First check local users store, then check fetched sender profiles
      const senderInfo = notif.senderId ? senderProfiles[notif.senderId] : null;
      // const receiverInfo = users.find((user) => user.id === notif.createdFor);
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
          notifMessage = "";
          break;
      }

      return {
        ...notif,
        notificationTitle: notifTitle,
        notifMessage: notifMessage,
        senderProfile:
          senderInfo?.profile_picture || senderInfo?.profile_pic || null,
        senderName: senderInfo?.first_name || notif.userName || "Unknown",
        receiverInfo,
      };
    })
    .filter((notif) => {
      // Apply filter after mapping
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
                onPress={() => markAsRead(notification.id)}
              >
                <View style={styles.notificationContent}>
                  {/* Avatar or Icon */}
                  <View
                    style={[
                      styles.avatarContainer,
                      {
                        backgroundColor: getNotificationColor() + "20",
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
                        {getNotificationIcon()}
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
                  onPress={() => deleteNotification(notification.id)}
                >
                  <Text style={styles.deleteIcon}>×</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
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
});

export default NotificationsScreen;

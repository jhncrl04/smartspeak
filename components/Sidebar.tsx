import COLORS from "@/constants/Colors";
import { useSidebarWidth } from "@/context/sidebarContext";
import { useAuthStore } from "@/stores/userAuthStore";
import { router, usePathname } from "expo-router";
import { useRef, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MDIcon from "react-native-vector-icons/MaterialIcons";
import Icon from "react-native-vector-icons/Octicons";
import LoadingScreen from "./ui/LoadingScreen";

type SidebarProps = {
  onNavigate: (screen: string) => void;
  userRole: string;
};

const Sidebar = ({ onNavigate, userRole }: SidebarProps) => {
  const user = useAuthStore((state) => state.user);
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [disableSidebar, setDisableSidebar] = useState(false);
  const pathname = usePathname();
  const { setWidth } = useSidebarWidth();

  const isNavigatingRef = useRef(false);

  const teachersMenuItems = [
    { icon: "people", label: "Learners", screen: "/screens/teacher" },
    { icon: "image", label: "Cards", screen: "/screens/teacher/manageCards" },
    {
      icon: "copy",
      label: "Categories",
      screen: "/screens/teacher/manageBoards",
    },
    { icon: "bell", label: "Notifications", screen: "/screens/notifications" },
    { icon: "comment", label: "Messages", screen: "/screens/messages" },
    { icon: "gear", label: "Settings", screen: "/screens/settings" },
  ];

  const guardiansMenuItems = [
    { icon: "people", label: "Children", screen: "/screens/guardian" },
    { icon: "image", label: "Cards", screen: "/screens/guardian/manageCards" },
    {
      icon: "copy",
      label: "Categories",
      screen: "/screens/guardian/manageBoards",
    },
    { icon: "bell", label: "Notifications", screen: "/screens/notifications" },
    { icon: "comment", label: "Messages", screen: "/screens/messages" },
    { icon: "gear", label: "Settings", screen: "/screens/settings" },
  ];

  const menuItems =
    user?.role.toLowerCase() === "teacher"
      ? teachersMenuItems
      : guardiansMenuItems;

  const toggleSidebar = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    setWidth(newExpanded ? "25%" : 60);
  };

  const currentWidth = expanded ? "25%" : 60;

  const handleMenuPress = async (screen: string) => {
    if (isNavigatingRef.current || disableSidebar || pathname === screen)
      return;

    isNavigatingRef.current = true;
    setDisableSidebar(true);
    setIsLoading(true);

    try {
      router.push(screen as any);
      onNavigate(screen);
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      // small timeout helps prevent rapid double-presses
      setTimeout(() => {
        isNavigatingRef.current = false;
        setDisableSidebar(false);
        setIsLoading(false);
      }, 250);
    }
  };

  const logoutHandler = () => {
    useAuthStore.getState().logout();
  };

  return (
    <>
      <View style={[styles.sidebar, { width: currentWidth }]}>
        <ScrollView
          decelerationRate="fast"
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{ paddingVertical: 16, justifyContent: "space-between" }}
          >
            {/* Top Section */}
            <View>
              <View style={styles.toggleButton}>
                {expanded && (
                  <TouchableOpacity
                    disabled={isNavigatingRef.current}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: 10,
                      opacity: isNavigatingRef.current ? 0.5 : 1,
                    }}
                    onPress={() => handleMenuPress("/screens/settings")}
                  >
                    <Image
                      source={
                        user?.profile
                          ? { uri: user.profile }
                          : require("@/assets/images/default.jpg")
                      }
                      style={styles.profile}
                    />
                    <Text
                      style={{
                        fontFamily: "Poppins",
                        fontWeight: "600",
                        fontSize: 14,
                        maxWidth: "60%",
                        textAlign: "left",
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {`${user?.fname ?? ""} ${user?.lname ?? ""}`}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={{
                    width: 40,
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                  onPress={toggleSidebar}
                  disabled={isNavigatingRef.current}
                >
                  <Icon
                    name={expanded ? "chevron-left" : "chevron-right"}
                    size={24}
                    color={COLORS.gray}
                  />
                </TouchableOpacity>
              </View>

              {/* Menu Items */}
              <View style={styles.sidebarInnerContainer}>
                {menuItems.map((item) => (
                  <TouchableOpacity
                    disabled={
                      isNavigatingRef.current || pathname === item.screen
                    }
                    key={item.label}
                    style={[
                      styles.menuItem,
                      pathname === item.screen && {
                        backgroundColor: COLORS.lightGray,
                      },
                      isNavigatingRef.current && { opacity: 0.5 },
                    ]}
                    onPress={() => handleMenuPress(item.screen)}
                  >
                    <View
                      style={[
                        styles.iconContainer,
                        pathname === item.screen && styles.activeIcon,
                      ]}
                    >
                      <Icon
                        name={item.icon}
                        size={24}
                        color={
                          pathname === item.screen ? COLORS.white : COLORS.gray
                        }
                      />
                    </View>
                    {expanded && (
                      <Text
                        style={[
                          styles.menuText,
                          pathname === item.screen && styles.activeText,
                        ]}
                      >
                        {item.label}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Logout */}
            <TouchableOpacity
              style={styles.menuItem}
              disabled={isNavigatingRef.current}
              onPress={() => {
                if (!isNavigatingRef.current) {
                  logoutHandler();
                  setIsLoading(true);
                }
              }}
            >
              <View style={styles.iconContainer}>
                <MDIcon
                  name={"logout"}
                  size={24}
                  color={COLORS.gray}
                  style={{ transform: [{ scaleX: -1 }] }}
                />
              </View>
              {expanded && <Text style={styles.menuText}>Log Out</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <LoadingScreen visible={isLoading} />
    </>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: COLORS.pureWhite,
    paddingHorizontal: 8,
    justifyContent: "space-between",
    borderRightWidth: 1,
    borderRightColor: COLORS.shadow,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  profile: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  sidebarInnerContainer: {
    marginTop: 5,
    gap: 0,
  },
  iconContainer: {
    width: 35,
    height: 35,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
    marginBottom: 0,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 15,
    fontFamily: "Poppins",
    fontWeight: "500",
    color: COLORS.gray,
  },
  activeIcon: {
    backgroundColor: COLORS.gray,
  },
  activeText: {
    color: COLORS.gray,
    fontWeight: "600",
  },
});

export default Sidebar;

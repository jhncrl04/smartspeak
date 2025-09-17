import COLORS from "@/constants/Colors";
import { useSidebarWidth } from "@/context/sidebarContext";
import { useAuthStore } from "@/stores/userAuthStore";
import { router, usePathname } from "expo-router";
import { useState } from "react";
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

type SidebarProps = {
  onNavigate: (screen: string) => void;
  userRole: string;
};

const Sidebar = ({ onNavigate, userRole }: SidebarProps) => {
  const user = useAuthStore((state) => state.user);

  const [expanded, setExpanded] = useState(false);

  const indexScreenByRole =
    user?.role.toLowerCase() === "teacher"
      ? "/screens/teacher/"
      : "/screens/guardian/";

  const [activeScreen, setActiveScreen] = useState(indexScreenByRole);

  const { setWidth } = useSidebarWidth();

  const teachersMenuItems = [
    {
      icon: "people",
      label: "Learners",
      screen: "/screens/teacher",
    },
    {
      icon: "image",
      label: "Cards",
      screen: "/screens/teacher/manageCards",
    },
    {
      icon: "copy",
      label: "Categories",
      screen: "/screens/teacher/manageBoards",
    },
    {
      icon: "comment",
      label: "Messages",
      screen: "/screens/messages",
    },
    {
      icon: "gear",
      label: "Settings",
      screen: "/screens/settings",
    },
  ];

  const guardiansMenuItems = [
    {
      icon: "people",
      label: "Children",
      screen: "/screens/guardian",
    },
    {
      icon: "image",
      label: "Cards",
      screen: "/screens/guardian/manageCards",
    },
    {
      icon: "copy",
      label: "Categories",
      screen: "/screens/guardian/manageBoards",
    },
    {
      icon: "comment",
      label: "Messages",
      screen: "/screens/messages",
    },
    {
      icon: "gear",
      label: "Settings",
      screen: "/screens/settings",
    },
  ];

  const menuItems =
    user?.role.toLowerCase() === "teacher"
      ? teachersMenuItems
      : guardiansMenuItems;

  // Report width when expanded/collapsed
  const toggleSidebar = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);

    const newWidth = newExpanded ? "25%" : 60;
    setWidth(newWidth);
  };

  const currentWidth = expanded ? "25%" : 60;

  const pathname = usePathname();

  return (
    <View
      style={[
        styles.sidebar,
        { width: currentWidth }, // dynamic width here
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingVertical: 16 }}>
          <View style={{ gap: 0 }}>
            {/* Expand/Collapse Button */}
            <View style={styles.toggleButton}>
              {expanded && (
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                  onPress={() => {
                    router.push("/screens/settings");
                  }}
                >
                  <Image
                    source={
                      user?.profile
                        ? { uri: user.profile }
                        : require("../assets/images/creeper.png")
                    }
                    style={styles.profile}
                  />
                  <Text
                    style={{
                      fontFamily: "Poppins",
                      fontWeight: "500",
                      fontSize: 16,
                    }}
                  >{`${user?.fname}`}</Text>
                </TouchableOpacity>
              )}
              <Icon
                name={expanded ? "chevron-left" : "chevron-right"}
                size={24}
                color={COLORS.gray}
                onPress={toggleSidebar}
                style={{ paddingHorizontal: 10 }}
              />
            </View>

            <View style={styles.sidebarInnerContainer}>
              {/* Menu Items */}
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    pathname === item.screen && {
                      backgroundColor: COLORS.lightGray,
                    },
                  ]}
                  onPress={() => {
                    router.push(item.screen as any);
                    onNavigate(item.screen);
                  }}
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

          <TouchableOpacity style={styles.menuItem} onPress={logoutHandler}>
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
  );
};

const logoutHandler = () => {
  useAuthStore.getState().logout();
  router.replace("/login");
};

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: COLORS.navbarBg,
    paddingHorizontal: 8,
    justifyContent: "space-between",
    borderRightWidth: 1,
    borderRightColor: COLORS.shadow,
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

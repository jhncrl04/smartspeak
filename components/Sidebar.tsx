import COLORS from "@/constants/Colors";
import { useSidebarWidth } from "@/context/sidebarContext";
import { useAuthStore } from "@/stores/userAuthStore";
import { router } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
    userRole === "teacher" ? "/screens/teacher/" : "/screens/guardian/";

  const [activeScreen, setActiveScreen] = useState(indexScreenByRole);

  const { setWidth } = useSidebarWidth();

  const teachersMenuItems = [
    {
      icon: "people",
      label: "Learners",
      screen: "/screens/teacher/",
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
      label: "Child Management",
      screen: "/screens/guardian/",
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
    userRole === "teacher" ? teachersMenuItems : guardiansMenuItems;

  // Report width when expanded/collapsed
  const toggleSidebar = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);

    const newWidth = newExpanded ? "25%" : 60;
    setWidth(newWidth);
  };

  const currentWidth = expanded ? "25%" : 60;

  return (
    <View
      style={[
        styles.sidebar,
        { width: currentWidth }, // dynamic width here
      ]}
    >
      <View style={{ gap: 10 }}>
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
            >
              <Image
                source={require("../assets/images/creeper.png")}
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
            style={{ paddingHorizontal: 5 }}
          />
        </View>

        <View>
          {/* Menu Items */}
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => {
                setActiveScreen(item.screen);

                onNavigate(item.screen);
              }}
            >
              <View
                style={[
                  styles.iconContainer,
                  activeScreen === item.screen && styles.activeIcon,
                ]}
              >
                <Icon name={item.icon} size={24} color={COLORS.gray} />
              </View>

              {expanded && <Text style={styles.menuText}>{item.label}</Text>}
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
  );
};

const logoutHandler = () => {
  useAuthStore.getState().logout();
  router.replace("/screens/login");
};

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: COLORS.navbarBg,
    paddingVertical: 20,
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },
  profile: {
    width: 30,
    height: 30,
    borderRadius: 30,
  },
  iconContainer: {
    padding: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  toggleText: {
    fontSize: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 5,
  },
  menuText: {
    fontSize: 16,
  },
  activeIcon: {
    backgroundColor: COLORS.shadow,
    borderRadius: 100,
  },
});

export default Sidebar;

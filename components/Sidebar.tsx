import COLORS from "@/constants/Colors";
import { useSidebarWidth } from "@/context/sidebarContext";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MDIcon from "react-native-vector-icons/MaterialIcons";
import Icon from "react-native-vector-icons/Octicons";

type SidebarProps = {
  onNavigate: (screen: string) => void;
};

const Sidebar = ({ onNavigate }: SidebarProps) => {
  const [expanded, setExpanded] = useState(true);

  const { setWidth } = useSidebarWidth();

  const menuItems = [
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
      label: "Boards",
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

  // Report width when expanded/collapsed
  const toggleSidebar = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);

    const newWidth = newExpanded ? "20%" : 60;
    setWidth(newWidth);
  };

  const currentWidth = expanded ? "20%" : 60;

  return (
    <View
      style={[
        styles.sidebar,
        { width: currentWidth }, // dynamic width here
      ]}
    >
      <View style={{ gap: 10 }}>
        {/* Expand/Collapse Button */}
        <TouchableOpacity style={styles.toggleButton} onPress={toggleSidebar}>
          {expanded && <Text>Profile Name</Text>}
          <Icon
            name={expanded ? "chevron-left" : "chevron-right"}
            size={24}
            color={COLORS.gray}
          />
        </TouchableOpacity>

        <View>
          {/* Menu Items */}
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => onNavigate(item.screen)}
            >
              <Icon name={item.icon} size={24} color={COLORS.gray} />
              {expanded && <Text style={styles.menuText}>{item.label}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.menuItem}>
        <MDIcon
          name={"logout"}
          size={24}
          color={COLORS.gray}
          style={{ transform: [{ scaleX: -1 }] }}
        />
        {expanded && <Text style={styles.menuText}>Log Out</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: COLORS.navbarBg,
    paddingVertical: 20,
    paddingHorizontal: 10,

    justifyContent: "space-between",
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  toggleText: {
    fontSize: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  menuText: {
    fontSize: 16,
  },
});

export default Sidebar;

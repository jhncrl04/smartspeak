import COLORS from "@/constants/Colors";
import { useAuthStore } from "@/stores/userAuthStore";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { FAB, Portal, Provider } from "react-native-paper";

type PageType =
  | "learners"
  | "children"
  | "learnerProfile"
  | "learnerAssignedCategory"
  | "learnerAssignedCategoryNoUnassign"
  | "manageBoards"
  | "specificBoards"
  | "manageCards"
  | "categories";

const user = useAuthStore.getState().user;

const FabMenu = ({
  page,
  actions,
}: {
  page: PageType;
  actions?: Record<string, () => void>;
}) => {
  const [open, setOpen] = React.useState(false);

  const defaultActions: Record<PageType, any[]> = {
    learners: [
      { icon: "account-plus", label: "Add Learner", onPress: actions?.["add"] },
    ],
    children: [
      {
        icon: "account-plus",
        label: "Add Child",
        onPress: actions?.["add_child"],
      },
    ],
    learnerProfile: [
      // Removing this for now
      // user?.role.toLowerCase() === "teacher"
      //   ? {
      //       icon: "delete",
      //       label: "Remove Learner",
      //       onPress: actions?.["remove_learner"],
      //     }
      //   : {
      //       icon: "delete",
      //       label: "Remove Child",
      //       onPress: actions?.["remove_child"],
      //     },
      {
        icon: "minus-box-multiple-outline",
        label: "Assign Category",
        onPress: actions?.["assign_category"],
      },
    ],
    manageBoards: [
      {
        icon: "plus-box-multiple-outline",
        label: "Add Category",
        onPress: actions?.["add"],
      },
    ],
    specificBoards: [
      {
        icon: "card-plus-outline",
        label: "Add Card",
        onPress: actions?.["add_card"],
      },
      {
        icon: "folder-edit-outline",
        label: "Edit Category",
        onPress: actions?.["edit_category"],
      },
    ],
    learnerAssignedCategory: [
      {
        icon: "card-plus-outline",
        label: "Assign Card",
        onPress: actions?.["assign_card"],
      },
      {
        icon: "minus-box-multiple-outline",
        label: "Unassign Category",
        onPress: actions?.["unassign_category"],
      },
    ],
    learnerAssignedCategoryNoUnassign: [
      {
        icon: "minus-box-multiple-outline",
        label: "Unassign Category",
        onPress: actions?.["unassign_category"],
      },
    ],
    manageCards: [
      {
        icon: "card-plus-outline",
        label: "Add Card",
        onPress: actions?.["add"],
      },
    ],
    categories: [
      { icon: "folder-plus", label: "Add Category", onPress: actions?.["add"] },
      {
        icon: "folder-remove",
        label: "Remove Category",
        onPress: actions?.["delete"],
      },
    ],
  };

  return (
    <View
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        right: 0,

        padding: 0,
      }}
    >
      <Provider>
        <Portal>
          <FAB.Group
            open={open}
            visible
            fabStyle={styles.fab} // 👈 ensures absolute position
            icon={open ? "close" : "menu"}
            color={COLORS.white}
            actions={defaultActions[page]}
            onStateChange={({ open }) => setOpen(open)}
            backdropColor={COLORS.semiWhite}
          />
        </Portal>
      </Provider>
    </View>
  );
};

const styles = StyleSheet.create({
  fab: {
    backgroundColor: COLORS.accent,
  },
});

export default FabMenu;

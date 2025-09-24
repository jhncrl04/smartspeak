import COLORS from "@/constants/Colors";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

type item = { label: string; value: string };

type DropdownProps = {
  dropdownItems: item[];
  placeholder: string;
  value: string;
  onChange: (value: string, label?: string) => void;
  isDisabled?: boolean;
};

const MyDropdown = (props: DropdownProps) => {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <>
      <Dropdown
        style={[
          styles.dropdown,
          isFocus && !props.isDisabled && { borderColor: COLORS.accent },
          props.isDisabled && styles.disabledDropdown,
        ]}
        placeholderStyle={[
          styles.placeholderStyle,
          props.isDisabled && styles.disabledText,
        ]}
        disable={props.isDisabled ? true : false}
        selectedTextStyle={[
          styles.selectedTextStyle,
          props.isDisabled && styles.disabledText,
        ]}
        data={props.dropdownItems}
        maxHeight={200}
        mode="auto"
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? props.placeholder : ""}
        value={props.value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          props.onChange(item.value, item.label);
          setIsFocus(false);
        }}
        containerStyle={styles.dropdownContainer}
      />
    </>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    // flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 100,
    maxHeight: 40,
    borderColor: COLORS.gray,
    borderWidth: 1,
    borderRadius: 5,
  },
  dropdownContainer: {
    margin: 0, // 👈 removes gap between input and dropdown list
    padding: 0,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 5,

    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  disabledDropdown: {
    backgroundColor: COLORS.lightGray,
    borderColor: COLORS.lightGray,
  },
  placeholderStyle: {
    fontFamily: "Poppins",
    color: COLORS.gray,
    fontSize: 14,
  },
  selectedTextStyle: {
    fontFamily: "Poppins",
    fontSize: 14,
    flex: 1,
    textAlign: "left",
  },
  disabledText: {
    color: COLORS.gray,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});

export default MyDropdown;

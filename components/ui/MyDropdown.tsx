import COLORS from "@/constants/Colors";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

type item = { label: string; value: string };
type DropdownProps = { dropdownItems: item[]; placeholder: string };

const MyDropdown = (props: DropdownProps) => {
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  const renderLabel = () => {
    if (value || isFocus) {
      return <Text>Daily</Text>;
    }

    return null;
  };

  return (
    <>
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: COLORS.accent }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        iconStyle={styles.iconStyle}
        data={props.dropdownItems}
        maxHeight={300}
        mode="auto"
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? props.placeholder : "..."}
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setValue(item.value);
          setIsFocus(false);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    paddingHorizontal: 10,
    paddingVertical: 5,

    flex: 1,
    minWidth: 100,

    borderColor: COLORS.gray,
    borderWidth: 0.5,
    borderRadius: 5,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    color: COLORS.gray,
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});
export default MyDropdown;

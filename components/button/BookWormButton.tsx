import React from "react";
import {
  StyleSheet,
  Text,
  type TextStyle,
  TouchableOpacity,
  type TouchableOpacityProps,
  type ViewStyle,
} from "react-native";

/*
title - Title of Button
style - Style of Touchable Opacity surroudning text
textStyle - Style of the text
isNegativeOption - If true, button will have a negative style
*/
interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  isNegativeOption?: boolean;
}

const BookWormButton = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  isNegativeOption = false,
  activeOpacity = 0.8,
  ...rest
}: CustomButtonProps) => {
  return (
    // [style1, style2] will combine styles
    <TouchableOpacity
      style={[
        styles.button,
        style,
        isNegativeOption && styles.buttonNegative,
        disabled && styles.buttonDisabled,
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      activeOpacity={activeOpacity}
      {...rest}
    >
      <Text
        style={[
          styles.buttonText,
          textStyle,
          isNegativeOption && styles.buttonTextNegative,
          disabled && styles.buttonTextDisabled,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#FB6D0B",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: 10,
    flex: 1,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonTextNegative: {
    color: "black",
  },
  buttonDisabled: {
    backgroundColor: "rgba(251, 109, 11, 0.5)", // 50% opacity of original color
  },
  // TODO: Maybe make this look better
  buttonNegative: {
    backgroundColor: "rgb(217, 219, 218)",
  },
  buttonTextDisabled: {
    color: "rgba(255, 255, 255, 0.7)", // 70% opacity white
  },
});

export default BookWormButton;

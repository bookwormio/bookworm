import { Keyboard } from "react-native";

/**
 * Helper function to close the keyboard and then execute a callback
 * Needed because KeyboardAvoidingView does not always close the keyboard correctly
 * @param callback The function to execute after the keyboard is closed
 */
export function closeKeyboardThen(callback: () => void) {
  if (Keyboard.isVisible()) {
    Keyboard.dismiss();
    setTimeout(() => {
      callback();
    }, 20);
  } else {
    callback();
  }
}

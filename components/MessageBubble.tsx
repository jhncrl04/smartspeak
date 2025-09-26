import COLORS from "@/constants/Colors";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface MessageBubbleProps {
  text: string;
  timestamp: string;
  isOwnMessage: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ text, timestamp, isOwnMessage }) => {
  const [showTime, setShowTime] = useState(false);

  return (
    <View style={{ marginVertical: 4 }}>
      <TouchableOpacity
        onPress={() => setShowTime(!showTime)}
        activeOpacity={0.7}
        style={{
          alignSelf: isOwnMessage ? "flex-end" : "flex-start",
          backgroundColor: isOwnMessage ? COLORS.accent : COLORS.cardBg,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 16,
          maxWidth: "100%",
        }}
      >
        <Text style={{ color: isOwnMessage ? COLORS.white : COLORS.black, fontSize: 16 }}>
          {text}
        </Text>
      </TouchableOpacity>

      {showTime && (
        <Text
          style={{
            alignSelf: isOwnMessage ? "flex-end" : "flex-start",
            fontSize: 12,
            color: COLORS.gray,
            marginTop: 2,
            marginHorizontal: 6,
          }}
        >
          {timestamp}
        </Text>
      )}
    </View>
  );
};

export default MessageBubble;

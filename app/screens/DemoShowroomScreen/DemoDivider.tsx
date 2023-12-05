/* eslint-disable  react-native/no-inline-styles */
import React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { colors, spacing } from "../../theme"

interface DemoDividerProps {
  type?: "vertical" | "horizontal"
  size?: number
  style?: StyleProp<ViewStyle>
  line?: boolean
}

export function DemoDivider(props: DemoDividerProps) {
  const {
    type = "horizontal",
    size = 10 * spacing.scale,
    line = false,
    style: $styleOverride,
  } = props

  return (
    <View
      style={[
        $divider,
        type === "horizontal" && { height: size },
        type === "vertical" && { width: size },
        $styleOverride,
      ]}
    >
      {line && (
        <View
          style={[
            $line,
            type === "horizontal" && {
              width: 150 * spacing.scale,
              height: 1 * spacing.scale,
              marginStart: -75 * spacing.scale,
              marginTop: -1 * spacing.scale,
            },
            type === "vertical" && {
              height: 50 * spacing.scale,
              width: 1 * spacing.scale,
              marginTop: -25 * spacing.scale * spacing.scale * spacing.scale,
              marginStart: -1 * spacing.scale,
            },
          ]}
        />
      )}
    </View>
  )
}

const $divider: ViewStyle = {
  flexGrow: 0,
  flexShrink: 0,
}

const $line: ViewStyle = {
  backgroundColor: colors.border,
  position: "absolute",
  left: "50%",
  top: "50%",
}

// @demo remove-file

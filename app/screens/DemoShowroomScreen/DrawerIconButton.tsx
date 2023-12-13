import React, { useEffect } from "react"
import { Pressable, PressableProps, ViewStyle } from "react-native"
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated"
import type { SharedValue } from "react-native-reanimated"
import { isRTL } from "../../i18n"
import { colors, spacing } from "../../theme"

interface DrawerIconButtonProps extends PressableProps {
  open: boolean
  progress: SharedValue<number>
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function DrawerIconButton(props: DrawerIconButtonProps) {
  const { open, progress, ...PressableProps } = props

  const animatedContainerStyles = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [0, isRTL ? spacing._60 : -spacing._60],
    )

    return {
      transform: [{ translateX }],
    }
  })

  const animatedTopBarStyles = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(progress.value, [0, 1], [colors.text, colors.tint])
    const marginStart = interpolate(progress.value, [0, 1], [0, -11.5])
    const rotate = interpolate(progress.value, [0, 1], [0, isRTL ? 45 : -45])
    const marginBottom = interpolate(progress.value, [0, 1], [0, -2])
    const width = interpolate(progress.value, [0, 1], [18, 12])

    return {
      backgroundColor,
      marginStart,
      marginBottom,
      width,
      transform: [{ rotate: `${rotate}deg` }],
    }
  })

  const animatedMiddleBarStyles = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(progress.value, [0, 1], [colors.text, colors.tint])
    const width = interpolate(progress.value, [0, 1], [spacing._18, spacing._16])

    return {
      backgroundColor,
      width,
    }
  })

  const animatedBottomBarStyles = useAnimatedStyle(() => {
    const marginTop = interpolate(progress.value, [0, 1], [spacing._4, spacing._2])
    const backgroundColor = interpolateColor(progress.value, [0, 1], [colors.text, colors.tint])
    const marginStart = interpolate(progress.value, [0, 1], [0, -spacing._12])
    const rotate = interpolate(progress.value, [0, 1], [0, isRTL ? -45 : 45])
    const width = interpolate(progress.value, [0, 1], [spacing._18, spacing._12])

    return {
      backgroundColor,
      marginStart,
      width,
      marginTop,
      transform: [{ rotate: `${rotate}deg` }],
    }
  })

  useEffect(() => {
    progress.value = withSpring(open ? 1 : 0)
  }, [open, progress])

  return (
    <AnimatedPressable {...PressableProps} style={[$container, animatedContainerStyles]}>
      <Animated.View style={[$topBar, animatedTopBarStyles]} />

      <Animated.View style={[$middleBar, animatedMiddleBarStyles]} />

      <Animated.View style={[$bottomBar, animatedBottomBarStyles]} />
    </AnimatedPressable>
  )
}

const barHeight = spacing._2

const $container: ViewStyle = {
  alignItems: "center",
  height: spacing._56,
  justifyContent: "center",
  width: spacing._56,
}

const $topBar: ViewStyle = {
  height: barHeight,
}

const $middleBar: ViewStyle = {
  height: barHeight,
  marginTop: spacing.xxs,
}

const $bottomBar: ViewStyle = {
  height: barHeight,
}

// @demo remove-file

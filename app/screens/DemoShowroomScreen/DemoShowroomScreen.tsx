import { Link, RouteProp, useRoute } from "@react-navigation/native"
import React, { FC, ReactElement, useEffect, useRef, useState } from "react"
import {
  Dimensions,
  Image,
  ImageStyle,
  Platform,
  SectionList,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import { type ContentStyle } from "@shopify/flash-list"
import { DrawerLayout, DrawerState } from "react-native-gesture-handler"
import { useSharedValue, withTiming } from "react-native-reanimated"
import { ListItem, ListView, ListViewRef, Screen, Text } from "../../components"
import { isRTL } from "../../i18n"
import { DemoTabParamList, DemoTabScreenProps } from "../../navigators/DemoNavigator"
import { colors, spacing } from "../../theme"
import { useSafeAreaInsetsStyle } from "../../utils/useSafeAreaInsetsStyle"
import * as Demos from "./demos"
import { DrawerIconButton } from "./DrawerIconButton"

const logo = require("../../../assets/images/logo.png")

export interface Demo {
  name: string
  description: string
  data: ReactElement[]
}

interface DemoListItem {
  item: { name: string; useCases: string[] }
  sectionIndex: number
  handleScroll?: (sectionIndex: number, itemIndex?: number) => void
}

const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")

const WebListItem: FC<DemoListItem> = ({ item, sectionIndex }) => {
  const sectionSlug = item.name.toLowerCase()

  return (
    <View>
      <Link to={`/showroom/${sectionSlug}`} style={$menuContainer}>
        <Text preset="bold">{item.name}</Text>
      </Link>
      {item.useCases.map((u) => {
        const itemSlug = slugify(u)

        return (
          <Link key={`section${sectionIndex}-${u}`} to={`/showroom/${sectionSlug}/${itemSlug}`}>
            <Text>{u}</Text>
          </Link>
        )
      })}
    </View>
  )
}

const NativeListItem: FC<DemoListItem> = ({ item, sectionIndex, handleScroll }) => (
  <View style={$menuContainer}>
    <Text onPress={() => handleScroll?.(sectionIndex)} preset="bold" style={$menuContainerText}>
      {item.name}
    </Text>
    {item.useCases.map((u, index) => (
      <ListItem
        key={`section${sectionIndex}-${u}`}
        onPress={() => handleScroll?.(sectionIndex, index + 1)}
        text={u}
        rightIcon={isRTL ? "caretLeft" : "caretRight"}
      />
    ))}
  </View>
)

const ShowroomDemoList = (_props: any) => {
  const handleScroll = _props.handleScroll
  return (
    <View style={[$drawer, _props.additionalStyle ?? {}]}>
      <View style={$logoContainer}>
        <Image source={logo} style={$logoImage} />
      </View>

      <ListView<DemoListItem["item"]>
        ref={_props.menuRef}
        contentContainerStyle={$listContentContainer}
        estimatedItemSize={250 * spacing.scale}
        data={Object.values(Demos).map((d) => ({
          name: d.name,
          useCases: d.data.map((u) => u.props.name as string),
        }))}
        keyExtractor={(item) => item.name}
        renderItem={({ item, index: sectionIndex }) => (
          <ShowroomListItem {...{ item, sectionIndex, handleScroll }} />
        )}
      />
    </View>
  )
}

const ShowroomDemos = (_props: any) => {
  return (
    <SectionList
      ref={_props.listRef}
      contentContainerStyle={$sectionListContentContainer}
      stickySectionHeadersEnabled={false}
      sections={Object.values(Demos)}
      renderItem={({ item }) => item}
      renderSectionFooter={() => <View style={$demoUseCasesSpacer} />}
      ListHeaderComponent={
        <View style={$heading}>
          <Text preset="heading" tx="demoShowroomScreen.jumpStart" />
        </View>
      }
      onScrollToIndexFailed={_props.scrollToIndexFailed}
      renderSectionHeader={({ section }) => {
        return (
          <View>
            <Text preset="heading" style={$demoItemName}>
              {section.name}
            </Text>
            <Text style={$demoItemDescription}>{section.description}</Text>
          </View>
        )
      }}
    />
  )
}

const ShowroomListItem = Platform.select({ web: WebListItem, default: NativeListItem })

export const DemoShowroomScreen: FC<DemoTabScreenProps<"DemoShowroom">> =
  function DemoShowroomScreen(_props) {
    const [open, setOpen] = useState(false)
    const timeout = useRef<ReturnType<typeof setTimeout>>()
    const drawerRef = useRef<DrawerLayout>(null)
    const listRef = useRef<SectionList>(null)
    const menuRef = useRef<ListViewRef<DemoListItem["item"]>>(null)
    const progress = useSharedValue(0)
    const route = useRoute<RouteProp<DemoTabParamList, "DemoShowroom">>()
    const params = route.params

    // handle Web links
    React.useEffect(() => {
      if (route.params) {
        const demoValues = Object.values(Demos)
        const findSectionIndex = demoValues.findIndex(
          (x) => x.name.toLowerCase() === params.queryIndex,
        )
        let findItemIndex = 0
        if (params.itemIndex) {
          try {
            findItemIndex =
              demoValues[findSectionIndex].data.findIndex(
                (u) => slugify(u.props.name) === params.itemIndex,
              ) + 1
          } catch (err) {
            console.error(err)
          }
        }
        handleScroll(findSectionIndex, findItemIndex)
      }
    }, [route])

    const toggleDrawer = () => {
      if (!open) {
        setOpen(true)
        drawerRef.current?.openDrawer({ speed: 2 })
      } else {
        setOpen(false)
        drawerRef.current?.closeDrawer({ speed: 2 })
      }
    }

    const handleScroll = (sectionIndex: number, itemIndex = 0) => {
      listRef.current?.scrollToLocation({
        animated: true,
        itemIndex,
        sectionIndex,
      })
      toggleDrawer()
    }

    const scrollToIndexFailed = (info: {
      index: number
      highestMeasuredFrameIndex: number
      averageItemLength: number
    }) => {
      listRef.current?.getScrollResponder()?.scrollToEnd()
      timeout.current = setTimeout(
        () =>
          listRef.current?.scrollToLocation({
            animated: true,
            itemIndex: info.index,
            sectionIndex: 0,
          }),
        50,
      )
    }

    useEffect(() => {
      return () => timeout.current && clearTimeout(timeout.current)
    }, [])

    const $drawerInsets = useSafeAreaInsetsStyle(["top"])

    if (Platform.isTV) {
      return (
        <View style={$tvScreenContainer}>
          <ShowroomDemoList menuRef={menuRef} handleScroll={handleScroll} />
          <View style={$tvMainContentContainer}>
            <ShowroomDemos listRef={listRef} scrollToIndexFailed={scrollToIndexFailed} />
          </View>
        </View>
      )
    }
    return (
      <DrawerLayout
        ref={drawerRef}
        drawerWidth={Platform.select({
          default: 326 * spacing.scale,
          web: Dimensions.get("window").width * 0.3,
        })}
        drawerType={"slide"}
        drawerPosition={isRTL ? "right" : "left"}
        overlayColor={open ? colors.palette.overlay20 : "transparent"}
        onDrawerSlide={(drawerProgress) => {
          progress.value = open ? 1 - drawerProgress : drawerProgress
        }}
        onDrawerStateChanged={(newState: DrawerState, drawerWillShow: boolean) => {
          if (newState === "Settling") {
            progress.value = withTiming(drawerWillShow ? 1 : 0, {
              duration: 250,
            })
            setOpen(drawerWillShow)
          }
        }}
        renderNavigationView={() => (
          <ShowroomDemoList
            additionalStyle={$drawerInsets}
            menuRef={menuRef}
            handleScroll={handleScroll}
          />
        )}
      >
        <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContainer}>
          <DrawerIconButton onPress={toggleDrawer} {...{ open, progress }} />

          <ShowroomDemos listRef={listRef} scrollToIndexFailed={scrollToIndexFailed} />
        </Screen>
      </DrawerLayout>
    )
  }

const $screenContainer: ViewStyle = {
  flex: 1,
}

const $tvScreenContainer: ViewStyle = {
  flex: 1,
  flexDirection: "row",
  width: "100%",
  margin: spacing.md,
}

const $tvMainContentContainer: ViewStyle = {
  flex: 4,
}

const $drawer: ViewStyle = {
  backgroundColor: colors.background,
  flex: 1,
}

const $listContentContainer: ContentStyle = {
  paddingHorizontal: spacing.lg,
}

const $sectionListContentContainer: ViewStyle = {
  paddingHorizontal: spacing.lg,
}

const $heading: ViewStyle = {
  marginBottom: spacing.xxxl,
}

const $logoImage: ImageStyle = {
  height: 42 * spacing.scale,
  width: 77 * spacing.scale,
}

const $logoContainer: ViewStyle = {
  alignSelf: "flex-start",
  justifyContent: "center",
  height: 56 * spacing.scale,
  paddingHorizontal: spacing.lg,
}

const $menuContainer: ViewStyle = {
  paddingBottom: spacing.xs,
  paddingTop: spacing.lg,
}

const $menuContainerText: TextStyle = {
  fontSize: spacing.sm,
}

const $demoItemName: TextStyle = {
  fontSize: spacing.lg,
  marginBottom: spacing.md,
}

const $demoItemDescription: TextStyle = {
  marginBottom: spacing.xxl,
}

const $demoUseCasesSpacer: ViewStyle = {
  paddingBottom: spacing.xxl,
}

// @demo remove-file

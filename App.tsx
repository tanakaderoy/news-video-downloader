import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button, Divider, Header, Icon, Text } from "react-native-elements";
import { WebView } from "react-native-webview";
import { Video, AVPlaybackStatus } from "expo-av";
import useDownloadFile from "./useDownloadFile";
import { ProgressBar, Colors } from "react-native-paper";

export default function App() {
  const [gotVideo, setGotVideo] = useState(false);
  const webviewRef = useRef<WebView>(null);
  const [query, setQuery] = useState("");
  const [url, setUrl] = useState("https://abc6onyourside.com/");
  const [video, setVideo] = useState<VideoInfo>();
  const vidRef = useRef<Video>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const callback = useCallback((downloadProgress) => {
    const progress =
      downloadProgress.totalBytesWritten /
      downloadProgress.totalBytesExpectedToWrite;
    console.log(progress);
    if (progress === 1) {
      Alert.alert(
        "Video downloaded",
        `Finished downloading ${video?.fileName}`
      );
    }

    setDownloadProgress(progress);
  }, []);

  const script = `
  let fileName = sinclairDigital.storyData.canonicalUrl.replace('/','')+'.mp4'
  let vid = sinclairDigital.storyData.videos[0].mp4Url
  let title = sinclairDigital.storyData.pageTitle
  window.ReactNativeWebView.postMessage(JSON.stringify({vid,fileName, title}))`;
  const searchVideo = () => {
    Keyboard.dismiss();
    setGotVideo(false);
    setDownloadProgress(0);
    console.log("Pressed");

    url === query ? webviewRef.current?.reload() : setUrl(query);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        centerComponent={{
          text: "Video Downloader",
          style: { color: "#fff" },
        }}
      />
      <StatusBar style="auto" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{
          marginTop: 30,
          marginHorizontal: 16,
          backgroundColor: "#696969",
        }}
      >
        <Divider style={{ height: 1, backgroundColor: " #e1e8ee" }} />
        <View style={{ flexDirection: "row" }}>
          <TextInput
            placeholder="...Enter video Url"
            placeholderTextColor="black"
            value={query}
            onChangeText={(text) => setQuery(text)}
            onEndEditing={searchVideo}
            style={{
              height: 50,
              flex: 1,
              padding: 8,
              borderColor: "#fff",
              borderWidth: 1,
            }}
          />
          <Button
            onPress={searchVideo}
            type="clear"
            icon={<Icon name="search" />}
          />
        </View>
        <Divider style={{ height: 1, backgroundColor: " #e1e8ee" }} />

        {gotVideo && (
          <>
            <Text h2>{video?.title}</Text>
            <Video
              ref={vidRef}
              style={styles.video}
              useNativeControls
              resizeMode="contain"
              isLooping
              source={{ uri: video?.vid ?? "" }}
            />
            <Button
              title="Download"
              iconRight={true}
              icon={
                <Icon
                  name="download"
                  type="antdesign"
                  iconStyle={{ marginLeft: 5 }}
                />
              }
              onPress={async () => {
                await useDownloadFile(video?.fileName, video?.vid, callback);
              }}
            />
            <Text> Download Progress</Text>
            <ProgressBar
              progress={downloadProgress}
              color={Colors.blue100}
              style={{ height: 4, margin: 7 }}
            />
          </>
        )}
        <View style={{ height: 500, marginVertical: 50 }}>
          <View style={{ flex: 1 }}>
            <WebView
              ref={webviewRef}
              source={{ uri: url }}
              style={{ flex: 1 }}
              onLoadEnd={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;

                console.log("Finished Loading");
                webviewRef.current?.injectJavaScript(script);
              }}
              onNavigationStateChange={(state) => {
                console.log(state.url);
                if (!state.url.includes("/news")) {
                  setGotVideo(false);
                  setVideo(undefined);
                }
                setDownloadProgress(0);
                setQuery(state.url !== query ? state.url : query);
              }}
              onMessage={async (event) => {
                console.log(event.nativeEvent.data);
                const { data } = event.nativeEvent;
                const vidData = JSON.parse(data) as VideoInfo;
                setGotVideo(vidData.vid !== (null || undefined));
                await vidRef.current?.playAsync();
                setVideo(vidData);
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const DismissKeyboard: React.FC = ({ children }) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#696969",
  },
  video: {
    height: 300,
    width: "100%",
  },
});

type VideoInfo = {
  title: string;
  vid: string;
  fileName: string;
};

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
import { Video, AVPlaybackStatus, ResizeMode } from "expo-av";
import useDownloadFile from "./useDownloadFile";
import { ProgressBar, Colors } from "react-native-paper";
import { FFprobeKit, Statistics } from "ffmpeg-kit-react-native";

export default function App() {
  const [gotVideo, setGotVideo] = useState(false);
  const webviewRef = useRef<WebView>(null);
  const [query, setQuery] = useState("");
  const [url, setUrl] = useState("https://abc6onyourside.com/");
  const [video, setVideo] = useState<VideoInfo>();
  const vidRef = useRef<Video>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const callback = useCallback((done: boolean) => {
    if (done) {
      Alert.alert(
        "Video downloaded",
        `Finished downloading ${video?.fileName}`
      );
      setIsDownloading(false);
    }

  }, [video]);

  const script = `
  console.log("Okay hey we searching")
  let tanaka = "Tanaka"
  console.log(tanaka)
  new Promise(r => setTimeout(r, 3000)).then(() => {
    let fileName = sinclairVideo().playlist.super[0].title.replace(/\s/g,'').trim()+'.mp4'
    let vid = sinclairVideo().playlist.super[0].file
    let title = document.title
    window.ReactNativeWebView.postMessage(JSON.stringify({vid,fileName, title}))
  })
`;
  const searchVideo = () => {
    Keyboard.dismiss();
    setGotVideo(false);
    setIsDownloading(false);
    console.log("Pressed");

   setUrl(query);
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
              resizeMode={ResizeMode.CONTAIN}
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
                setIsDownloading(true)
                await useDownloadFile(video?.fileName, video?.vid, callback);
              }}
            />
            <Text> Download Progress</Text>
            <ProgressBar
              indeterminate
              visible={isDownloading}
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
                setIsDownloading(false);
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

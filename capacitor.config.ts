import type { CapacitorConfig } from "@capacitor/cli"

const liveUrl = process.env.CAPACITOR_SERVER_URL ?? process.env.APP_URL

const config: CapacitorConfig = {
  appId: "com.ekstromjonathan.tabata",
  appName: "Tabata",
  webDir: "native-www",
  backgroundColor: "#000000",
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "Tabata",
  },
  android: {
    allowMixedContent: Boolean(liveUrl?.startsWith("http://")),
    backgroundColor: "#000000",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      launchAutoHide: true,
      backgroundColor: "#000000",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#000000",
    },
  },
}

if (liveUrl) {
  config.server = {
    url: liveUrl,
    cleartext: liveUrl.startsWith("http://"),
  }
}

export default config

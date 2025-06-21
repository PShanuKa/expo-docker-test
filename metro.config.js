const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname, { isCSSEnabled: true })
const { withSentry } = require('@sentry/react-native/expo');

module.exports = withNativeWind(withSentry(config, { input: './app/global.css' }), { input: './app/global.css' })




// const { getDefaultConfig } = require("expo/metro-config");
// const { withNativeWind } = require('nativewind/metro');

// const config = getDefaultConfig(__dirname, { isCSSEnabled: true })

// module.exports = withNativeWind(config, { input: './app/global.css' })
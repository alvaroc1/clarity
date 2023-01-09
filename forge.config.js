module.exports = {
  "packagerConfig": {
    "appBundleId": "io.devstack.clarity",
    "name": "Clarity",
    "executable-name": "clarity",
    "icon": "clarity.icns",
    "asar": true,
    "osxSign": {
      "identity": "Developer ID Application: Alvaro Carrasco (6ZYU9CDQ6L)",
      "hardened-runtime": true,
      "gatekeeper-assess": false,
      "entitlements": "entitlements.plist",
      "entitlements-inherit": "entitlements.plist",
      "signature-flags": "library",
      "keychain": process.env.KEYCHAIN_PATH
    },
    "osxNotarize": {
      "appBundleId": "io.devstack.clarity",
      "appleId": "simplepic@gmail.com",
      "appleIdPassword": process.env.APPLEID_PASSWORD
    }
  },
  "makers": [
    {
      "name": "@electron-forge/maker-dmg",
      "config": {
        //"background": "./assets/dmg-background.png",
        "format": "ULFO"
      }
    },
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        certificateFile: './cert.pfx',
        certificatePassword: process.env.CERTIFICATE_PASSWORD,
      },
    },
  ]
}

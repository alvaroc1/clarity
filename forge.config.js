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
      "signature-flags": "library"
    },
    "osxNotarize": {
      "appBundleId": "io.devstack.clarity",
      "appleId": "simplepic@gmail.com",
      "appleIdPassword": "vjof-rbqb-iqvl-hqol"
    }
  },
  "makers": [
    {
      "name": "@electron-forge/maker-dmg",
      "config": {
        //"background": "./assets/dmg-background.png",
        "format": "ULFO"
      }
    }
  ]
}

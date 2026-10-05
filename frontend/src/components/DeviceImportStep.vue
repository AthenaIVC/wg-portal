<script setup>
import { computed, onBeforeUnmount, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import qrcode from "qrcode-generator";
import { profileStore } from "@/stores/profile";
import { detectPlatform, isMobilePlatform } from "@/helpers/platform";
import { downloadConfigFile } from "@/helpers/wireguard";

// Second step of adding a device for non-admin users: get the config, which only exists in this browser, into the
// WireGuard app. Phones can't scan their own screen, the Android app doesn't accept shared or opened files (import
// starts in the app), and the iOS app accepts .conf files from the share sheet.
const props = defineProps({
  peerId: String,
  config: String,
  fileName: String,
})

const { t } = useI18n()
const profile = profileStore()
const platform = detectPlatform()
const mobile = isMobilePlatform(platform)

const file = new File([props.config], props.fileName, { type: "text/plain" })
const canShareToApp = platform === "ios" && !!navigator.canShare && navigator.canShare({ files: [file] })

const qrSvg = computed(() => {
  const qr = qrcode(0, "L")
  qr.addData(props.config)
  qr.make()
  return qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true })
})

// steps in the WireGuard app, using the labels of its Japanese / English user interface
const importSteps = computed(() => {
  const open = { icon: "fa-solid fa-shield-halved", label: t("devices.import.app-open") }
  const plus = { label: t("devices.import.app-plus"), app: true }
  const pick = { icon: "fa-regular fa-file-lines", label: props.fileName }
  switch (platform) {
    case "ios": return [open, plus, { icon: "fa-solid fa-folder-open", label: t("devices.import.ios-file"), app: true }, pick]
    case "android": return [open, plus, { icon: "fa-solid fa-folder-open", label: t("devices.import.android-file"), app: true }, pick]
    case "macos": return [{ icon: "fa-solid fa-shield-halved", label: t("devices.import.macos-menu") }, { icon: "fa-solid fa-folder-open", label: t("devices.import.macos-file"), app: true }, pick]
    case "windows": return [open, { icon: "fa-solid fa-folder-open", label: t("devices.import.windows-file"), app: true }, pick]
    default: return []
  }
})

const connected = computed(() => profile.Statistics(props.peerId).IsConnected)

function save() {
  downloadConfigFile(props.config, props.fileName)
}

function openInApp() {
  // must run directly in the click handler (transient user activation)
  navigator.share({ files: [file] }).catch((e) => {
    if (e.name !== "AbortError") save()
  })
}

// show the connection as soon as the tunnel is switched on in the app
let timer = null
onMounted(() => {
  if (profile.hasStatistics) {
    timer = setInterval(() => profile.LoadStats(), 4000)
  }
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="device-import">
    <!-- PC: scan with the phone, or use the file on this PC -->
    <div v-if="!mobile" class="d-flex gap-4 align-items-center pb-3 mb-3 border-bottom">
      <div class="device-import-qr" v-html="qrSvg" :aria-label="$t('devices.import.qr-label')" role="img"></div>
      <div>
        <h6><i class="fa-solid fa-mobile-screen-button me-2"></i>{{ $t('devices.import.phone-title') }}</h6>
        <ol class="device-import-steps">
          <li><i class="fa-solid fa-shield-halved"></i>{{ $t('devices.import.app-open') }}</li>
          <li><span class="device-import-app-label">{{ $t('devices.import.app-plus') }}</span></li>
          <li><span class="device-import-app-label"><i class="fa-brands fa-apple"></i>{{ $t('devices.import.ios-qr') }}</span>
            <span class="device-import-app-label"><i class="fa-brands fa-android"></i>{{ $t('devices.import.android-qr') }}</span></li>
        </ol>
      </div>
    </div>

    <h6 v-if="!mobile"><i class="fa-solid fa-laptop me-2"></i>{{ $t('devices.import.pc-title') }}</h6>

    <!-- iPhone / iPad: hand the file to the app through the share sheet -->
    <div v-if="canShareToApp" class="mb-3">
      <button class="btn btn-primary w-100" type="button" @click="openInApp">
        <i class="fa-solid fa-arrow-up-from-bracket me-2"></i>{{ $t('devices.import.open-in-app') }}
      </button>
      <ol class="device-import-steps mt-2">
        <li><i class="fa-solid fa-shield-halved"></i>{{ $t('devices.import.share-pick-app') }}</li>
        <li><i class="fa-solid fa-check"></i>{{ $t('devices.import.allow-vpn') }}</li>
      </ol>
      <button class="btn btn-link btn-sm px-0" type="button" @click="save">{{ $t('devices.import.save-file') }}</button>
    </div>

    <!-- everything else: save the file and import it in the app -->
    <div v-else>
      <button :class="mobile ? 'btn btn-primary w-100' : 'btn btn-secondary'" type="button" @click="save">
        <i class="fa-solid fa-download me-2"></i>{{ $t('devices.import.save-file') }}
      </button>
      <ol v-if="importSteps.length" class="device-import-steps mt-2">
        <li v-for="step in importSteps" :key="step.label">
          <i v-if="step.icon" :class="step.icon"></i><span :class="{ 'device-import-app-label': step.app }">{{ step.label }}</span>
        </li>
      </ol>
      <p v-else class="mt-2 mb-0"><code>sudo wg-quick up ./{{ fileName }}</code></p>
    </div>

    <!-- connection feedback -->
    <div v-if="profile.hasStatistics" class="device-import-status mt-3" :class="{ connected }" role="status">
      <template v-if="connected"><i class="fa-solid fa-circle-check me-2"></i>{{ $t('devices.import.connected') }}</template>
      <template v-else><span class="spinner-grow spinner-grow-sm me-2" aria-hidden="true"></span>{{ $t('devices.import.waiting') }}</template>
    </div>
  </div>
</template>

<style>
.device-import-qr {
  width: 11rem;
  flex: none;
}
.device-import-qr svg {
  display: block;
  width: 100%;
  height: auto;
  background: #fff;
  padding: 0.5rem;
  border-radius: 6px;
}
.device-import-steps {
  list-style: none;
  padding: 0;
  margin-bottom: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.5rem;
}
.device-import-steps li {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}
.device-import-steps li + li::before {
  content: "\203A";
  margin-right: 0.25rem;
  opacity: 0.5;
}
.device-import-app-label {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0 0.5rem;
  white-space: nowrap;
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
}
.device-import-status {
  padding: 0.5rem 0.75rem;
  border-radius: var(--bs-border-radius);
  background: var(--bs-tertiary-bg);
}
.device-import-status.connected {
  color: var(--bs-success);
  background: rgba(var(--bs-success-rgb), 0.1);
}
</style>

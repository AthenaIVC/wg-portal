<script setup>
import { useI18n } from "vue-i18n";
import { detectPlatform, isMobilePlatform, wireGuardApps } from "@/helpers/platform";

// First visit of a non-admin user without devices: the three steps to a working VPN connection.
const emit = defineEmits(["add"])

const { t } = useI18n()
const platform = detectPlatform()
const mobile = isMobilePlatform(platform)
const otherPlatforms = Object.keys(wireGuardApps).filter((p) => p !== platform)
</script>

<template>
  <div class="device-setup">
    <h2 class="mt-4 mb-3">{{ t('devices.setup.title') }}</h2>
    <ol class="device-setup-steps">
      <li>
        <span class="device-setup-number">1</span>
        <div>
          <div class="device-setup-step">{{ t('devices.setup.step-app') }}</div>
          <a class="btn btn-secondary mt-2" :href="wireGuardApps[platform].url" target="_blank" rel="noopener">
            <i :class="wireGuardApps[platform].icon" class="me-2"></i>{{ t('devices.setup.get-app', { platform: t(`devices.platforms.${platform}`) }) }}
          </a>
          <div class="device-setup-others mt-1">
            {{ t('devices.setup.other-platforms') }}
            <a v-for="p in otherPlatforms" :key="p" :href="wireGuardApps[p].url" target="_blank" rel="noopener" class="ms-2">
              <i :class="wireGuardApps[p].icon" class="me-1"></i>{{ t(`devices.platforms.${p}`) }}</a>
          </div>
        </div>
      </li>
      <li>
        <span class="device-setup-number">2</span>
        <div>
          <div class="device-setup-step">{{ t('devices.setup.step-add') }}</div>
          <button class="btn btn-primary mt-2" type="button" @click="emit('add')">
            <i class="fa fa-plus me-2"></i>{{ t('devices.add') }}
          </button>
        </div>
      </li>
      <li class="device-setup-later">
        <span class="device-setup-number">3</span>
        <div class="device-setup-step">{{ t('devices.setup.step-import') }}</div>
      </li>
    </ol>
    <p v-if="mobile" class="device-setup-others mt-3 mb-0">
      <i class="fa-solid fa-laptop me-1"></i>{{ t('devices.setup.pc-hint') }}
    </p>
  </div>
</template>

<style>
.device-setup-steps {
  list-style: none;
  padding: 0;
  margin: 0;
}
.device-setup-steps > li {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--bs-border-color);
}
.device-setup-steps > li:last-child {
  border-bottom: 0;
}
.device-setup-number {
  flex: none;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--bs-primary);
  background: rgba(var(--bs-primary-rgb), 0.12);
}
.device-setup-step {
  font-weight: 700;
  line-height: 1.75rem;
}
.device-setup-later {
  color: var(--bs-secondary-color);
}
.device-setup-later .device-setup-number {
  color: var(--bs-secondary-color);
  background: var(--bs-tertiary-bg);
}
.device-setup-others {
  font-size: 0.8125rem;
  color: var(--bs-secondary-color);
}
</style>

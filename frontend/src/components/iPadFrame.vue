<script setup lang="ts">
/**
 * iPadFrame - Decorative iPad frame for desktop viewing
 *
 * Wraps content in an iPad-like frame on desktop screens.
 * On tablet/mobile, the frame disappears and content fills the screen.
 */
</script>

<template>
  <div class="ipad-wrapper">
    <!-- iPad device frame (desktop only) -->
    <div class="ipad-device">
      <!-- iPad bezel/frame -->
      <div class="ipad-bezel">
        <!-- Front camera -->
        <div class="ipad-camera"></div>

        <!-- Screen area with content -->
        <div class="ipad-screen">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ipad-wrapper {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
  padding: 2rem;
  box-sizing: border-box;
  overflow: hidden;
}

.ipad-device {
  position: relative;
  /* Fit within viewport while maintaining iPad aspect ratio (4:3 landscape) */
  width: min(calc(100vw - 4rem), calc((100vh - 4rem) * 1.333));
  height: min(calc(100vh - 4rem), calc((100vw - 4rem) * 0.75));
  max-width: 1200px;
  max-height: 900px;
}

.ipad-bezel {
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0d0d0d 100%);
  border-radius: 36px;
  padding: 18px;
  box-shadow:
    0 0 0 2px #3a3a3a,
    0 25px 80px rgba(0, 0, 0, 0.6),
    0 10px 30px rgba(0, 0, 0, 0.4),
    inset 0 1px 1px rgba(255, 255, 255, 0.05);
  position: relative;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

/* Front camera (on the long edge for landscape) */
.ipad-camera {
  position: absolute;
  left: 50%;
  top: 8px;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  background: radial-gradient(circle, #1a1a1a 40%, #0a0a0a 100%);
  border-radius: 50%;
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.8),
    0 0 0 1px rgba(50, 50, 50, 0.5);
}

.ipad-screen {
  width: 100%;
  height: 100%;
  background: #0f172a;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  /* Screen bezel reflection effect */
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Responsive: Hide frame on smaller screens */
@media (max-width: 1100px) {
  .ipad-wrapper {
    padding: 0;
    background: none;
    overflow: auto;
  }

  .ipad-device {
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
  }

  .ipad-bezel {
    width: 100%;
    height: 100vh;
    background: none;
    border-radius: 0;
    padding: 0;
    box-shadow: none;
  }

  .ipad-camera {
    display: none;
  }

  .ipad-screen {
    border-radius: 0;
    box-shadow: none;
  }
}
</style>

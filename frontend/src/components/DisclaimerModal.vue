<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CTAButton from './CTAButton.vue'

const isVisible = ref(false)

onMounted(() => {
  // Always show on app start
  isVisible.value = true
})

function accept() {
  isVisible.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isVisible" class="modal-overlay">
        <div class="modal-container">
          <!-- TV Icon -->
          <div class="tv-icon">📺</div>
          <h2 class="modal-title">Rechtlicher Hinweis</h2>

          <!-- Original Format Section -->
          <h3 class="section-title">Original-Format</h3>
          <p class="modal-text">
            <strong>„Das Duell um die Geld"</strong> ist eine TV-Show von
            <strong>ProSieben</strong> und <strong>Joyn</strong>, moderiert von
            Joko Winterscheidt und Klaas Heufer-Umlauf.
          </p>
          <p class="copyright-notice">
            © Seven.One Entertainment Group GmbH · Produziert von Florida Entertainment GmbH
          </p>

          <div class="divider"></div>

          <!-- About Section -->
          <h3 class="section-title">Über diese Anwendung</h3>
          <p class="modal-text">
            Diese Web-App ist ein <strong>Proof of Concept (POC)</strong> und wurde erstellt,
            um die Möglichkeiten von <strong>AI-gestützter Softwareentwicklung</strong> mit
            <strong>Claude Code</strong> zu demonstrieren.
          </p>
          <p class="modal-text">
            Es handelt sich um ein <strong>nicht-kommerzielles Fan-Projekt</strong> ohne
            jegliche Gewinnabsicht. Alle Rechte am Original-Format, Namen und Konzept
            verbleiben bei den rechtmäßigen Inhabern.
          </p>

          <a class="joyn-link" href="https://www.joyn.de/serien/das-duell-um-die-geld" target="_blank" rel="noopener noreferrer">
            Original auf Joyn ansehen →
          </a>

          <!-- Button -->
          <CTAButton variant="gold" size="lg" class="accept-btn" @click="accept">
            Verstanden – Los geht's!
          </CTAButton>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  backdrop-filter: blur(4px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.modal-container {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 1.5rem;
  max-width: 700px;
  width: 100%;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 2rem 2.5rem;
  text-align: center;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 100px rgba(251, 191, 36, 0.1);
  animation: modalAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin: auto;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.tv-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.5));
}

.modal-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: #fbbf24;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 1.5rem 0;
}

.section-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #fbbf24;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem 0;
  text-align: left;
}

.modal-text {
  color: #cbd5e1;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 0.75rem 0;
  text-align: left;
}

.modal-text strong {
  color: #f1f5f9;
}

.copyright-notice {
  font-size: 0.85rem;
  color: #94a3b8;
  font-style: italic;
  margin: 0 0 0.5rem 0;
  text-align: left;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.3), transparent);
  margin: 1.25rem 0;
}

.joyn-link {
  display: block;
  color: #fbbf24;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s;
  margin: 1.25rem 0;
}

.joyn-link:hover {
  color: #fcd34d;
  text-decoration: underline;
}

.accept-btn {
  margin-top: 1rem;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}
</style>

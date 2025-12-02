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
          <!-- Header with TV Icon -->
          <div class="modal-header">
            <div class="tv-icon">📺</div>
            <h2 class="modal-title">Rechtlicher Hinweis</h2>
          </div>

          <!-- Content -->
          <div class="modal-content">
            <div class="copyright-section">
              <h3>Original-Format</h3>
              <p>
                <strong>„Das Duell um die Geld"</strong> ist eine TV-Show von
                <strong>ProSieben</strong> und <strong>Joyn</strong>, moderiert von
                Joko Winterscheidt und Klaas Heufer-Umlauf.
              </p>
              <p class="copyright-notice">
                © Seven.One Entertainment Group GmbH<br>
                Produziert von Florida Entertainment GmbH
              </p>
            </div>

            <div class="divider"></div>

            <div class="disclaimer-section">
              <h3>Über diese Anwendung</h3>
              <p>
                Diese Web-App ist ein <strong>Proof of Concept (POC)</strong> und wurde erstellt,
                um die Möglichkeiten von <strong>AI-gestützter Softwareentwicklung</strong> mit
                <strong>Claude Code</strong> zu demonstrieren.
              </p>
              <p>
                Es handelt sich um ein <strong>nicht-kommerzielles Fan-Projekt</strong> ohne
                jegliche Gewinnabsicht. Alle Rechte am Original-Format, Namen und Konzept
                verbleiben bei den rechtmäßigen Inhabern.
              </p>
            </div>

            <div class="links-section">
              <a href="https://www.joyn.de/serien/das-duell-um-die-geld" target="_blank" rel="noopener noreferrer">
                Original auf Joyn ansehen →
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <CTAButton variant="gold" size="lg" @click="accept">
              Verstanden – Los geht's!
            </CTAButton>
          </div>
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
}

.modal-container {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 1.5rem;
  max-width: 540px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow:
    0 0 0 1px rgba(251, 191, 36, 0.3),
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 100px rgba(251, 191, 36, 0.1);
  animation: modalAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
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

.modal-header {
  text-align: center;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid rgba(251, 191, 36, 0.2);
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
  margin: 0;
}

.modal-content {
  padding: 1.5rem 2rem;
}

.copyright-section,
.disclaimer-section {
  margin-bottom: 1rem;
}

.copyright-section h3,
.disclaimer-section h3 {
  font-family: 'Oswald', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #fbbf24;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem 0;
}

.modal-content p {
  color: #cbd5e1;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 0.75rem 0;
}

.modal-content p:last-child {
  margin-bottom: 0;
}

.modal-content strong {
  color: #f1f5f9;
}

.copyright-notice {
  background: rgba(251, 191, 36, 0.1);
  border-left: 3px solid #fbbf24;
  padding: 0.75rem 1rem;
  border-radius: 0 0.5rem 0.5rem 0;
  font-size: 0.875rem !important;
  color: #94a3b8 !important;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.3), transparent);
  margin: 1.25rem 0;
}

.links-section {
  text-align: center;
  margin-top: 1rem;
}

.links-section a {
  color: #fbbf24;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s;
}

.links-section a:hover {
  color: #fcd34d;
  text-decoration: underline;
}

.modal-footer {
  padding: 1.5rem 2rem 2rem;
  text-align: center;
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

/* Scrollbar styling */
.modal-container::-webkit-scrollbar {
  width: 6px;
}

.modal-container::-webkit-scrollbar-track {
  background: transparent;
}

.modal-container::-webkit-scrollbar-thumb {
  background: rgba(251, 191, 36, 0.3);
  border-radius: 3px;
}

.modal-container::-webkit-scrollbar-thumb:hover {
  background: rgba(251, 191, 36, 0.5);
}
</style>

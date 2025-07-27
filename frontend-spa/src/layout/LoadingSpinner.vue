<template>
  <div :class="['loading-spinner-container', containerClass]">
    <div 
      :class="['loading-spinner', spinnerClass]" 
      :style="spinnerStyle"
    ></div>
    <p v-if="text" :class="['loading-text', textClass]">{{ text }}</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    size: {
      type: [Number, String],
      default: 40
    },
    color: {
      type: String,
      default: '#8b5cf6'
    },
    thickness: {
      type: Number,
      default: 3
    },
    text: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'dots', 'bars', 'pulse'].includes(value)
    },
    centered: {
      type: Boolean,
      default: false
    },
    overlay: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    spinnerStyle() {
      const size = typeof this.size === 'number' ? `${this.size}px` : this.size
      
      return {
        width: size,
        height: size,
        borderWidth: `${this.thickness}px`,
        borderColor: `${this.color}30`,
        borderTopColor: this.color,
        ...(this.variant === 'pulse' && {
          backgroundColor: this.color,
          border: 'none'
        })
      }
    },
    containerClass() {
      return {
        'loading-centered': this.centered,
        'loading-overlay': this.overlay
      }
    },
    spinnerClass() {
      return `loading-${this.variant}`
    },
    textClass() {
      return {
        'text-sm': this.size <= 20,
        'text-base': this.size > 20 && this.size <= 40,
        'text-lg': this.size > 40
      }
    }
  }
}
</script>

<style scoped>
.loading-spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.loading-centered {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-default {
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-dots {
  position: relative;
  border: none !important;
  background: none !important;
}

.loading-dots::before,
.loading-dots::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  animation: dots 1.5s ease-in-out infinite;
}

.loading-dots::before {
  left: -150%;
  animation-delay: -0.32s;
}

.loading-dots::after {
  right: -150%;
  animation-delay: 0.32s;
}

.loading-bars {
  position: relative;
  border: none !important;
  background: none !important;
  transform: rotate(45deg);
}

.loading-bars::before,
.loading-bars::after {
  content: '';
  position: absolute;
  animation: bars 1.2s ease-in-out infinite;
}

.loading-bars::before {
  left: -100%;
  animation-delay: -0.16s;
}

.loading-bars::after {
  right: -100%;
  animation-delay: 0.16s;
}

.loading-pulse {
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-text {
  color: #94a3b8;
  font-weight: 500;
  margin: 0;
  text-align: center;
}

.text-sm {
  font-size: 0.75rem;
}

.text-base {
  font-size: 0.875rem;
}

.text-lg {
  font-size: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes dots {
  0%, 80%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bars {
  0%, 40%, 100% {
    opacity: 0.3;
    transform: scaleY(0.4);
  }
  20% {
    opacity: 1;
    transform: scaleY(1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(0);
  }
  50% {
    opacity: 0.5;
    transform: scale(1);
  }
}

@media (prefers-color-scheme: dark) {
  .loading-text {
    color: #cbd5e1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading-default,
  .loading-dots::before,
  .loading-dots::after,
  .loading-bars::before,
  .loading-bars::after,
  .loading-pulse {
    animation: none;
  }
  
  .loading-default {
    border-top-color: transparent;
    border-right-color: transparent;
  }
}
</style>
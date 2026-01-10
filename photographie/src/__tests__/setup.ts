// =============================================================================
// FICHIER DE CONFIGURATION POUR LES TESTS FRONTEND
// =============================================================================
// Ce fichier est exécuté AVANT chaque test pour configurer l'environnement.

import { vi, afterEach, expect } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Étend expect avec les matchers de jest-dom
expect.extend(matchers);

// Nettoie le DOM après chaque test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock de window.matchMedia (utilisé par certains composants)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock de ResizeObserver
(globalThis as any).ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock de IntersectionObserver (pour le lazy loading)
(globalThis as any).IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock de fetch global
(globalThis as any).fetch = vi.fn();

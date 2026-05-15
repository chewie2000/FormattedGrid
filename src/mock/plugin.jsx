// Mock implementation of @sigmacomputing/plugin for local dev testing.
// In production, @sigmacomputing/plugin resolves to the real SDK.
// In mock mode (vite.config.mock.js), it resolves here instead.
import { createContext, useContext } from 'react';

const Ctx = createContext(null);

export const client = {};

// Accepts a mockState prop; the real SDK's SigmaClientProvider ignores unknown props.
export function SigmaClientProvider({ children, mockState }) {
  return <Ctx.Provider value={mockState}>{children}</Ctx.Provider>;
}

export function useEditorPanelConfig() {}

export function useLoadingState(initial) {
  return [initial, () => {}];
}

export function usePlugin() {
  return { config: { setKey() {} } };
}

export function useConfig() {
  return useContext(Ctx)?.config ?? {};
}

export function useElementData(sourceId) {
  const ctx = useContext(Ctx);
  if (!sourceId) return {};
  return ctx?.elementData?.[sourceId] ?? {};
}

export function useElementColumns(sourceId) {
  const ctx = useContext(Ctx);
  if (!sourceId) return {};
  return ctx?.elementColumns?.[sourceId] ?? {};
}

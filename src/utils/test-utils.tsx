import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppProvider } from '@/contexts/AppContext';
import { StudioProvider } from '@/contexts/StudioContext';

/**
 * Custom render function that includes all providers
 * Use this instead of the default render from @testing-library/react
 */
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <StudioProvider>{children}</StudioProvider>
    </AppProvider>
  );
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

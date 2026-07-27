import { render } from '@testing-library/react'
import { Providers, useApp, FeatureFlag } from '@/app/providers'
import { ReactNode } from 'react'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Test component to access context
function TestConsumer({ onReady }: { onReady: (ctx: ReturnType<typeof useApp>) => void }) {
  const ctx = useApp()
  onReady(ctx)
  return <div>Test</div>
}

function renderWithProviders(children: ReactNode) {
  return render(<Providers>{children}</Providers>)
}

describe('Providers', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('provides allWards array', () => {
    // Held in an object so TypeScript does not narrow it to `null` - it cannot
    // see that the onReady callback has already run by the time we assert.
    const held: { context: ReturnType<typeof useApp> | null } = { context: null }
    renderWithProviders(
      <TestConsumer onReady={(ctx) => { held.context = ctx }} />
    )
    const context = held.context
    expect(context?.allWards).toContain('Byron')
    expect(context?.allWards).toContain('Shelley')
    expect(context?.allWards.length).toBe(5)
  })
})

describe('hasFeature', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  const features: FeatureFlag[] = [
    'links',
    'workflows',
    'guides',
    'ward_tasks',
    'patient_list',
    'discharge_flow',
    'nexus_sync',
  ]

  test.each(features)(
    'hasFeature(%s) always returns true',
    (feature) => {
      const held: { context: ReturnType<typeof useApp> | null } = { context: null }
      renderWithProviders(
        <TestConsumer onReady={(ctx) => { held.context = ctx }} />
      )
      expect(held.context?.hasFeature(feature)).toBe(true)
    }
  )
})

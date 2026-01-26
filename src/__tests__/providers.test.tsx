import { render, screen, act } from '@testing-library/react'
import { Providers, useApp, AppVersion, FeatureFlag } from '@/app/providers'
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

  it('provides default version as light', () => {
    let context: ReturnType<typeof useApp> | null = null
    renderWithProviders(
      <TestConsumer onReady={(ctx) => { context = ctx }} />
    )
    expect(context?.version).toBe('light')
  })

  it('provides allWards array', () => {
    let context: ReturnType<typeof useApp> | null = null
    renderWithProviders(
      <TestConsumer onReady={(ctx) => { context = ctx }} />
    )
    expect(context?.allWards).toContain('Byron')
    expect(context?.allWards).toContain('Shelley')
    expect(context?.allWards.length).toBe(5)
  })
})

describe('hasFeature', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  const featureTests: Array<{
    version: AppVersion
    feature: FeatureFlag
    expected: boolean
  }> = [
    // Light version features
    { version: 'light', feature: 'bookmarks', expected: true },
    { version: 'light', feature: 'workflows', expected: true },
    { version: 'light', feature: 'guides', expected: true },
    { version: 'light', feature: 'ward_tasks', expected: false },
    { version: 'light', feature: 'patient_list', expected: false },

    // Medium version features
    { version: 'medium', feature: 'ward_tasks', expected: true },
    { version: 'medium', feature: 'patient_list', expected: false },
    { version: 'medium', feature: 'audit_logs', expected: true },

    // Max version features
    { version: 'max', feature: 'patient_list', expected: true },
    { version: 'max', feature: 'discharge_flow', expected: true },
    { version: 'max', feature: 'systemon_sync', expected: false },

    // Max+ version features
    { version: 'max_plus', feature: 'systemon_sync', expected: true },
    { version: 'max_plus', feature: 'systemon_notes', expected: true },
  ]

  test.each(featureTests)(
    '$version version should have $feature = $expected',
    ({ version, feature, expected }) => {
      localStorageMock.setItem('inpatient_hub_version', version)

      let context: ReturnType<typeof useApp> | null = null
      renderWithProviders(
        <TestConsumer onReady={(ctx) => { context = ctx }} />
      )

      expect(context?.hasFeature(feature)).toBe(expected)
    }
  )
})

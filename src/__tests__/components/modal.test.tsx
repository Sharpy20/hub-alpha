import { render, screen, fireEvent } from '@testing-library/react'
import { Modal, ModalActions } from '@/components/ui/modal'

// Mock focus-trap-react to avoid issues in test environment
jest.mock('focus-trap-react', () => {
  return function MockFocusTrap({ children }: { children: React.ReactNode }) {
    return <>{children}</>
  }
})

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders when isOpen is true', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('displays the title', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
  })

  it('displays children content', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('Close modal'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    // Click the backdrop (the div with aria-hidden="true")
    const backdrop = document.querySelector('[aria-hidden="true"]')
    if (backdrop) {
      fireEvent.click(backdrop)
    }
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('hides close button when showClose is false', () => {
    render(<Modal {...defaultProps} showClose={false} />)
    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument()
  })

  it('has accessible attributes', () => {
    render(<Modal {...defaultProps} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
  })

  describe('sizes', () => {
    it('applies medium size by default', () => {
      render(<Modal {...defaultProps} />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveClass('max-w-lg')
    })

    it('applies small size', () => {
      render(<Modal {...defaultProps} size="sm" />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveClass('max-w-sm')
    })

    it('applies large size', () => {
      render(<Modal {...defaultProps} size="lg" />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveClass('max-w-2xl')
    })
  })
})

describe('ModalActions', () => {
  it('renders children', () => {
    render(
      <ModalActions>
        <button>Action 1</button>
        <button>Action 2</button>
      </ModalActions>
    )
    expect(screen.getByRole('button', { name: /action 1/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /action 2/i })).toBeInTheDocument()
  })
})

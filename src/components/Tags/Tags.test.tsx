import { describe, test, expect } from 'vitest'
import { render, screen, waitFor, fireEvent } from '../../utils/test-utils'
import { Tags } from './Tags'

describe('Tags', () => {
  test('renders tags container', async () => {
    render(<Tags />)
    await waitFor(() => screen.getByTestId('tags-container'))
  })

  test('renders all category and user tags', async () => {
    render(<Tags />)

    await waitFor(() => {
      expect(screen.getByText('All')).toBeInTheDocument()
    })

    expect(screen.getByText('career')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
    expect(screen.getByText('CSS')).toBeInTheDocument()
  })

  test('shows rename button on hover', async () => {
    render(<Tags />)

    await waitFor(() => {
      expect(screen.getByText('career')).toBeInTheDocument()
    })

    const renameButtons = screen.getAllByTestId('tag-rename-button')
    expect(renameButtons.length).toBeGreaterThan(0)
  })

  test('clicking rename shows input with current tag name', async () => {
    render(<Tags />)

    await waitFor(() => {
      expect(screen.getByText('career')).toBeInTheDocument()
    })

    const renameButtons = screen.getAllByTestId('tag-rename-button')
    fireEvent.click(renameButtons[0])

    const input = screen.getByTestId('tag-rename-input')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('career')
  })

  test('pressing Escape cancels rename', async () => {
    render(<Tags />)

    await waitFor(() => {
      expect(screen.getByText('career')).toBeInTheDocument()
    })

    const renameButtons = screen.getAllByTestId('tag-rename-button')
    fireEvent.click(renameButtons[0])

    const input = screen.getByTestId('tag-rename-input')
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(screen.queryByTestId('tag-rename-input')).not.toBeInTheDocument()
    expect(screen.getByText('career')).toBeInTheDocument()
  })

  test('pressing Enter commits rename', async () => {
    render(<Tags />)

    await waitFor(() => {
      expect(screen.getByText('career')).toBeInTheDocument()
    })

    const renameButtons = screen.getAllByTestId('tag-rename-button')
    fireEvent.click(renameButtons[0])

    const input = screen.getByTestId('tag-rename-input')
    fireEvent.change(input, { target: { value: 'jobs' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    // Input should be gone after commit
    expect(screen.queryByTestId('tag-rename-input')).not.toBeInTheDocument()
  })
})

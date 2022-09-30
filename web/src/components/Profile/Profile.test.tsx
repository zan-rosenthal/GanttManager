import userEvent from '@testing-library/user-event'

import { render, screen, waitFor } from '@redwoodjs/testing/web'

import { Profile } from './Profile'

describe('Profile', () => {
  it('renders successfully', () => {
    expect(() => {
      render(
        <Profile
          error={undefined}
          loading={undefined}
          profile={{ name: 'harry' }}
          onSave={undefined}
        />
      )
    }).not.toThrow()
  })

  it('submits then calls onSave', async () => {
    const mockSave = jest.fn()
    render(
      <Profile
        error={undefined}
        loading={undefined}
        profile={{ name: 'harry' }}
        onSave={mockSave}
      />
    )

    expect(mockSave.mock.calls.length).toBe(0)

    const save = screen.getByRole('button')
    await waitFor(() => userEvent.click(save))

    expect(mockSave.mock.calls.length).toBe(1)
  })
})

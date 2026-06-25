import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SharedLinksProvider, useSharedLinks } from '../SharedLinksContext';

function Probe() {
  const { links, addSharedLink, getLink } = useSharedLinks();
  return (
    <div>
      <span data-testid="count">{Object.keys(links).length}</span>
      <span data-testid="label">{getLink('abc')?.label ?? ''}</span>
      <button
        type="button"
        onClick={() =>
          addSharedLink({
            token: 'abc',
            type: 'document',
            label: 'Doc partagé',
            createdAt: '2026-01-01',
            expiresAt: '2026-12-31',
          })
        }
      >
        add
      </button>
    </div>
  );
}

describe('SharedLinksContext', () => {
  it('addSharedLink stores token and getLink retrieves', async () => {
    render(
      <SharedLinksProvider>
        <Probe />
      </SharedLinksProvider>
    );
    expect(screen.getByTestId('count').textContent).toBe('0');
    await userEvent.click(screen.getByText('add'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('label').textContent).toBe('Doc partagé');
  });
});

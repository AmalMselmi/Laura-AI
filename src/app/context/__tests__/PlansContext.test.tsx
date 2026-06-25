import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlansProvider, usePlans, formatQuota, INITIAL_PLANS } from '../PlansContext';

function Probe() {
  const { getPlan } = usePlans();
  const ent = getPlan('enterprise');
  const rad = getPlan('radpro');
  return (
    <div>
      <span data-testid="ent-scans">{ent?.maxScans ?? 'na'}</span>
      <span data-testid="ent-storage">{ent?.storageGB ?? 'na'}</span>
      <span data-testid="rad-ai">{rad?.aiQuota ?? 'na'}</span>
      <span data-testid="fmt">{formatQuota(-1)}</span>
    </div>
  );
}

describe('PlansContext', () => {
  it('enterprise plan uses -1 as unlimited quotas', () => {
    const ent = INITIAL_PLANS.find(p => p.id === 'enterprise');
    expect(ent?.maxScans).toBe(-1);
    expect(ent?.aiQuota).toBe(-1);
    expect(ent?.storageGB).toBe(-1);
  });

  it('formatQuota renders Illimité for -1', () => {
    render(
      <PlansProvider>
        <Probe />
      </PlansProvider>
    );
    expect(screen.getByTestId('ent-scans').textContent).toBe('-1');
    expect(screen.getByTestId('ent-storage').textContent).toBe('-1');
    expect(screen.getByTestId('rad-ai').textContent).toBe('-1');
    expect(screen.getByTestId('fmt').textContent).toBe('Illimité');
  });
});

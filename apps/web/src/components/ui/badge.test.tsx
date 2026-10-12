import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('uses friendly labels for match statuses', () => {
    render(<Badge status="connected" />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });
  it('applies the ok tone for connected and neutral for unknown', () => {
    const { rerender } = render(<Badge status="connected" />);
    expect(screen.getByText('Connected').className).toContain('text-ok');
    rerender(<Badge status="whatever" />);
    expect(screen.getByText('whatever').className).toContain('text-mid');
  });
  it('honours an explicit label and tone', () => {
    render(<Badge status="x" label="Raising" tone="accent" />);
    expect(screen.getByText('Raising').className).toContain('text-accent-deep');
  });
});

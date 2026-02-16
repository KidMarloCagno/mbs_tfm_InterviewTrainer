import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with accessible label and handles clicks', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button onClick={onClick} variant="outline">
        Start Practice
      </Button>
    );

    const button = screen.getByRole('button', { name: /start practice/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('ui-button');
    expect(button).toHaveClass('ui-button-outline');

    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

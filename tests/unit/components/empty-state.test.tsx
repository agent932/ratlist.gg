/**
 * Unit tests for EmptyState component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/ui/empty-state';

describe('EmptyState', () => {
  it('should render title', () => {
    render(<EmptyState title="No data available" />);
    
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    render(
      <EmptyState
        title="No incidents"
        description="You haven't submitted any incidents yet."
      />
    );
    
    expect(screen.getByText('No incidents')).toBeInTheDocument();
    expect(screen.getByText("You haven't submitted any incidents yet.")).toBeInTheDocument();
  });

  it('should not render description when not provided', () => {
    const { container } = render(<EmptyState title="Empty" />);
    
    const description = container.querySelector('p.text-sm');
    expect(description).not.toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    const TestIcon = <svg data-testid="test-icon" />;
    
    render(<EmptyState title="Test" icon={TestIcon} />);
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('should not render icon container when icon not provided', () => {
    const { container } = render(<EmptyState title="Test" />);
    
    const iconContainer = container.querySelector('.flex.h-12.w-12');
    expect(iconContainer).not.toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    const ActionButton = (
      <button type="button" data-testid="action-button">
        Click me
      </button>
    );
    
    render(<EmptyState title="Test" action={ActionButton} />);
    
    expect(screen.getByTestId('action-button')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <EmptyState title="Test" className="custom-class" />
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('should apply default padding and text-center classes', () => {
    const { container } = render(<EmptyState title="Test" />);
    
    const card = container.firstChild;
    expect(card).toHaveClass('p-8');
    expect(card).toHaveClass('text-center');
  });

  it('should render complete empty state with all props', () => {
    const TestIcon = <svg data-testid="complete-icon" />;
    const ActionButton = <button type="button">Take action</button>;
    
    render(
      <EmptyState
        title="Complete Empty State"
        description="This is a complete example"
        icon={TestIcon}
        action={ActionButton}
        className="my-custom-class"
      />
    );
    
    expect(screen.getByText('Complete Empty State')).toBeInTheDocument();
    expect(screen.getByText('This is a complete example')).toBeInTheDocument();
    expect(screen.getByTestId('complete-icon')).toBeInTheDocument();
    expect(screen.getByText('Take action')).toBeInTheDocument();
    expect(screen.getByText('Complete Empty State').closest('.my-custom-class')).toBeTruthy();
  });

  it('should have correct structure and styling', () => {
    const { container } = render(
      <EmptyState title="Structure Test" description="Testing structure" />
    );
    
    // Should have Card wrapper
    const card = container.firstChild;
    expect(card).toBeInTheDocument();
    
    // Should have flex container
    const flexContainer = container.querySelector('.flex.flex-col');
    expect(flexContainer).toBeInTheDocument();
    expect(flexContainer).toHaveClass('items-center', 'gap-4');
    
    // Should have space-y-2 for text content
    const textContainer = container.querySelector('.space-y-2');
    expect(textContainer).toBeInTheDocument();
  });

  it('should render title with correct styling', () => {
    render(<EmptyState title="Styled Title" />);
    
    const title = screen.getByText('Styled Title');
    expect(title).toHaveClass('text-lg', 'font-medium', 'text-white');
  });

  it('should render description with correct styling', () => {
    render(<EmptyState title="Test" description="Styled description" />);
    
    const description = screen.getByText('Styled description');
    expect(description).toHaveClass('text-sm', 'text-white/60');
  });

  it('should render icon container with correct styling', () => {
    const TestIcon = <svg data-testid="styled-icon" />;
    const { container } = render(<EmptyState title="Test" icon={TestIcon} />);
    
    const iconContainer = container.querySelector('.flex.h-12.w-12');
    expect(iconContainer).toHaveClass(
      'items-center',
      'justify-center',
      'rounded-full',
      'bg-white/5'
    );
  });
});

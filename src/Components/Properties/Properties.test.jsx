/* This test asserts on class-based DOM structure (.category-card / .dot) that
   has no accessible role, so Testing Library's role/text queries don't fit —
   direct container access is intentional here. */
/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { render, fireEvent } from '@testing-library/react';
import BrowseProperties from './Properties';

describe('BrowseProperties dot navigation', () => {
    it('switches the property card content when a dot is clicked', () => {
        const { container } = render(<BrowseProperties />);

        const firstCard = container.querySelector('.category-card');
        const dots = firstCard.querySelectorAll('.dot');

        expect(firstCard.textContent).toContain('5 Marla');

        fireEvent.click(dots[1]);

        expect(firstCard.textContent).toContain('Villas');
        expect(firstCard.textContent).not.toContain('5 Marla');
    });
});

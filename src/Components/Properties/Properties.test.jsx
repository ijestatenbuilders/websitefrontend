/* This test asserts on class-based DOM structure (.category-card / .dot) that
   has no accessible role, so Testing Library's role/text queries don't fit —
   direct container access is intentional here. */
/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { render, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BrowseProperties from './Properties';

describe('BrowseProperties dot navigation', () => {
    it('switches from popular properties to size options when a dot is clicked', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ blockOptions: ['All', 'Villas'] }),
        }));
        const { container } = render(
            <MemoryRouter>
                <BrowseProperties />
            </MemoryRouter>
        );

        await waitFor(() => expect(container.querySelector('.category-card')).not.toBeNull());
        const firstCard = container.querySelector('.category-card');
        const card = within(firstCard);

        expect(card.getByText('Villas')).toBeInTheDocument();

        fireEvent.click(card.getByRole('button', { name: 'Show Size tab' }));

        expect(card.getByText('5 Marla')).toBeInTheDocument();
        expect(card.queryByText('Villas')).not.toBeInTheDocument();
    });
});

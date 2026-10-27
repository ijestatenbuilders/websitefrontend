import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the landing page', () => {
  render(<App />);
  const landingPage = screen.getByRole('button', { name: 'IJ Estate & Builders' });
  expect(landingPage).toBeInTheDocument();
});

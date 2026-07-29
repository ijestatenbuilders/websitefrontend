import { render, screen } from '@testing-library/react';
import App from './App';

test('renders landing page', () => {
  render(<App />);
  const landingPage = screen.getByRole('main');
  expect(landingPage).toBeInTheDocument();
});

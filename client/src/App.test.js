import { render, screen } from '@testing-library/react';
import App from 'src/App';

test('renders app component', () => {
  render(<App />);
  const anyElement = screen.getAllByText('');
  expect(anyElement.at(-1)).toBeInTheDocument();
});

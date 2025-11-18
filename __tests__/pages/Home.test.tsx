
import { render, screen, mockUseAuth } from '../test-utils';
import HomePage from '../../app/page';

describe('Home Page', () => {
  it('should render the main heading after loading', async () => {
    // Mock the useAuth hook to return a mock user
    mockUseAuth.mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
      loading: false,
    });

    render(<HomePage />);

    const heading = await screen.findByRole('heading', {
      name: /Hub de Módulos/i,
    });

    expect(heading).toBeInTheDocument();
  });
});

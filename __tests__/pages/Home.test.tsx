
import { render, screen } from '../test-utils';
import HomePage from '../../app/page';

describe('Home Page', () => {
  // A função de teste agora é `async`
  it('should render the main heading after loading', async () => {
    render(<HomePage />);

    // CORREÇÃO: Usa `findByRole` que espera o elemento aparecer.
    // Isso aguarda o provedor de autenticação terminar de carregar e o conteúdo real da página ser renderizado.
    const heading = await screen.findByRole('heading', {
      name: /Aplicação React Modular/i,
    });

    expect(heading).toBeInTheDocument();
  });
});

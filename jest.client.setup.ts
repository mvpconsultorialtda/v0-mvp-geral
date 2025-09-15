// Importa os matchers personalizados da Testing Library, como .toBeInTheDocument()
import '@testing-library/jest-dom';

// Adiciona um polyfill para a API `fetch` no ambiente de teste jsdom.
import 'whatwg-fetch';

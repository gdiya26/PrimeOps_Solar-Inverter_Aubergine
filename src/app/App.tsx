import { RouterProvider } from 'react-router';
import { router } from './routes';
import { BlockProvider } from './contexts/BlockContext';

export default function App() {
  return (
    <BlockProvider>
      <RouterProvider router={router} />
    </BlockProvider>
  );
}

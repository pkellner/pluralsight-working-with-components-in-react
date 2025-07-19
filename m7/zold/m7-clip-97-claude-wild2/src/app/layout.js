/**
 * RootLayout Component
 * 
 * This is a SERVER COMPONENT that sets up the HTML document structure.
 * It remains a server component because:
 * 1. It only renders static HTML structure
 * 2. It imports CSS files which are handled at build time
 * 3. It defines metadata which is a server-only feature
 * 4. It doesn't use any hooks or browser APIs
 * 
 * This component wraps the entire app with ClientProviders to provide
 * global client-side context (theme) to all child components.
 */

import "../../styles/bootstrap.min.css";
import "../../styles/site.css";
import "../../styles/fontawesome/css/all.css";
import "../../styles/poppins/poppins.css";
import ClientProviders from '../components/providers/ClientProviders';

export const metadata = {
  title: 'Todo App - Server/Client Components Demo',
  description: 'A React 19 todo app demonstrating server and client components',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* 
          ClientProviders is a client component that wraps the app with
          global providers (ThemeProvider). This enables theme functionality
          throughout the app while keeping the layout as a server component.
        */}
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}

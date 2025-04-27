import '../app/globals.css';
import 'antd/dist/reset.css';
import { ConfigProvider } from 'antd';
import AppLayout from '@/components/Layout';

export const metadata = {
  title: 'MyApp',
  description: 'Dashboard app with Ant Design and Laravel API',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ConfigProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </ConfigProvider>
      </body>
    </html>
  );
}



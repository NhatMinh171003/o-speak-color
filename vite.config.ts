import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  server: {
    open: true, // tự động mở browser
    watch: {
      // Theo dõi thay đổi trong thư mục public để auto-reload
      ignored: ['!**/public/**']
    }
  },
  plugins: [
    {
      name: 'reload-on-public-change',
      handleHotUpdate({ file, server }) {
        if (file.includes('public')) {
          server.ws.send({ type: 'full-reload' });
        }
      }
    }
  ]
});

import path from 'path'
import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    // 开发模式热更新
    reactRefresh(),
    // 打包时，生成 d.ts 文件
    dts()
  ],
  // 环境变量
  define: {
    // 'process.env.NODE_ENV': '"development"',
  },
  build: {
    outDir: 'lib/',
    // 如果不需要 sourcemap 则注释以下四行
    sourcemap: true,
    terserOptions: {
      sourceMap: true,
    },
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: 'Test2',
      // 默认的输出模式是 ['es', 'umd'] ，如果库有特殊处理，可以修改这里
      // formats: ['es', 'umd']
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['react', 'react-dom'],
      output: {
        // 如果需要 Named exports 则打开这个
        // exports: 'named',
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        }
      }
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  }
})

import '../styles/globals.css'
import type { AppProps } from 'next/app'

// import store from '../app/store';
// import { Provider } from 'react-redux';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Component {...pageProps} />
  )
}

export default MyApp

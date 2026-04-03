import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000*60*5, retry: 1, refetchOnWindowFocus: false },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background:'#1E1E2E', color:'#F0EEF8',
              border:'1px solid rgba(255,255,255,0.1)',
              fontFamily:'Satoshi,sans-serif', fontSize:'14px', borderRadius:'10px',
            },
            success:{ iconTheme:{ primary:'#84CC16', secondary:'#000' } },
            error:  { iconTheme:{ primary:'#F87171', secondary:'#fff' } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)

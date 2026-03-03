import './globals.css'

export const metadata = {
  title: 'Banger Ratios - The Real Measure of Musical Consistency',
  description: 'Rate every track. See the Banger Ratio. Settle the debate.',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  )
}

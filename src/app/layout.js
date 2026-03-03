import './globals.css'
import Nav from './components/Nav'

export const metadata = {
  title: 'Banger Ratios — The Real Measure of Musical Consistency',
  description: 'Rate every track on a scale of 1-7. See the Banger Ratio. Settle the debate.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
      </body>
    </html>
  )
}

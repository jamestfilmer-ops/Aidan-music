export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const term = searchParams.get('term')
  if (!term) return Response.json({ results: [] })
  const res = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=album&limit=12`
  )
  const data = await res.json()
  return Response.json(data)
}
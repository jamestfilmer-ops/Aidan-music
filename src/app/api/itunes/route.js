export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  const res = await fetch(
    `https://itunes.apple.com/lookup?id=${id}&entity=song`
  )
  const data = await res.json()
  
  return Response.json(data)
}
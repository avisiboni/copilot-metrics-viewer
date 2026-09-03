export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  // Log path only — query strings may contain sensitive params (mock, dates, etc.)
  console.log(`Request: ${event.method} ${url.pathname}`)
})
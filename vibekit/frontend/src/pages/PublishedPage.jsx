import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../lib/api'
import PageRenderer from '../components/editor/PageRenderer'

function Skeleton() {
  return (
    <div style={{ minHeight:'100vh', background:'#FAFAF9' }}>
      <div style={{ background:'#fff', borderBottom:'1px solid #E8E8E3', height:60 }}/>
      <div style={{ padding:'5rem 2rem', display:'flex', flexDirection:'column', alignItems:'center', gap:'1.5rem' }}>
        <div className="skeleton" style={{ height:56, width:'60%', maxWidth:480 }}/>
        <div className="skeleton" style={{ height:24, width:'40%', maxWidth:320 }}/>
        <div className="skeleton" style={{ height:48, width:140, marginTop:'1rem' }}/>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'2rem' }}>
      <div style={{ fontFamily:'var(--font-display)', fontSize:'6rem', fontWeight:700, color:'#1E1E2E', lineHeight:1, marginBottom:'1rem' }}>404</div>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.75rem', fontWeight:700, color:'#F0EEF8', marginBottom:'0.75rem' }}>Page not found</h1>
      <p style={{ color:'#A8A5BE', fontSize:'1rem', marginBottom:'2rem', lineHeight:1.65, maxWidth:360 }}>This page doesn't exist or has been unpublished by its owner.</p>
      <Link to="/" className="btn btn-primary btn-lg">← Back to VibeKit Studio</Link>
    </div>
  )
}

export default function PublishedPage() {
  const { slug } = useParams()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-page', slug],
    queryFn:  () => publicApi.getPage(slug),
    retry: false,
    staleTime: 1000 * 60,
  })

  useEffect(() => {
    if (slug) publicApi.trackView(slug).catch(() => {})
  }, [slug])

  if (isLoading) return <Skeleton/>
  if (isError || !data?.data?.page) return <NotFound/>

  const page = data.data.page

  return (
    <PageRenderer
      theme={page.theme}
      sections={page.sections}
      title={page.title}
      slug={page.slug}
      isPreview={false}
      viewCount={page.view_count}
    />
  )
}

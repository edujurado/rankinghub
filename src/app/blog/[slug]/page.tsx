import BlogPost from '@/components/BlogPost'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  return <BlogPost slug={params.slug} />
}

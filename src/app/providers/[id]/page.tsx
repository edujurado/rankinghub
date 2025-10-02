import ProviderProfile from '@/components/ProviderProfile'

interface ProviderPageProps {
  params: {
    id: string
  }
}

export default function ProviderPage({ params }: ProviderPageProps) {
  return <ProviderProfile providerId={params.id} />
}

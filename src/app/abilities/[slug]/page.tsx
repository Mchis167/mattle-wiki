interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AbilityDetailPage({ params }: Props) {
  const { slug } = await params;
  return (
    <main>
      <h1>Ability Detail: {slug}</h1>
    </main>
  );
}

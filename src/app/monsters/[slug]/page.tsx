interface Props {
  params: Promise<{ slug: string }>;
}

export default async function MonsterDetailPage({ params }: Props) {
  const { slug } = await params;
  return (
    <main>
      <h1>Monster Detail: {slug}</h1>
    </main>
  );
}

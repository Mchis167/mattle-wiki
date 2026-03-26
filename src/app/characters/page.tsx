import { client } from "@/sanity/lib/client";
import { ALL_CHARACTERS_QUERY } from "@/sanity/lib/queries";
import BookLayout from "@/components/layout/BookLayout";
import CharactersFlipBook from "@/components/characters/CharactersFlipBook";
import { Character } from "@/types/character";

export const revalidate = 60;

export default async function CharactersPage() {
  const allCharacters: Character[] = await client.fetch(ALL_CHARACTERS_QUERY);

  return (
    <BookLayout>
      <CharactersFlipBook characters={allCharacters} />
    </BookLayout>
  );
}

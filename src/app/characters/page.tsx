import { client } from "@/sanity/lib/client";
import { ALL_CHARACTERS_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import BookLayout from "@/components/layout/BookLayout";
import MainCardCharacter from "@/components/detail/MainCardCharacter";
import SpreadPagination from "@/components/ui/SpreadPagination";
import { Character } from "@/types/character";

export const revalidate = 60; // Revalidate every minute

interface PageProps {
  searchParams: { page?: string };
}

const ITEMS_PER_PAGE = 18;

export default async function CharactersPage({ searchParams }: PageProps) {
  const currentPage = parseInt(searchParams.page || "1", 10);
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Fetch all characters from Sanity
  const allCharacters: Character[] = await client.fetch(ALL_CHARACTERS_QUERY);
  const totalCharacters = allCharacters.length;
  const totalPages = Math.ceil(totalCharacters / ITEMS_PER_PAGE);

  // Get characters for current spread (18 items)
  const spreadCharacters = allCharacters.slice(skip, skip + ITEMS_PER_PAGE);
  
  // Split into left (9) and right (9)
  const leftCharacters = spreadCharacters.slice(0, 9);
  const rightCharacters = spreadCharacters.slice(9, 18);

  return (
    <BookLayout>
      <div className="flex flex-col h-full relative">
        {/* Main Spread Container */}
        <div className="flex-1 flex min-h-0 self-stretch">
          {/* Left Page (3x3 Grid) */}
          <div 
            className="flex-1 grid grid-cols-3 grid-rows-3 self-stretch justify-items-center items-start"
            style={{ 
              padding: "56px 56px 24px 32px",
              rowGap: "24px",
              columnGap: "16px"
            }}
          >
            {leftCharacters.map((char) => (
              <MainCardCharacter
                key={char._id}
                charName={char.name}
                energyCost={char.energyCons}
                characterImage={urlFor(char.image).url()}
              />
            ))}
          </div>

          {/* Spacer for Spine (Match BookLayout's divider width) */}
          <div className="w-[3px] shrink-0" />

          {/* Right Page (3x3 Grid) */}
          <div 
            className="flex-1 grid grid-cols-3 grid-rows-3 self-stretch justify-items-center items-start"
            style={{ 
              padding: "56px 32px 24px 56px",
              rowGap: "24px",
              columnGap: "16px"
            }}
          >
            {rightCharacters.map((char) => (
              <MainCardCharacter
                key={char._id}
                charName={char.name}
                energyCost={char.energyCons}
                characterImage={urlFor(char.image).url()}
              />
            ))}
          </div>
        </div>

        {/* Navigation Controls */}
        {totalPages > 1 && (
          <SpreadPagination currentPage={currentPage} totalPages={totalPages} />
        )}

        {totalCharacters === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-wiki-text-muted font-pixel text-sm">
            No characters found.
          </div>
        )}
      </div>
    </BookLayout>
  );
}

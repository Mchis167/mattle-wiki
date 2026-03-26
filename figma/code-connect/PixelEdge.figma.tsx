import figma from "@figma/code-connect";
import { PixelEdge9, PixelEdge27 } from "./PixelEdge";

// Figma ComponentSet: ContainerEdge (node 10:3884)
// Variants: Type = Left | Right

// Left edge (mirrored=false)
figma.connect(
  PixelEdge27,
  "https://www.figma.com/design/87Sgue3XLlaj2b6qw2oLUR/Wiki?node-id=10-3884",
  {
    variant: { Type: "Left" },
    example: () => <PixelEdge27 mirrored={false} />,
  }
);

// Right edge (mirrored=true)
figma.connect(
  PixelEdge27,
  "https://www.figma.com/design/87Sgue3XLlaj2b6qw2oLUR/Wiki?node-id=10-3884",
  {
    variant: { Type: "Right" },
    example: () => <PixelEdge27 mirrored={true} />,
  }
);

// Single 9px edge — used inline (e.g. tab staircase)
figma.connect(
  PixelEdge9,
  "https://www.figma.com/design/87Sgue3XLlaj2b6qw2oLUR/Wiki?node-id=10-3884",
  {
    example: () => <PixelEdge9 />,
  }
);

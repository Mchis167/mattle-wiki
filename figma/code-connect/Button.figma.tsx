import figma from "@figma/code-connect";
import Button from "./Button";

// Figma ComponentSet: PrimaryButton (node 1:3308)
// Variants: Size × State
figma.connect(
  Button,
  "https://www.figma.com/design/87Sgue3XLlaj2b6qw2oLUR/Wiki?node-id=1-3308",
  {
    props: {
      size: figma.enum("Size", {
        Large: "Large",
        Small: "Small",
      }),
      label: figma.string("Label"),
    },
    example: ({ size, label }) => (
      <Button size={size} label={label} href="https://app.mattle.fun/game" target="_blank" />
    ),
  }
);

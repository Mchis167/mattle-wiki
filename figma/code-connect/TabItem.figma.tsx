import figma from "@figma/code-connect";
import { TabItem } from "./TabItem";

// Figma ComponentSet: TabItem (node 1:3522)
// Variants: State = Selected | Enable | Hover
figma.connect(
  TabItem,
  "https://www.figma.com/design/87Sgue3XLlaj2b6qw2oLUR/Wiki?node-id=1-3522",
  {
    props: {
      label: figma.string("Label"),
      state: figma.enum("State", {
        Selected: "selected",
        Enable: "enable",
        Hover: "hover",
      }),
    },
    example: ({ label, state }) => <TabItem label={label} state={state} />,
  }
);

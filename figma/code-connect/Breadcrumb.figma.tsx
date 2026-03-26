import figma from "@figma/code-connect";
import { BreadcrumbContainer } from "./Breadcrumb";

// Figma ComponentSet: BreadcrumbItem (node 9:3521)
// Variants: State = Enable | Hover | CurrentPage
figma.connect(
  BreadcrumbContainer,
  "https://www.figma.com/design/87Sgue3XLlaj2b6qw2oLUR/Wiki?node-id=9-3521",
  {
    example: () => (
      <BreadcrumbContainer
        items={[
          { label: "Characters", href: "/characters" },
          { label: "Zephyr" },
        ]}
      />
    ),
  }
);

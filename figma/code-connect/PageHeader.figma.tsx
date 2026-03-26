import figma from "@figma/code-connect";
import PageHeader from "./PageHeader";

// Figma ComponentSet: PageHeader (node 9:3552)
// Variants: type × IsMobile
figma.connect(
  PageHeader,
  "https://www.figma.com/design/87Sgue3XLlaj2b6qw2oLUR/Wiki?node-id=9-3552",
  {
    props: {
      type: figma.enum("type", {
        IndexPage: "IndexPage",
        DetailPage: "DetailPage",
      }),
      isMobile: figma.enum("IsMobile", {
        True: true,
        False: false,
      }),
    },
    example: ({ type, isMobile }) => (
      <PageHeader type={type} isMobile={isMobile} />
    ),
  }
);

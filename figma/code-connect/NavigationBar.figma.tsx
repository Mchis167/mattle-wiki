import figma from "@figma/code-connect";
import NavigationBar from "./NavigationBar";

// Figma ComponentSet: NavigationBar (node 11:6912)
// Variants: IsMobile
figma.connect(
  NavigationBar,
  "https://www.figma.com/design/87Sgue3XLlaj2b6qw2oLUR/Wiki?node-id=11-6912",
  {
    props: {
      isMobile: figma.enum("IsMobile", {
        True: true,
        False: false,
      }),
    },
    example: ({ isMobile }) => <NavigationBar isMobile={isMobile} />,
  }
);

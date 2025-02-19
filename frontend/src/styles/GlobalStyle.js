import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
 html, body, #root {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

#map-container {
  height: 100%;
  width: 100%;
  /* temporarily set the background color so we can tell where the map container is positioned */
  background-color: lightgrey;
}
`;

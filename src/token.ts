import { Token } from "./types";

export const genTextToken = (
  id: string,
  text: string,
  parent: Token
): Token => {
  return {
    id,
    elmType: "text",
    content: text,
    parent,
  };
};

export const genStrongToken = (
  id: string,
  text: string,
  parent: Token
): Token => {
  return {
    id,
    elmType: "strong",
    content: text,
    parent,
  };
};

export const genParagraphToken = (
  id: string,
  text: string,
  parent: Token
): Token => ({
  id,
  elmType: "paragraph",
  content: text,
  parent,
});

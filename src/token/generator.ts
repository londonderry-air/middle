import { Token } from "token/models/token";

export const genTextToken = (
    id: number,
    text: string, 
    parent: Token
): Token => {
    return {
      id,
      elmType: 'text',
      content: text,
      parent,
    };
}

export const genStrongToken = (
    id: number,
    text: string, 
    parent: Token
): Token => {
    return {
      id: id,
      elmType: 'strong',
      content: text,
      parent,
    };
}

export const genParagraphToken = (
  id: number,
  text: string,
  parent: Token
): Token => ({
  id: id,
  elmType: 'paragraph',
  content: text,
  parent
})
export type ElementType =
  | "root"
  | "text"
  | "strong"
  | "ul"
  | "li"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "itaric"
  | "si"
  | "list"
  | "img"
  | "ol"
  | "link"
  | "code"
  | "paragraph"
  | "break"
  | "pre"
  | "blockquote"
  | "component";

export type Attribute = {
  attrName: string;
  attrValue: string;
};

export type CSSClassList = {
  h1?: string;
  h2?: string;
  h3?: string;
  h4?: string;
  h5?: string;
  strong?: string;
  itaric?: string;
  si?: string;
  ul?: string;
  li?: string;
  img?: string;
  ol?: string;
  a?: string;
  code?: string;
  pre?: string;
  paragraph?: string;
  blockquote?: string;
  root?: string;
};

export type AnalysisState = "neutral" | "list" | "pre" | "blockquote";

export type Token = {
  id: string;
  parent: Token;
  elmType: ElementType;
  content: string;
  attributes?: Attribute[];
  props?: string[];
};

export type MergedToken = {
  id: string;
  elmType: "merged";
  content: string;
  parent: Token | MergedToken;
  attributes?: Attribute[];
  props?: string[];
};

export type TokenizeSource = {
  element: ElementType;
  matchList: RegExpMatchArray;
};

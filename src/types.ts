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

export type ComponentToken = {
  id: string;
  elmType: "component";
  content: string;
  parent: Token | MergedToken;
  attributes?: Attribute[];
  props?: string[];
};

export type TokenizeSource = {
  element: ElementType;
  matchList: RegExpMatchArray;
};

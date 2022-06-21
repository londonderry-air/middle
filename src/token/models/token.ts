import { Attribute, ElementType } from "element/models/element"

export type Token = {
   id: string
   parent: Token
   elmType: ElementType
   content: string
   attributes?: Attribute[]
}

export type MergedToken = {
   id: string;
   elmType: 'merged';
   content: string;
   parent: Token | MergedToken;
   attributes?: Attribute[]
}

export type TokenizeSource = {
   element: ElementType,
   matchList: RegExpMatchArray
}
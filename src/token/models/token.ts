import { Attribute, ElementType } from "src/element/models/element"

export type Token = {
   id: number
   parent: Token
   elmType: ElementType
   content: string
   attributes?: Attribute[]
}

export type MergedToken = {
   id: number;
   elmType: 'merged';
   content: string;
   parent: Token | MergedToken;
   attributes?: Attribute[]
}

export type TokenizeSource = {
   element: ElementType,
   matchList: RegExpMatchArray
}
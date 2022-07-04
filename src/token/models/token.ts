import { Attribute, ElementType } from "element/models/element"

export type Token = {
   id: string
   parent: Token
   elmType: ElementType
   content: string
   attributes?: Attribute[]
   props?: string[]
}

export type MergedToken = {
   id: string;
   elmType: 'merged';
   content: string;
   parent: Token | MergedToken;
   attributes?: Attribute[];
   props?: string[]
}


export type ComponentToken = {
   id: string;
   elmType: 'component';
   content: string;
   parent: Token | MergedToken;
   attributes?: Attribute[];
   props?: string[]
}

export type TokenizeSource = {
   element: ElementType,
   matchList: RegExpMatchArray
}
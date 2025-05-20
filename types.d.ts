class Verse {
  lines: Array<string>;
  constructor(lines: string[]) {
    this.lines = lines;
  }
}

class Section {
  name: string;
  verses: Array<Verse>;
  constructor(name: string, verses: Verse[]) {
    this.name = name;
    this.verses = verses;
  }
}

class Note {
  name: string;
  text: string;
  constructor(name: string, text: string) {
    this.name = name;
    this.text = text;
  }
}

class SongElementIdentifier {
  type: "section" | "note" | "repeat";
  name: string;
  constructor(type: "section" | "note" | "repeat", name: string) {
    this.type = type;
    this.name = name;
  }
}

class SongProperties {
  title: string;
  author: string;
  constructor(title: string, author: string) {
    this.title = title;
    this.author = author;
  }
}

class Song {
  properties: SongProperties;
  sections: Array<Section>;
  notes: Note[];
  sectionOrder: Array<SongElementIdentifier>;
  constructor(
    properties: SongProperties,
    sections: Section[],
    notes: Note[],
    sectionOrder: SongElementIdentifier[],
  ) {
    this.properties = properties;
    this.sections = sections;
    this.notes = notes;
    this.sectionOrder = sectionOrder;
  }
}

type InvokeJSON = (obj: any) => Promise<any>;

interface Window {
  electron: {
    invokeReadElement: (
      callback: (newElement: OpenElementType) => void,
    ) => void;
    invokeSaveSong: (song: Song) => Promise<void>;
    sendSetLiveElement: (index: number, liveElement: LiveElementType) => void;
    sendSetLogo: (value: boolean) => void;
    invokeGetLogo: (index: number, callback: (logo: boolean) => void) => void;
    invokeReadDisplaySetting: InvokeJSON;
    testFunction: () => string;
    sendNewDisplayWindow: (index: number) => void;
    sendAlert: (message: string) => void;
    invokeIndex: () => Promise<any>;
    invokeImagePath: () => Promise<string>;
    sendUpdateCss: (
      index: number,
      arrayName: DisplayConfigArrayName,
      entry: DisplayConfigEntryType,
    ) => void;
    sendGetLiveElement: (index: number) => void;

    sendReqCss: (index: number) => void;
    onResCss: (index: number, callback: (css: string) => void) => void;
    onDisplayLogo: (callback: (logo: boolean) => void) => void;
    onDisplayText: (index: number, callback: (text: string) => void) => void;
    onDisplayNone: (index: number, callback: () => void) => void;
    onDisplayImage: (index: number, callback: (path: string) => void) => void;
  };
}

type DisplayConfigEntryValueType =
  | "boolean"
  | "csscolor"
  | "font"
  | "number"
  | "path";

type DisplayConfigEntryType = {
  key: string;
  special?: boolean;
  css: string;
  type: DisplayConfigEntryValueType;
  default: any;
  value: any;
  unit?: string;
};

type DisplayConfigType = {
  global: DisplayConfigEntryType[];
  text: DisplayConfigEntryType[];
};

type DisplayConfigArrayName = "global" | "text";

type FullDisplayConfigType = {
  globalDisplay: DisplayConfigType;
  specificDisplays: DisplayConfigType[];
};

type CssTransmissionType = {
  arrayName: DisplayConfigArrayName;
  css: string;
};

type StateObject<T> = {
  value: T;
  set: (newValue: T) => void;
};

type Image = {
  path: string;
  title: string;
};

/**
 * type: "none" | "song"
 */
type OpenElementType = {
  type: "none" | "song" | "image";
  song?: Song;
  image?: Image;
};
type OpenElementState = StateObject<OpenElementType>;
type OpenElementsState = StateObject<OpenElementType[]>;

/**
 * type: "none" | "text" (for lyrics)
 * value: text or path to be projected
 * buttonID: ui button that was selected (if applicable). if -1 -> none.
 * object: literal reference to the song or whatever object in react
 */
type LiveElementType = {
  type: "text" | "image" | "none";
  value: string;
  buttonID: number;
  object: any;
};

type IndexedLiveElementsObject = {
  index: number;
  liveElement: LiveElementType;
};

type LiveElementsState = {
  value: LiveElementType[];
  set: (IndexedLiveElementsObject) => void;
};

type NullFullDisplayConfigState = StateObject<FullDisplayConfigType | null>;

type GlobalContextType = {
  MAX_LIVE_ELEMENTS: number;
  liveElementsState: LiveElementsState;
  openElements: OpenElementsState;
  viewElement: OpenElementState;
  logoState: StateObject<boolean>;
  bodyContent: {
    value: "main" | "display";
    set: React.Dispatch<React.SetStateAction<"main" | "display">>;
  };
  displayConfig: NullFullDisplayConfigState;
};

//LATEST

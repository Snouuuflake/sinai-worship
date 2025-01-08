type testType = {
  testProp: number;
};

interface Window {
  electron: {
    testFunction: () => string;
    sendNewDisplayWindow: (index: number) => void;
    invokeIndex: () => Promise<any>;
  };
}

type Verse = {
  lines: Array<string>;
};

type Section = {
  name: string;
  verses: Array<Verse>;
};

type Song = {
  title: string;
  author: string | null;
  sections: Array<Section>;
  sectionOrder: Array<string>;
};

type GlobalContextType = {
  liveElement1: LiveElementState;
  liveElement2: LiveElementState;
  openElement: OpenElementState;
};

/**
 * type: "none" | "song"
 */
type OpenElementType = {
  type: string;
  song: Song?;
};

type OpenElementState = {
  value: OpenElementType;
  set: (newValue: OpenElementType) => void;
};

/**
 * type: "none" | "text" (for lyrics)
 * value: text or path to be projected
 * buttonID: ui button that was selected (if applicable). if -1 -> none.
 */
type LiveElementType = {
  type: string;
  value: string;
  buttonID: number;
};

type LiveElementState = {
  value: LiveElementType;
  set: (newValue: LiveElementType) => void;
};

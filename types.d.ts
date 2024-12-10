type testType = {
  testProp: number;
};

interface Window {
  electron: {
    testFunction: () => string;
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
  author: string;
  sections: Array<Section>;
  sectionOrder: Array<string>;
};

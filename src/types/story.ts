export interface Section {
  name: string;
  description: string;
  status: 'not_tested' | 'passed' | 'failed';
  notes: string;
}

export interface Test {
  id: string;
  title: string;
  template: string;
  templateId: string;
  sections: Section[];
  status: 'not_tested' | 'passed' | 'failed';
}

export interface Story {
  id: string;
  title: string;
  description: string;
  tests: Test[];
  createdAt: string;
}

export interface StoryFolder {
  id: string;
  name: string;
  createdAt: string;
  parentId: string | null;
  stories: Story[];
  subfolders: StoryFolder[];
}

export type StoryItem = Story | StoryFolder;
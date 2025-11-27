
// This file is no longer used by the component but is kept for reference.
// The component now fetches live data from the GitHub API.

export interface MockCommit {
  sha: string;
  author: string;
  message: string;
  files: {
    path: string;
    changes: number; // Lines added/changed
  }[];
}

export const mockCommits: MockCommit[] = [
  {
    sha: 'commit1',
    author: 'dev1',
    message: 'Initial commit',
    files: [
      { path: 'src/app.js', changes: 50 },
      { path: 'package.json', changes: 20 },
      { path: '.gitignore', changes: 5 },
    ],
  },
  {
    sha: 'commit2',
    author: 'dev2',
    message: 'Add authentication feature',
    files: [
      { path: 'src/app.js', changes: 30 },
      { path: 'src/auth/login.js', changes: 100 },
      { path: 'src/auth/signup.js', changes: 80 },
    ],
  },
  {
    sha: 'commit3',
    author: 'dev1',
    message: 'Refactor login component',
    files: [
      { path: 'src/auth/login.js', changes: -20 },
      { path: 'src/auth/authService.js', changes: 60 },
    ],
  },
  {
    sha: 'commit4',
    author: 'dev3',
    message: 'Implement user profile page',
    files: [
      { path: 'src/profile/view.js', changes: 150 },
      { path: 'src/profile/edit.js', changes: 120 },
      { path: 'src/app.js', changes: 10 },
    ],
  },
  {
    sha: 'commit5',
    author: 'dev2',
    message: 'Fix bug in signup form validation',
    files: [
      { path: 'src/auth/signup.js', changes: 15 },
    ],
  },
  {
    sha: 'commit6',
    author: 'dev1',
    message: 'Add UI components library',
    files: [
      { path: 'components/Button.js', changes: 40 },
      { path: 'components/Input.js', changes: 35 },
      { path: 'package.json', changes: 5 },
    ],
  },
  {
    sha: 'commit7',
    author: 'dev3',
    message: 'Update profile page with new components',
    files: [
      { path: 'src/profile/view.js', changes: 50 },
      { path: 'src/profile/edit.js', changes: 40 },
    ],
  },
  {
    sha: 'commit8',
    author: 'dev2',
    message: 'Integrate payment processing',
    files: [
      { path: 'src/payment/checkout.js', changes: 200 },
      { path: 'src/payment/api.js', changes: 180 },
      { path: 'src/app.js', changes: 20 },
    ],
  },
];

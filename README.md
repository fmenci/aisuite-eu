# aisuite-eu
https;//www.aisuite.eu host the application AI Suite (aisuite-eu), created by Franck Menci to serve as a boiler plate to create efficient web applications, on the .Net + Angular technologies.
In this project, offically made public 25/09/2026, although it existed since 2008 under paid licence, you will find tools and shared components designed as a library to import in angular 22.
The demo project enables viewing and testing on components as they are intended.

## Demo
```
npm install
npm start
```
Opens the demo at http://localhost:4200, see [projects/demo](projects/demo/README.md). It shows every component of the library on one single page, one tab per
family of components, with a mocked AI Suite server so that it runs on its own.

| Script | Description |
|---|---|
| `npm start` | serves the demo |
| `npm run build` | builds the demo |
| `npm run build:lib` | builds the library in `dist/aisuite-eu-ngtools` |
| `npm run test:lib` | unit tests of the library |
| `npm run lint` | lint (angular-eslint) of the library and of the demo |

## Releasing @aisuite-eu/ngtools
1. Give the same new version to `package.json` and `projects/aisuite-eu-ngtools/package.json`, and a `## <version>` heading to
   [changelog.md](projects/aisuite-eu-ngtools/changelog.md). The workflow refuses a release when they disagree.
2. Merge to `master`. [npm-publish.yml](.github/workflows/npm-publish.yml) lints, tests, builds and **stages** the package on npm, with a draft GitHub Release.
3. Approve the staged package with 2FA (Staged Packages tab on npmjs.com, or `npm stage list @aisuite-eu/ngtools` then `npm stage approve <stage-id>`),
   then publish the draft GitHub Release, which creates the `v<version>` tag. To reject, `npm stage reject <stage-id>` and delete the draft release.

Pull requests run the same checks without staging. The first version of a package cannot be staged: publish it by hand from
`dist/aisuite-eu-ngtools` (`npm run build:lib`, then `npm publish --access public`), then configure the trusted publisher of the package
on npmjs.com (GitHub Actions, repository `fmenci/aisuite-eu`, workflow `npm-publish.yml`, stage only). There is no npm token in the repository.

## @aisuite-eu/ngtools
In this library, please find more detailled description in its readme.md file, a set of components is provided, see [projects/aisuite-eu-ngtools](projects/aisuite-eu-ngtools/README.md).

## Licence
This software is provided under GNU GPL v3 licence (SPDX: GPL-3.0-only), see [LICENSE.txt](LICENSE.txt).
Copyright (c) 2021-2026 Franck Menci

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published 
by the Free Software Foundation, version 3.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or 
FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.


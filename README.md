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

## @aisuite-eu/ngtools
In this library, please find more detailled description in its readme.md file, a set of components is provided, see [projects/aisuite-eu-ngtools](projects/aisuite-eu-ngtools/README.md).

## Licence
This software is provided under GNU GPL v3 licence.
Copyright (c) 2008/2021 Franck Menci

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published 
by the Free Software Foundation, version 3.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or 
FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.


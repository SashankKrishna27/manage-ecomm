# NestJS Category Management API

This is a NestJS-based REST API application that provides category management functionality.

## Technology Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: MongoDB (with Mongoose)
- **Testing**: Jest

## Project Structure
src/
├── category/
│ ├── category.controller.spec.ts
│ └── stubs/
│ └── category.stub.ts
├── shared/
│ └── schema/
│ └── category.schema.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts

## Install dependencies
npm install

## Running the application
npm run start

#### Development mode
npm run start:dev

#### Watch mode
npm run start:debug

#### Production mode
npm run start:prod

## Unit testing
npm run test

## API Documentation
Base path http//:<domain>/api/v1/category
### Category Endpoints
#### GET /category/tree
Retrieves all categories

#### POST /category
Creates a new category
json
{
"name": "Category Name",
}

#### PATCH /category/:id
Updates a category
json
{
    "name": "Updated Category Name",
    "parentId": "67e44d66531ce054fef9fd63",
}

#### DELETE /category/:id
Disables a category

#### DELETE /category/permanent/:id
Deletes a category.

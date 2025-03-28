import { categoryStub, deleteCategoryStub } from '../stubs/category.stub';

export const CategoryService = jest.fn().mockReturnValue({
  find: jest.fn().mockResolvedValue(categoryStub()),
  create: jest.fn().mockResolvedValue(categoryStub()),
  update: jest.fn().mockResolvedValue(categoryStub()),
  remove: jest.fn().mockResolvedValue(categoryStub()),
  permanentRemove: jest.fn().mockResolvedValue(deleteCategoryStub()),
});

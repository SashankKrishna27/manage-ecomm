import { Category } from '../../shared/schema/category.schema';

export const categoryStub = (): Category => {
  const timestamp = new Date();
  return {
    name: 'Test category',
    parentId: null,
    isActive: true,
    path: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

export const deleteCategoryStub = () => {
  return {
    message: 'category deleted successfully for ID: 67e651ccef8df9aecb01037d',
    statusCode: 200,
    response: {
      acknowledged: true,
      deletedCount: 1,
    },
  };
};

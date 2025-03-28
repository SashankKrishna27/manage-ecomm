import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from '../shared/schema/category.schema';
import { categoryStub, deleteCategoryStub } from './stubs/category.stub';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

jest.mock('./category.service');

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [CategoryService],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
    jest.clearAllMocks();
  });

  // Verify controller instantiation
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /**
   * Test suite for finding categories
   * Tests the behavior of the find method
   */
  describe('find', () => {
    describe('when find is called', () => {
      let categories: Category[];

      // Execute the find operation before each test
      beforeEach(async () => {
        categories = await controller.find();
      });

      // Verify that the service method was called
      test('then it should call findService', () => {
        expect(service.find).toHaveBeenCalled();
      });

      // Verify the returned data structure
      test('then it should return a category', () => {
        expect(categories).toEqual({
          ...categoryStub(),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });
    });
  });

  /**
   * Test suite for category creation
   * Validates the creation process and returned data
   */
  describe('create', () => {
    describe('when create is called', () => {
      let category;
      let createCategoryDto: CreateCategoryDto;

      // Set up test data and execute creation before each test
      beforeEach(async () => {
        createCategoryDto = {
          name: categoryStub().name,
          parentId: categoryStub().parentId?.toString(),
        };
        category = await controller.create(createCategoryDto);
      });

      // Verify service method call with correct parameters
      test('then it should call category service', () => {
        expect(service.create).toHaveBeenCalledWith(createCategoryDto);
      });

      // Validate the returned category object
      test('then it should return a category', () => {
        expect(category).toEqual({
          ...categoryStub(),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });
    });
  });

  /**
   * Test suite for category updates
   * Validates the update process and returned data
   */
  describe('update', () => {
    describe('when update category is called', () => {
      let updateCategoryDto: UpdateCategoryDto;
      let category: Category;
      const id = '67e57db77ccaab16f466eb18';

      // Prepare test data and execute update before each test
      beforeEach(async () => {
        updateCategoryDto = {
          name: 'Updated Category',
          parentId: '67e57db77ccaab16f466eb28',
          isActive: true,
        };
        category = await controller.update(id, updateCategoryDto);
      });

      // Verify service method call with correct parameters
      test('then it should call category service', () => {
        expect(service.update).toHaveBeenCalledWith(id, updateCategoryDto);
      });

      // Validate the returned updated category
      test('then it should return a category', () => {
        expect(category).toEqual({
          ...categoryStub(),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });
    });
  });

  /**
   * Test suite for permanent category deletion
   * Validates the permanent removal process
   */
  describe('permanentRemove', () => {
    describe('when permanent remove category is called', () => {
      let category: Category;
      const id = '67e57db77ccaab16f466eb18';

      // Execute permanent removal before each test
      beforeEach(async () => {
        category = await controller.permanentRemove(id);
      });

      // Verify service method call with correct ID
      test('then it should call category service', () => {
        expect(service.permanentRemove).toHaveBeenCalledWith(id);
      });

      // Validate the deletion response
      test('then it should return an object stating the deletion of the record', () => {
        expect(category).toEqual(deleteCategoryStub());
      });
    });
  });

  /**
   * Test suite for soft deletion (making category inactive)
   * Validates the soft delete process and returned data
   */
  describe('remove', () => {
    describe('when remove category to make it inactive is called', () => {
      let category: Category;
      const id = '67e57db77ccaab16f466eb18';

      // Execute soft delete before each test
      beforeEach(async () => {
        category = await controller.remove(id);
      });

      // Verify service method call with correct ID
      test('then it should call category service', () => {
        expect(service.remove).toHaveBeenCalledWith(id);
      });

      // Validate the returned disabled category
      test('then it should return the category which is disabled', () => {
        expect(category).toEqual({
          ...categoryStub(),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });
    });
  });
});

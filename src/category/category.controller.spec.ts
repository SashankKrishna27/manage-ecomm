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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // code block for finding categories.
  describe('find', () => {
    describe('when find is called', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let categories: Category[];
      beforeEach(async () => {
        categories = await controller.find();
      });

      test('then it should call findService', () => {
        expect(service.find).toHaveBeenCalled();
      });

      test('then it should return a category', () => {
        expect(categories).toEqual({
          ...categoryStub(),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });
    });
  });

  // code block for creating a category
  describe('create', () => {
    describe('when create is called', () => {
      let category;
      let createCategoryDto: CreateCategoryDto;

      beforeEach(async () => {
        createCategoryDto = {
          name: categoryStub().name,
          parentId: categoryStub().parentId?.toString(),
        };
        category = await controller.create(createCategoryDto);
      });

      test('then it should call category service', () => {
        expect(service.create).toHaveBeenCalledWith(createCategoryDto);
      });

      test('then it should return a category', () => {
        expect(category).toEqual({
          ...categoryStub(),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });
    });
  });

  // code block for updating a category
  describe('update', () => {
    describe('when update category is called', () => {
      let updateCategoryDto: UpdateCategoryDto;
      let category: Category;
      const id = '67e57db77ccaab16f466eb18';

      beforeEach(async () => {
        updateCategoryDto = {
          name: 'Updated Category',
          parentId: '67e57db77ccaab16f466eb28',
          isActive: true,
        };
        category = await controller.update(id, updateCategoryDto);
      });

      test('then it should call category service', () => {
        expect(service.update).toHaveBeenCalledWith(id, updateCategoryDto);
      });

      test('then it should return a category', () => {
        expect(category).toEqual({
          ...categoryStub(),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });
    });
  });

  // code block to delete a category permanently.
  describe('permanentRemove', () => {
    describe('when permanent remove category is called', () => {
      let category: Category;
      const id = '67e57db77ccaab16f466eb18';

      beforeEach(async () => {
        category = await controller.permanentRemove(id);
      });

      test('then it should call category service', () => {
        expect(service.permanentRemove).toHaveBeenCalledWith(id);
      });

      test('then it should return an object stating the deletion of the record', () => {
        expect(category).toEqual(deleteCategoryStub());
      });
    });
  });

  // code block to delete a category by making it inactive.
  describe('remove', () => {
    describe('when remove category to make it inactive is called', () => {
      let category: Category;
      const id = '67e57db77ccaab16f466eb18';

      beforeEach(async () => {
        category = await controller.remove(id);
      });

      test('then it should call category service', () => {
        expect(service.remove).toHaveBeenCalledWith(id);
      });

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

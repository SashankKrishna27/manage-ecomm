import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from '../shared/schema/category.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    let path = [];

    // If parent exists, find its level and path
    if (createCategoryDto.parentId) {
      const parent = await this.categoryModel.findById(
        createCategoryDto.parentId,
      );
      if (!parent) {
        throw new NotFoundException(
          `Parent category with ID ${createCategoryDto.parentId} not found`,
        );
      }

      path = [...parent.path, parent._id.toString()];
    }
    const newCategory = new this.categoryModel({
      ...createCategoryDto,
      path,
      parentId: createCategoryDto.parentId
        ? new Types.ObjectId(createCategoryDto.parentId)
        : null,
    });

    return newCategory.save();
  }

  async find() {
    const categories = await this.categoryModel.find({ isActive: true }).exec();

    // Convert flat list to tree structure
    const categoriesMap = {};
    const rootCategories = [];

    // First, create a map of all categories
    categories.forEach((category) => {
      categoriesMap[category._id.toString()] = {
        _id: category._id,
        name: category.name,
        children: [],
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };
    });
    // Then build the tree
    categories.forEach((category) => {
      if (category.parentId) {
        const parentId = category.parentId.toString();
        if (categoriesMap[parentId]) {
          categoriesMap[parentId].children.push(
            categoriesMap[category._id.toString()],
          );
        }
      } else {
        rootCategories.push(categoriesMap[category._id.toString()]);
      }
    });

    return rootCategories;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryModel.findOne({ _id: id });
    // Handle parent change if needed
    if (
      updateCategoryDto.parentId !== undefined &&
      updateCategoryDto.parentId !== category.parentId?.toString()
    ) {
      // Check if the new parent exists
      let newPath = [];

      if (updateCategoryDto.parentId) {
        const parent = await this.categoryModel.findOne({
          _id: updateCategoryDto.parentId,
        });
        newPath = [...parent.path, parent._id.toString()];

        // Prevent circular references
        if (parent.path.includes(id)) {
          throw new BadRequestException(
            'Cannot set a child as the parent (circular reference)',
          );
        }
      }

      // Update the path of this category
      category.path = newPath;
      category.parentId = updateCategoryDto.parentId
        ? new Types.ObjectId(updateCategoryDto.parentId)
        : null;

      // Update children's levels and paths (cascading update)
      await this.updateChildrenPaths(id);
    }

    if (updateCategoryDto.name !== undefined) {
      category.name = updateCategoryDto.name;
    }

    category.updatedAt = new Date(Date.now());

    return category.save();
  }

  private async updateChildrenPaths(parentId: string): Promise<void> {
    const parent = await this.categoryModel.findOne({ _id: parentId });
    const children = await this.categoryModel
      .find({ parentId: new Types.ObjectId(parentId) })
      .exec();

    for (const child of children) {
      child.path = [...parent.path, parent._id.toString()];
      await child.save();

      // Recursively update grandchildren
      await this.updateChildrenPaths(child._id.toString());
    }
  }

  async remove(id: string): Promise<Category> {
    // First check if it has children
    const hasChildren = await this.categoryModel.exists({
      parentId: new Types.ObjectId(id),
      isActive: true,
    });

    if (hasChildren) {
      throw new BadRequestException(
        `Cannot delete a category that has active children`,
      );
    }

    const category = await this.categoryModel.findOne({ _id: id });
    category.isActive = false;
    category.updatedAt = new Date(Date.now());
    return category.save();
  }

  async permanentRemove(id: string): Promise<any> {
    // First check if it has children
    const hasChildren = await this.categoryModel.exists({
      parentId: new Types.ObjectId(id),
      isActive: true,
    });

    if (hasChildren) {
      throw new BadRequestException(
        `Cannot delete a category that has active children`,
      );
    }

    const category = await this.categoryModel.deleteOne({ _id: id });
    if (category.deletedCount === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return {
      message: `category deleted successfully for ID: ${id}`,
      statusCode: 200,
      response: category,
    };
  }
}

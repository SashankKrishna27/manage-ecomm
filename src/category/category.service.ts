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

  /**
   * Creates a new category in the system.
   * If a parentId is provided, the new category will be created as a child of that parent.
   * @param createCategoryDto - Data transfer object containing category creation details
   * @returns Newly created category
   */
  async create(createCategoryDto: CreateCategoryDto) {
    // Initialize empty path array for category hierarchy
    let path = [];

    // If parent category is specified, validate and set up hierarchical path
    if (createCategoryDto.parentId) {
      const parent = await this.categoryModel.findById(
        createCategoryDto.parentId,
      );
      if (!parent) {
        throw new NotFoundException(
          `Parent category with ID ${createCategoryDto.parentId} not found`,
        );
      }
      // Construct path by combining parent's path with parent's ID
      path = [...parent.path, parent._id.toString()];
    }

    // Create new category instance with processed data
    const newCategory = new this.categoryModel({
      ...createCategoryDto,
      path,
      // Convert parentId to ObjectId or set null if no parent
      parentId: createCategoryDto.parentId
        ? new Types.ObjectId(createCategoryDto.parentId)
        : null,
    });

    return newCategory.save();
  }

  /**
   * Retrieves all active categories and organizes them into a tree structure.
   * @returns Array of root categories with nested children
   */
  async find() {
    // Fetch all active categories from database
    const categories = await this.categoryModel.find({ isActive: true }).exec();

    // Initialize data structures for tree conversion
    const categoriesMap = {};
    const rootCategories = [];

    // Create a map of all categories with initialized children arrays
    categories.forEach((category) => {
      categoriesMap[category._id.toString()] = {
        _id: category._id,
        name: category.name,
        children: [],
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };
    });

    // Build the tree structure by linking children to their parents
    categories.forEach((category) => {
      if (category.parentId) {
        const parentId = category.parentId.toString();
        if (categoriesMap[parentId]) {
          // Add category to its parent's children array
          categoriesMap[parentId].children.push(
            categoriesMap[category._id.toString()],
          );
        }
      } else {
        // Add categories without parents to root level
        rootCategories.push(categoriesMap[category._id.toString()]);
      }
    });

    return rootCategories;
  }

  /**
   * Updates an existing category with new information.
   * Handles parent changes and updates hierarchical paths accordingly.
   * @param id - ID of the category to update
   * @param updateCategoryDto - Data transfer object containing update details
   * @returns Updated category
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    // Find the category to update
    const category = await this.categoryModel.findOne({ _id: id });

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${category.parentId} not found`,
      );
    }

    // Handle parent category changes if specified
    if (
      updateCategoryDto.parentId !== undefined &&
      updateCategoryDto.parentId !== category.parentId?.toString()
    ) {
      let newPath = [];

      if (updateCategoryDto.parentId) {
        // Validate and fetch new parent category
        const parent = await this.categoryModel.findOne({
          _id: updateCategoryDto.parentId,
        });
        if (!parent) {
          throw new NotFoundException(
            `Category with ID ${updateCategoryDto.parentId} not found`,
          );
        }
        // Construct new path based on parent's hierarchy
        newPath = [...parent.path, parent._id.toString()];

        // Prevent circular references in hierarchy
        if (parent.path.includes(id)) {
          throw new BadRequestException(
            'Cannot set a child as the parent (circular reference)',
          );
        }
      }

      // Update category's path and parent reference
      category.path = newPath;
      category.parentId = updateCategoryDto.parentId
        ? new Types.ObjectId(updateCategoryDto.parentId)
        : null;

      // Update paths of all child categories
      await this.updateChildrenPaths(id);
    }

    // Update category name if provided
    if (updateCategoryDto.name !== undefined) {
      category.name = updateCategoryDto.name;
    }

    // Update timestamp
    category.updatedAt = new Date(Date.now());

    return category.save();
  }

  /**
   * Recursively updates the paths of all child categories when a parent's path changes.
   * @param parentId - ID of the parent category whose children need path updates
   */
  private async updateChildrenPaths(parentId: string): Promise<void> {
    // Find the parent category
    const parent = await this.categoryModel.findOne({ _id: parentId });
    if (!parent) {
      throw new NotFoundException(`Category with ID ${parentId} not found`);
    }

    // Find all immediate children of the parent
    const children = await this.categoryModel
      .find({ parentId: new Types.ObjectId(parentId) })
      .exec();

    if (!children.length) {
      throw new NotFoundException(
        `Child categories with ID ${parentId} not found`,
      );
    }

    // Update each child's path and recursively update their children
    for (const child of children) {
      child.path = [...parent.path, parent._id.toString()];
      await child.save();

      // Recursively update grandchildren
      await this.updateChildrenPaths(child._id.toString());
    }
  }

  /**
   * Soft deletes a category by marking it as inactive.
   * Cannot delete categories with active children.
   * @param id - ID of the category to remove
   * @returns Updated category with isActive set to false
   */
  async remove(id: string): Promise<Category> {
    // Check for active children
    const hasChildren = await this.categoryModel.exists({
      parentId: new Types.ObjectId(id),
      isActive: true,
    });

    if (hasChildren) {
      throw new BadRequestException(
        `Cannot delete a category that has active children`,
      );
    }

    // Find and soft delete the category
    const category = await this.categoryModel.findOne({ _id: id });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    category.isActive = false;
    category.updatedAt = new Date(Date.now());
    return category.save();
  }

  /**
   * Permanently deletes a category from the database.
   * Cannot delete categories with active children.
   * @param id - ID of the category to permanently remove
   * @returns Deletion status and response
   */
  async permanentRemove(id: string): Promise<any> {
    // Check for active children
    const hasChildren = await this.categoryModel.exists({
      parentId: new Types.ObjectId(id),
      isActive: true,
    });

    if (hasChildren) {
      throw new BadRequestException(
        `Cannot delete a category that has active children`,
      );
    }

    // Permanently delete the category
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
